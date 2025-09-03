<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: update_character_tiers <file.csv>\n");
}

$filename = $argv[1];

use com\elmakers\love\LoveAdminDatabase;

require_once '../data/config.inc.php';
require_once '../data/LoveAdminDatabase.class.php';

$file = null;
try {
    $db = new LoveAdminDatabase();
    $characters = $db->getCharacters();
    $tierLists = $db->getTierLists();

    echo "Loading $filename\n";

    $file = fopen($filename, "r");
    if ($file === false) {
        throw new Exception("Failed to open file $filename");
    }
    $headers = fgetcsv($file, null, ',', '"', '\\');
    if (!$headers) {
        throw new Exception("Failed to find header row in file $filename");
    }
    $headers = array_flip($headers);
    if (!isset($headers['CHARACTER'])) {
        throw new Exception("Failed to find character column in file $filename");
    }
    $characterIndex = $headers['CHARACTER'];
    $tiers = array();
    foreach ($headers as $tierId => $index) {
        if ($index == $characterIndex) continue;
        $tierId = strtolower($tierId);
        if (!isset($tierLists[$tierId])) {
            throw new Exception("Unknown tier list id: $tierId");
        }
        $tiers[$tierId] = $index;
    }

    while (($row = fgetcsv($file, null, ',', '"', '\\')) !== FALSE) {
        $characterId = strtolower($row[$characterIndex]);
        if (!isset($characters[$characterId])) {
            throw new Exception("Unknown character: $characterId");
        }

        echo "Updating character $characterId\n";
        foreach ($tiers as $tierId => $index) {
            $tierValue = strtolower($row[$index]);
            if (!$tierValue || $tierValue == 'none') continue;
            $tierValue = trim(explode(',', $tierValue)[0]);
            echo "  Setting $tierId to $tierValue\n";
            $db->updatePersonaTier($characterId, $tierId, $tierValue);
        }
    }

    fclose($file);
    $file = null;
} catch (Exception $ex) {
    echo "Unexpected exception: " . $ex->getMessage() . "\n";
    if ($file) {
        fclose($file);
    }
}

