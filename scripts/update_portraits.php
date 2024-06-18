<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: create_portraits <character folder>\n");
}

require_once '../data/LoveDatabase.class.php';

$db = new \com\elmakers\love\LoveDatabase();
$characters = $db->getCharacters();

$characterFolder = $argv[1];
foreach ($characters as $character) {
    $characterId = $character['id'];
    if (!isset($character['images']['full']) || !isset($character['images']['portrait'])) {
        echo "Skipping $characterId, no full or portrait image available\n";
        continue;
    }
    echo "Update portrait for $characterId\n";
    $db->createPortrait($character['images']['portrait']);
}