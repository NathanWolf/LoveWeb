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
    foreach ($alternatives as $alternative) {
        $label = $alternative['label'];
        $idSuffix = $db->convertLabelToId($label);
        $variantCharacterId = $characterId . '_' . $idSuffix;

        // Do a quick-check to skip rather than relying on the db
        if (isset($character['variants'][$variantCharacterId])) {
            echo "Skipping $variantCharacterId, already exists\n";
            continue;
        }
        $variantChat = json_encode(array('system' => $alternative['system']));
        $db->createVariant($characterId, $label, $variantChat);
        echo "Created new variant: $variantCharacterId\n";
    }
}
