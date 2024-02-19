<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveAdminDatabase.class.php';

$characters = json_decode(file_get_contents('../data/characters.json'), true);
if (!$characters) {
    die("Could not parse characters.json\n");
}

$db = new \com\elmakers\love\LoveAdminDatabase();

$newCharacters = array();
foreach ($characters as $characterId => $character) {
    $existing = $db->get('persona', $characterId);
    if ($existing) {
        // Not sure we need this.
    } else {
        $newCharacter = array('id' => $characterId,
            'first_name' => $character['name'],
            'portrait' => isset($character['portrait']) ? json_encode($character['portrait']) : null,
            'chat' => isset($character['chat']) ? json_encode($character['chat']) : null,
        );
        echo "Adding $characterId\n";
        $db->insert('persona', $newCharacter);
        $character['id'] = $characterId;
        $newCharacters[] = $character;
    }
}

// Separate loop to make sure relationships can work
foreach ($newCharacters as $character) {
    if (isset($character['relationships'])) {
        foreach ($character['relationships'] as $relationshipId => $relations) {
            if (!is_array($relations)) {
                $relations = array($relations);
            }
            foreach ($relations as $related) {
                $newRelationship = array(
                    'persona_id' => $character['id'],
                    'relationship_id' => $relationshipId,
                    'related_persona_id' => $related
                );
                echo "Adding relationship {$character['id']} $relationshipId -> $related\n";
                $db->insert('persona_relationship', $newRelationship);
            }
        }
    }
    if (isset($character['tiers'])) {
        foreach ($character['tiers'] as $tierListId => $tierId) {
            $newTier = array(
                'persona_id' => $character['id'],
                'tier_list_id' => $tierListId,
                'tier_id' => $tierId
            );
            echo "Adding tier {$character['id']} $tierListId -> $tierId\n";
            $db->insert('persona_tier', $newTier);
        }
    }
}
echo "Done.\n";

