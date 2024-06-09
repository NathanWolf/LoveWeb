<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: update_portraits.php <character folder>\n");
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';

$db = new \com\elmakers\love\LoveDatabase();
$admin = new \com\elmakers\love\LoveAdminDatabase();
$characters = $db->getCharacters();

$characterFolder = $argv[1];
$targetWidth = 256;
$targetHeight = 256;

function endsWith($haystack, $needle){
    $length = strlen($needle);
    return (substr($haystack, -$length) === $needle);
}

$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if (!$fileInfo->isDir()) continue;
    $foldername = $fileInfo->getPathname();
    $filename = $foldername . "/full.png";
    if (!file_exists($filename)) continue;
    $base = basename($foldername);
    $characterId = $base;
    if (!isset($characters[$characterId])) {
        echo "Unknown character: $characterId\n";
        continue;
    }
    $character = $characters[$characterId];
    $centerXPercentage = 0.5;
    $centerYPercentage = 0.1;
    $offset = array('0.5', '0.1');
    $portrait = $character['portrait'] ?: array();

    if (isset($portrait['offset'])) {
        list($centerXPercentage, $centerYPercentage) = $portrait['offset'];
    } else {
        $portrait['offset'] = array($centerXPercentage, $centerYPercentage);
    }

    $image = imagecreatefrompng($filename);
    if (!$image) {
        echo " Error loading $filename\n";
        continue;
    }

    list($width, $height) = getimagesize($filename);
    echo "Processing $characterId ($width x $height)\n";
    $centerX = floor($centerXPercentage * $width);
    $centerY = floor($centerYPercentage * $height);
    $cropSize = $centerY * 2;

    // Move center down so the top is aligned with the first non-transparent part of the image
    $foundX = 0;
    $foundY = 0;
    for ($y = 0; $y < $height && !$foundX; $y++){
        for ($x = 0; $x < $width && !$foundX; $x++){
            $pixel = imagecolorat($image, $x, $y);
            $alpha = ($pixel & 0x7F000000) >> 24;
            $colors = imagecolorsforindex($image, $pixel);
            $a = $colors['alpha'];
            if ($alpha != 127) {
                $foundX = $x;
                $foundY = $y;
            }
        }
    }
    if (!$foundX) {
        echo " Could not find a non-transparent pixel in $filename\n";
    } else if ($foundY > 0) {
        echo " Found top at $foundX,$foundY, shifting down\n";
        $centerY += $foundY;
    }

    // Expand horizontally if needed
    $overflowLeft = floor($cropSize / 2) - $centerX;
    $overflowRight = $centerX + floor($cropSize / 2) - $width;
    if ($overflowLeft > 0 || $overflowRight > 0) {
        $offset = $overflowLeft > 0 ? $overflowLeft : 0;
        $overflow = max($overflowLeft, $overflowRight);
        $cropWidth = $width + $overflow * 2;
        echo " Expanding width from $width to $cropWidth\n";
        $width = $cropWidth;
        $centerX += $offset;
    }
    $cropX = $centerX - floor($cropSize / 2);
    $cropY = $centerY - floor($cropSize / 2);

    $centerX = floor($cropX + $cropSize / 2);
    $centerY = floor($cropY + $cropSize / 2);
    $radius = ceil($cropSize / 2);
    $portrait['radius'] = $radius;
    $portrait['center'] = array($centerX, $centerY);
    echo " Portrait: " . json_encode($portrait) . "\n";
    $admin->updatePortrait($characterId, $portrait);
}