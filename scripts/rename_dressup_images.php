<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';

$db = new \com\elmakers\love\LoveDatabase();
$admin = new \com\elmakers\love\LoveAdminDatabase();

$characters = $db->getCharacters();
$dressup = $db->getDressupPersona();
$categories = $db->getDressupCategories();

foreach ($dressup as $dressupCharacter) {
    foreach ($dressupCharacter['items'] as $categoryId => $items) {
        foreach ($items as $itemId => $item) {
            $title = $db::makeOutfitItemTitle($categoryId, $itemId);
            $item['title'] = $title;
            $admin->saveDressupItemTitle($item);
            echo "Set $categoryId::$itemId to $title\n";
        }
    }
}
