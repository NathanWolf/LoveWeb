<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 3) {
    die("Usage: version_images <character folder> <output folder>\n");
}

$characterFolder = $argv[1];
$outputFolder = $argv[2];
if (!file_exists($outputFolder)) {
    die("Output folder does not exist: $outputFolder\n");
}
$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if (!$fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    $info = pathinfo($pathname);
    $filename = $info['filename'];
    $original = $pathname . '/portrait.png';
    if (!file_exists($original)) {
        echo "Skipping $pathname, no portrait.png found\n";
        continue;
    }
    $target = $outputFolder . '/' . $filename . '.png';
    if (file_exists($target)) {
        echo "Skipping $pathname, $target exists\n";
        continue;
    }
    echo "Copying $original to $target\n";
    copy($original, $target);
}