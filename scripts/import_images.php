<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 3) {
    die("Usage: import_images <import folder> <character folder>\n");
}

$importFolder = $argv[1];
$characterFolder = $argv[2];
$iterator = new DirectoryIterator($importFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if ($fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    $info = pathinfo($pathname);
    $filename = $info['filename'];
    $targetfolder = $characterFolder . '/' . $filename;
    if (!file_exists($targetfolder)) {
        echo "Creating $filename, target folder doesn't exist\n";
        mkdir($targetfolder);
    }
    $target =  $targetfolder . '/full.png';
    $target = str_replace('.png.PNG', '.png', $target);
    $target = strtolower($target);
    echo "Copying $pathname to $target\n";
    copy($pathname, $target);
}