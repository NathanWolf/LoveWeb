<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: create_portraits <character folder>\n");
}

$characterFolder = $argv[1];
$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if (!$fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    $original = $pathname . '/full.png';
    $target = $pathname . '/full_v1.png';
    if (!file_exists($original)) {
        echo "Skipping $pathname, no full.png found\n";
        continue;
    }
    if (file_exists($target)) {
        echo "Skipping $pathname, full_v1.png exists\n";
        continue;
    }
    echo "Copying $original to $target\n";
    copy($original, $target);
}