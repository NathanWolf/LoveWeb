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

    echo "Processing $base\n";
    $image = imagecreatefrompng($filename);
    if (!$image) {
        echo " Error loading $filename\n";
        continue;
    }

    list($width, $height) = getimagesize($filename);

    $crop = array(
        'x' => 0,
        'y' => 0,
        'width' => $width,
        'height' => $width
    );
    $cropped = imagecrop($image, $crop);
    $scaled = imagescale($cropped, $targetWidth, $targetHeight);
    imagesavealpha($scaled, true);
    $outputFilename = $portraitFolder . '/' . $base;
    imagepng($scaled, $outputFilename);
    echo " Wrote to $outputFilename\n";
}