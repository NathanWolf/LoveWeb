<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: move_images.php <folder>\n");
}

$imageFolder = $argv[1];

$characterImageFolder = "$imageFolder/characters";
$characterImages = new DirectoryIterator($characterImageFolder);
foreach ($characterImages as $file) {
    if ($file->isDir()) continue;
    if ($file->isDot()) continue;

    $pathname = $file->getPathname();
    if (!file_exists($pathname)) {
        die("Can't access file $pathname\n");
    }
    $pathinfo = pathinfo($pathname);

    if ($pathinfo['extension'] !== 'png') continue;

    $characterName = $pathinfo['filename'];
    $destinationFolder = "$imageFolder/characters/$characterName";
    $destinationFile = "$destinationFolder/full.png";
    if (file_exists($destinationFile)) {
        echo "* Skipping $destinationFile, file exists\n";
        continue;
    }
    mkdir($destinationFolder, 0777, true);
    echo "Moving $pathname to $destinationFile\n";
    rename($pathname, $destinationFile);
}

$portraitImageFolder = "$imageFolder/portraits";
$portraitImages = new DirectoryIterator($portraitImageFolder);
foreach ($portraitImages as $file) {
    if ($file->isDir()) continue;
    if ($file->isDot()) continue;

    $pathname = $file->getPathname();
    if (!file_exists($pathname)) {
        die("Can't access file $pathname\n");
    }
    $pathinfo = pathinfo($pathname);

    if ($pathinfo['extension'] !== 'png') continue;

    $characterName = $pathinfo['filename'];
    $destinationFolder = "$imageFolder/dynamic/characters/$characterName";
    $destinationFile = "$destinationFolder/portrait.png";
    if (file_exists($destinationFile)) {
        echo "* Skipping $destinationFile, file exists\n";
        continue;
    }
    mkdir($destinationFolder, 0777, true);
    echo "Moving $pathname to $destinationFile\n";
    rename($pathname, $destinationFile);
}

echo "Done.\n";