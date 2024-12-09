<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 3) {
    die("Usage: create_portraits <character folder> <output folder> [width] [height] [number]\n");
}

require_once '../data/LoveDatabase.class.php';

$db = new \com\elmakers\love\LoveDatabase();
$limit = count($argv) > 5 ? $argv[5] : 0;
$characters = $db->getCharacters($limit);
$characterFolder = $argv[1];
$outputFolder = $argv[2];
if (!file_exists($outputFolder)) {
    die("Output folder does not exist: $outputFolder\n");
}
$targetWidth = count($argv) > 3 ? $argv[3] : 1024;
$targetHeight = count($argv) > 4 ? $argv[4] : 1024;

foreach ($characters as $character) {
    $characterId = $character['id'];
    if (!isset($character['images']['full']) || !isset($character['images']['portrait'])) {
        echo "Skipping $characterId, no full or portrait image available\n";
        continue;
    }
    $outputFilename = $outputFolder . '/' . $character['name'] . '.png';
    if (file_exists($outputFilename)) {
        echo "Skipping $characterId, file exists: $outputFilename\n";
        continue;
    }
    echo "Creating $outputFilename\n";
    $db->createPortrait($character['images']['portrait'], $targetWidth, $targetHeight, $outputFilename);
}