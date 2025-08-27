<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveAdminDatabase.class.php';

$db = new \com\elmakers\love\LoveAdminDatabase();

$characters = $db->getCharacters();
foreach ($characters as $characterId => $character) {
    $chat = $character['chat'];
    if (!$chat || !isset($chat['alternatives']) || !$chat['alternatives']) continue;
    $alternatives = $chat['alternatives'];
    foreach ($alternatives as $index => $alternative) {
        $label = $alternative['label'];
        $idSuffix = $db->convertLabelToId($label);
        $variantCharacterId = $characterId . '_' . $idSuffix;

        if (!isset($character['variants'][$variantCharacterId])) {
            echo "Skipping $variantCharacterId, variant does not exist\n";
            continue;
        }

        $sql = <<<SQL
update conversation set source_persona_id = :variant, source_alternative_id = null 
                    where source_alternative_id = :alt and source_persona_id = :character
SQL;
        $db->execute($sql, array(
            'alt' => $index,
            'character' => $characterId,
            'variant' => $variantCharacterId)
        );

        $sql = <<<SQL
update conversation set target_persona_id = :variant, target_alternative_id = null 
                    where target_alternative_id = :alt and target_persona_id = :character
SQL;
        $db->execute($sql, array(
            'alt' => $index,
                'character' => $characterId,
                'variant' => $variantCharacterId)
        );
        echo "Updated chats from $characterId:$index to $variantCharacterId\n";
    }
}
