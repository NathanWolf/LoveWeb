<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    $characterFolder = '../image/dynamic/characters';
} else {
    $characterFolder = $argv[1];
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';

$db = new \com\elmakers\love\LoveDatabase();
$admin = new \com\elmakers\love\LoveAdminDatabase();
$characters = $db->getCharacters(0, true);

$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if (!$fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    $fullImage = $pathname . '/full.png';
    if (!file_exists($fullImage)) continue;
    list($width, $height, $type, $attr) = getimagesize($fullImage);
    $info = pathinfo($pathname);
    $characterId = $info['filename'];
    if (!isset($characters[$characterId])) {
        $name = ucfirst($characterId);
        $newPersona = array('id' => $characterId, 'first_name' => $name);
        $admin->insert('persona', $newPersona);

        $newPersonaTier = array('persona_id' => $characterId, 'tier_list_id' => 'renown', 'tier_id' => 'minor');
        $admin->insert('persona_tier', $newPersonaTier);

        $newPersonaImage = array('persona_id' => $characterId, 'image_id' => 'full', 'title' => 'Full Body',
            'description' => "This character's full body image", 'metadata' => '{\"center\":[256,256]}',
            'tags' => 'full,current', 'width' => $width, 'height' => $height);
        $admin->insert('persona_image', $newPersonaImage);

        echo "Added new character: $characterId\n";
    }
}