<?php

namespace com\elmakers\love;

require_once 'LoveDatabase.class.php';

class LoveAdminDatabase extends LoveDatabase {
    public function __construct() {
        parent::__construct(true);
    }

    public function authorize($email, $token) {
        $user = $this->validateLogin($email, $token);
        if (!$user || !$user['admin']) {
            throw new Exception("Unauthorized user");
        }
    }

    public function updatePortrait($characterId, $portrait) {
        $record = array('id' => $characterId, 'portrait' => json_encode($portrait) );
        $this->save('persona', $record);
    }

    public function saveDressupItemTitle($dressupItem) {
        $sql = <<<SQL
UPDATE persona_dressup_item SET title = :title WHERE persona_id = :persona AND category_id = :category AND image_id = :item
SQL;
        $data = array(
            'title' => $dressupItem['title'],
            'persona' => $dressupItem['persona_id'],
            'category' => $dressupItem['category_id'],
            'item' => $dressupItem['image_id'],
        );
        $this->execute($sql, $data);
    }

    function convertLabelToId($label) {
        $id = $label;

        // Some hacky things in here for the transition
        switch ($id) {
            case "Newly created": $id = 'Origins'; break;
            case "After the incident": $id = 'Incident'; break;
            case "Young Pride": $id = 'Young'; break;
            case "400 years ago": $id = '400y'; break;
            case "Age 14": $id = '14yo'; break;
            case "During the war": $id = 'war'; break;
            case "During the Decaying Era": $id = 'decay'; break;
        }

        $id = str_replace(' ', '_', $id);
        $id = strtolower($id);
        return $id;
    }

    function createVariant($characterId, $variantLabel, $variantChat = null) {
        $characterImageFolder = dirname(__FILE__) . '/../image/dynamic/characters';

        $variantId = $this->convertLabelToId($variantLabel);
        $character = $this->getCharacter($characterId);
        if (!$character) {
            throw new Exception("Character $characterId does not exist");
        }
        $variantCharacterId = $characterId . '_' . $variantId;
        $existingCharacter = $this->getCharacter($variantCharacterId);
        if ($existingCharacter) {
            throw new Exception("Character $characterId already has a variant $variantCharacterId");
        }

        $newCharacter = array(
            'id' => $variantCharacterId,
            'base_id' => $characterId,
            'first_name' => $character['first_name'],
            'last_name' => $character['last_name'],
            'middle_name' => $character['middle_name'],
            'nick_name' => $character['nick_name'],
            'birth_name' => $character['birth_name'],
            'chat' => $variantChat,
            'variant_name' => $variantLabel,
            'portrait' => json_encode($character['portrait']),
            'description' => $character['description'],
            'birth_realm' => $character['birth_realm'],
            'home_realm' => $character['home_realm'],
            'notes' => $character['notes'],
            'first_name_references' => $character['first_name_references']
        );

        $this->insert('persona', $newCharacter);

        if ($characterImageFolder) {
            $sourceFolder = $characterImageFolder . '/' . $characterId;
            $targetFolder = $characterImageFolder . '/' . $variantCharacterId;
            if (!file_exists($targetFolder)) {
                mkdir($targetFolder);
            }
            if (file_exists($sourceFolder . '/full.png')) {
                copy($sourceFolder . '/full.png', $targetFolder . '/full.png');
            }
            if (file_exists($sourceFolder . '/portrait.png')) {
                copy($sourceFolder . '/portrait.png', $targetFolder . '/portrait.png');
            }
        }

        $newCharacterImages = array();
        $characterImages = $this->getCharacterImages($characterId);
        if (isset($characterImages['portrait'])) {
            $newCharacterImage = $characterImages['portrait'];
            $newCharacterImage['persona_id'] = $variantCharacterId;
            unset($newCharacterImage['created']);
            unset($newCharacterImage['updated']);
            $this->insert('persona_image', $newCharacterImage);
            $newCharacterImages['portrait'] = $newCharacterImage;
        }
        if (isset($characterImages['full'])) {
            $newCharacterImage = $characterImages['full'];
            $newCharacterImage['persona_id'] = $variantCharacterId;
            unset($newCharacterImage['created']);
            unset($newCharacterImage['updated']);
            $this->insert('persona_image', $newCharacterImage);
            $newCharacterImages['full'] = $newCharacterImage;
        }

        $newCharacter = $this->getCharacter($variantCharacterId);
        $newCharacter['images'] = $newCharacterImages;
        return $newCharacter;
    }

    public function updatePersonaTier($personaId, $tierListId, $tierId) {
        $sql = <<<SQL
INSERT INTO persona_tier (persona_id, tier_list_id, tier_id) values (:persona, :list, :tier)
ON DUPLICATE KEY UPDATE tier_id=VALUES(tier_id)
SQL;
        $parameters = array('persona' => $personaId, 'list' => $tierListId, 'tier' => $tierId);
        $this->execute($sql, $parameters);
    }
}
