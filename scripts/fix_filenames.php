<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: fix_filenames.php <folder>\n");
}

$dir = new DirectoryIterator($argv[1]);
foreach ($dir as $file) {
    if ($file->isDir()) continue;
    if ($file->isDot()) continue;

    $filename = $file->getFilename();
    $path = $file->getPath();

    $pieces = explode('_&_', $filename);
    $filenames = array($filename);
    if (count($pieces) == 2) {
        $one = $pieces[0] . '.png';
        $two = $pieces[1];
        echo "Splitting $filename into $one and $two\n";
        copy($path . '/' . $filename, $path . '/' . $one);
        rename($path . '/' . $filename, $path . '/' . $two);
        $filenames = array($one, $two);
    }

    foreach ($filenames as $filename) {
        $newFilename = str_replace('.png.PNG', '.png', $filename);
        $newFilename = strtolower($newFilename);
        if ($newFilename != $filename) {
            echo "Renaming $filename to $newFilename in $path\n";
            rename($path . '/' . $filename, $path . '/' . $newFilename);
        }
    }
}

echo "Done.\n";