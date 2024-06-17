<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';

$db = new \com\elmakers\love\LoveDatabase();
$admin = new \com\elmakers\love\LoveAdminDatabase();

$characters = $db->getCharacters();

foreach ($characters as $character) {
    if (!isset($character['images']['portrait'])) {
        $portrait = $character['portrait'];
        $newRecord = array(
            'image_id' => 'portrait',
            'persona_id' => $character['id'],
            'title' => 'Portrait',
            'description' => "This character's headshot",
            'tags' => 'portrait,current',
        );
        if ($portrait) {
            if (isset($portrait['version'])) {
                $newRecord['version'] = $portrait['version'];
                unset($portrait['version']);
            }
            unset($portrait['offset']);
            if ($portrait) {
                $newRecord['metadata'] = json_encode($portrait);
            }
        }
        echo "Saving profile image for {$character['id']}\n";
        $admin->insert('persona_image', $newRecord);
    }
    if (!isset($character['images']['full'])) {
        $full = $character['image'];
        $newRecord = array(
            'image_id' => 'full',
            'persona_id' => $character['id'],
            'title' => 'Full Body',
            'description' => "This character's full body image",
            'tags' => 'full,current',
        );
        if ($full) {
            if (isset($full['version'])) {
                $newRecord['version'] = $full['version'];
                unset($full['version']);
            }
            unset($full['offset']);
            if ($full) {
                $newRecord['metadata'] = json_encode($full);
            }
        }
        $admin->insert('persona_image', $newRecord);
        echo "Saving full image for {$character['id']}\n";
    }
}
