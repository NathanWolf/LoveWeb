<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';


if (count($argv) < 2) {
    $characterFolder = '../image/dressup/characters';
} else {
    $characterFolder = $argv[1];
}

$db = new \com\elmakers\love\LoveDatabase();
$admin = new \com\elmakers\love\LoveAdminDatabase();

$characters = $db->getCharacters();
$dressup = $db->getDressupPersona();
$categories = $db->getDressupCategories();

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
        $pathname = $characterFileInfo->getPathname();
        $info = pathinfo($pathname);
        $categoryId = $info['filename'];
        if (!$categoryId) {
            continue;
        }
        if ($categoryId == 'base') {
            if (isset($dressup[$characterId])) {
                echo "Skipping $characterId/base, character already exists\n";
                continue;
            }
            list($width, $height, $type, $attr) = getimagesize($pathname);
            $newRecord = array(
                'persona_id' => $characterId,
                'width' => $width,
                'height' => $height
            );
            $admin->insert('persona_dressup', $newRecord);
            echo "Saving new dressup for $characterId, $width x $height\n";
            continue;
        }
        if (!$characterFileInfo->isDir()) {
            echo "Skipping $characterId/$categoryId, unknown file\n";
            continue;
        }
        if (!isset($categories[$categoryId])) {
            echo "Skipping $characterId/$categoryId, unknown category\n";
            continue;
        }

        $categoryIterator = new DirectoryIterator($pathname);
        foreach ($categoryIterator as $categoryFileInfo) {
            if ($categoryFileInfo->isDot()) continue;
            if ($categoryFileInfo->isDir()) continue;
            $pathname = $categoryFileInfo->getPathname();
            $info = pathinfo($pathname);
            $itemId = $info['filename'];
            if (!$itemId) {
                continue;
            }
            if (isset($dressup[$characterId]['items'][$categoryId][$itemId])) {
                echo "Skipping $characterId/$categoryId/$itemId, already exists\n";
                continue;
            }

            $title = $itemId;
            $title = str_replace('_', ' ', $title);
            $title = ucwords($title);

            $newRecord = array(
                'persona_id' => $characterId,
                'category_id' => $categoryId,
                'image_id' => $itemId,
                'title' => $title
            );
            $admin->insert('persona_dressup_item', $newRecord);
            echo "Saving new item for $characterId/$categoryId/$itemId as $title\n";
        }
    }
}
