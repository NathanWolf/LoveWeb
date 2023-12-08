<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 5) {
    die("Usage: create_portraits <character folder> <portrait folder> <width> <height>\n");
}

$characterFolder = $argv[1];
$portraitFolder = $argv[2];
$targetWidth = $argv[3];
$targetHeight = $argv[4];
$targetCharacter = null;

if (count($argv) > 5) {
    $targetCharacter = $argv[5];
}

$characterFile = dirname(__FILE__) . '/../data/characters.json';
if (!file_exists($characterFile)) {
    die("Can not find file: $characterFile\n");
}
$characters = json_decode(file_get_contents($characterFile), true);
if (!$characters) {
    die("Could not parse file: $characterFile\n");
}

function endsWith($haystack, $needle){
    $length = strlen($needle);
    return (substr($haystack, -$length) === $needle);
}

$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if ($fileInfo->isDir()) continue;
    $filename = $fileInfo->getFilename();
    if (!endsWith($filename, '.png')) continue;
    $base = basename($filename);
    $filename = $fileInfo->getPathname();
    $info = pathinfo($filename);
    $characterId = basename($filename, '.' . $info['extension']);
    if ($targetCharacter && $targetCharacter != $characterId) continue;
    if (!isset($characters[$characterId])) {
        echo "Unknown character: $characterId\n";
        continue;
    }
    $character = $characters[$characterId];
    if (!isset($character['portrait'])) {
        echo "Character has no portrait location set: $characterId\n";
        continue;
    }

    $image = imagecreatefrompng($filename);
    if (!$image) {
        echo " Error loading $filename\n";
        continue;
    }

    list($width, $height) = getimagesize($filename);
    echo "Processing $characterId ($width x $height)\n";
    list($centerXPercentage, $centerYPercentage) = $character['portrait'];
    $centerX = floor($centerXPercentage * $width);
    $centerY = floor($centerYPercentage * $height);
    $cropSize = $centerY * 2;

    // Expand horizontally if needed
    $overflowLeft = floor($cropSize / 2) - $centerX;
    $overflowRight = $centerX + floor($cropSize / 2) - $width;
    if ($overflowLeft > 0 || $overflowRight > 0) {
        $offset = $overflowLeft > 0 ? $overflowLeft : 0;
        $overflow = max($overflowLeft, $overflowRight);
        $cropWidth = $width + $overflow * 2;
        echo " Expanding width from $width to $cropWidth\n";
        $expanded = imagecreatetruecolor($cropWidth, $height);
        imagealphablending($expanded,false);
        imagesavealpha($expanded,true);
        $alpha = imagecolorallocatealpha($expanded, 0, 0, 0, 127);
        imagefilledrectangle($expanded, 0, 0, $cropWidth, $height, $alpha);
        // Center image
        $destinationX = ($cropWidth - $width) / 2;
        imagecopy($expanded, $image, $destinationX, 0, 0, 0, $width, $height);
        $image = $expanded;
        $width = $cropWidth;
        $centerX += $offset;
    }
    $cropX = $centerX - floor($cropSize / 2);
    $cropY = $centerY - floor($cropSize / 2);

    $crop = array(
        'x' => $cropX,
        'y' => $cropY,
        'width' => $cropSize,
        'height' => $cropSize
    );
    echo " Crop: " . json_encode($crop) . "\n";
    $cropped = imagecrop($image, $crop);
    $scaled = imagescale($cropped, $targetWidth, $targetHeight);
    imagesavealpha($scaled, true);
    $outputFilename = $portraitFolder . '/' . $base;
    imagepng($scaled, $outputFilename);
    echo " Wrote to $outputFilename\n";
}