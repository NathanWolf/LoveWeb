<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: import_images <import folder> [character folder]\n");
}

$importFolder = $argv[1];
$targetCharacterId = count($argv) > 2 ? $argv[2] : null;
$iterator = new DirectoryIterator($importFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if ($fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    $info = pathinfo($pathname);
    $filename = $info['filename'];
    $filename = strtolower($filename);
    if ($filename == 'other' || $filename == 'background') {
        echo "Skipping $filename\n";
        continue;
    }
    // Ughhh rename the layer please XD
    if ($filename == 'mable-anne') $filename = 'anne';
    $targetFolder = $characterFolder . '/' . $filename;
    if (!file_exists($targetFolder)) {
        echo "Creating $filename, target folder doesn't exist\n";
        mkdir($targetFolder);
    }
    $target =  $targetFolder . '/full.png';
    $target = str_replace('.png.PNG', '.png', $target);
    echo "Copying $pathname to $target\n";
    copy($pathname, $target);
}