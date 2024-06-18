<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: insert_characters <character folder>\n");
}

require_once '../data/LoveDatabase.class.php';

$db = new \com\elmakers\love\LoveDatabase();
$characters = $db->getCharacters();

$characterFolder = $argv[1];
$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if (!$fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    if (!file_exists($pathname . '/full.png')) continue;
    $info = pathinfo($pathname);
    $characterId = $info['filename'];
    if (!isset($characters[$characterId])) {
        $name = ucfirst($characterId);
        echo "INSERT INTO persona (id, first_name) values ('$characterId', '$name');\n";
        echo "INSERT INTO persona_tier (persona_id, tier_list_id, tier_id) values ('$characterId', 'renown', 'minor');\n";
        echo "INSERT INTO persona_image (persona_id, image_id, title, description, metadata, tags) values ('$characterId', 'full', 'Full Body', 'This character\\'s full body image', '{\"center\":[256,256]}', 'full,current');\n";
    }
}