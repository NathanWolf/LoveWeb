<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';

if (count($argv) < 2) {
    die("Usage: update_images <character folder>\n");
}

$db = new \com\elmakers\love\LoveDatabase();
$admin = new \com\elmakers\love\LoveAdminDatabase();

$characters = $db->getCharacters();

$characterFolder = $argv[1];
$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if (!$fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    $info = pathinfo($pathname);
    $characterId = $info['filename'];
    if (!isset($characters[$characterId])) {
        echo "Skipping $characterId, unknown\n";
        continue;
    }

    $character = $characters[$characterId];
    $characterIterator = new DirectoryIterator($pathname);

    foreach ($characterIterator as $characterFileInfo) {
        if ($characterFileInfo->isDot()) continue;
        if ($characterFileInfo->isDir()) continue;
        $pathname = $characterFileInfo->getPathname();
        $info = pathinfo($pathname);
        $imageId = $info['filename'];
        if (!$imageId || !isset($character['images'][$imageId])) {
            echo "Skipping $characterId $imageId, not yet imported\n";
            continue;
        }
        list($width, $height, $type, $attr) = getimagesize($pathname);

        $updateRecord = array(
            'image_id' => $imageId,
            'persona_id' => $characterId,
            'width' => $width,
            'height' => $height
        );
        echo "Saving image for $characterId $imageId as $width x $height\n";
        $admin->save('persona_image', $updateRecord, 'image_id', 'persona_id');
    }
}
