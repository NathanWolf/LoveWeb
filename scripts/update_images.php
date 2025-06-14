<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';

if (count($argv) < 2) {
    die("Usage: update_images <character folder> [character] [image]\n");
}

$db = new \com\elmakers\love\LoveDatabase();
$admin = new \com\elmakers\love\LoveAdminDatabase();

$characters = $db->getCharacters();

$characterFolder = $argv[1];
$targetCharacterId = count($argv) > 2 ? $argv[2] : null;
$targetImageId = count($argv) > 3 ? $argv[3] : null;
$bumpVersion = in_array('--version', $argv);
$forceUpdate = in_array('--force', $argv);
$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if (!$fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    $info = pathinfo($pathname);
    $characterId = $info['filename'];
    if ($targetCharacterId && $targetCharacterId != $characterId) {
        continue;
    }
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
        if ($targetImageId && $targetImageId != $imageId) {
            continue;
        }
        if (!$imageId || !isset($character['images'][$imageId])) {
            echo "Skipping $characterId $imageId, not yet imported\n";
            continue;
        }
        list($width, $height, $type, $attr) = getimagesize($pathname);


        if (!$forceUpdate && $character['images'][$imageId]['width'] == $width && $character['images'][$imageId]['height'] == $height) {
            echo "Skipping $characterId $imageId, size has not changed\n";
            continue;
        }

        $updateRecord = array(
            'image_id' => $imageId,
            'persona_id' => $characterId,
            'width' => $width,
            'height' => $height
        );

        $versionString = '';
        if ($bumpVersion) {
            $updateRecord['version'] = $character['images'][$imageId]['version'] + 1;
            $versionString = ' with version ' . $updateRecord['version'];
        }
        echo "Saving image for $characterId $imageId as $width x $height $versionString\n";
        $admin->save('persona_image', $updateRecord, 'image_id', 'persona_id');
    }
}
