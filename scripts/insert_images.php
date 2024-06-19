<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';

if (count($argv) < 2) {
    die("Usage: insert_images <character folder>\n");
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
        if (isset($character['images'][$imageId])) {
            // echo "Skipping $characterId $imageId, already exists\n";
            continue;
        }
        list($width, $height, $type, $attr) = getimagesize($pathname);
        $title = 'Unknown Image';
        $description = '';
        $tags = '';
        if (strpos($imageId, '_v') !== FALSE) {
            $description = "An older version of this character's design";
            if (strpos($imageId, 'full') !== FALSE) {
                $title = 'Previous Full Body Image';
                $tags = 'full,old';
            } else {
                $tags = 'old';
            }
        } else {
            if (strpos($imageId, 'full') !== FALSE) {
                $description = "This character's full body image";
                $title = 'Full Body';
                $tags = 'full,current';
            } else if (strpos($imageId, 'portrait') !== FALSE) {
                $description = "This character's headshot";
                $title = 'Portrait';
                $tags = 'portrait,current';
            }
        }
        $newRecord = array(
            'image_id' => $imageId,
            'persona_id' => $characterId,
            'title' => $title,
            'description' => $description,
            'tags' => $tags,
            'width' => $width,
            'height' => $height
        );
        // $admin->insert('persona_image', $newRecord);
        echo "Saving image for $characterId $imageId as $title\n";
    }
}
