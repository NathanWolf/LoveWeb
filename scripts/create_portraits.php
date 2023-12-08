<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 3) {
    die("Usage: create_portraits <character folder> <portrait folder>\n");
}

$characterFolder = $argv[1];
$portraitFolder = $argv[2];


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
    $foundX = 0;
    $foundY = 0;
    for ($y = 0; $y < $height && !$foundX; $y++){
        for ($x = 0; $x < $width && !$foundX; $x++){
            $pixel = imagecolorat($image, $x, $y);
            $alpha = ($pixel & 0x7F000000) >> 24;
            $colors = imagecolorsforindex($image, $pixel);
            $a = $colors['alpha'];
            if ($alpha != 127) {
                echo "$alpha\n";
                $foundX = $x;
                $foundY = $y;
            }
        }
    }
    if (!$foundX) {
        echo " Could not find a non-transparent pixel in $filename\n";
        continue;
    }

    echo " Found top at $foundX,$foundY\n";
}