<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 2) {
    die("Usage: crop_images <folder> [scale|max size]\n");
}

$folder = $argv[1];
$scale = null;
$maxSize = null;
if (count($argv) > 2) {
    $scaleOrMax = $argv[2];
    if (strpos($scaleOrMax, '.') !== FALSE) {
        $scale = floatval($scaleOrMax);
    } else {
        $maxSize = intval($scaleOrMax);
    }
}

function endsWith($haystack, $needle){
    $length = strlen($needle);
    return (substr($haystack, -$length) === $needle);
}

function processFolder($folder, $indent = '') {
    global $maxSize;
    global $scale;
    echo "$indent Processing folder $folder\n";
    $images = array();
    $bounds = array(100000, 100000, 0, 0);
    $iterator = new DirectoryIterator($folder);
    $outputFolder = $folder . '/resized';

    // First find all images and max bounds
    foreach ($iterator as $fileInfo) {
        if ($fileInfo->isDot()) continue;
        $filename = $fileInfo->getFilename();
        $pathname = $fileInfo->getPathname();
        if ($fileInfo->isDir()) {
            if ($filename != 'resized') {
                processFolder($pathname, $indent . '  ');
            }
            continue;
        }
        if (!endsWith($filename, '.png')) continue;
        $image = imagecreatefrompng($pathname);
        if (!$image) {
            echo "$indent Error loading $pathname\n";
            continue;
        }

        list($width, $height) = getimagesize($pathname);
        echo "$indent Processing $pathname ($width x $height)\n";

        // Find bounds
        $found = 0;
        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                $pixel = imagecolorat($image, $x, $y);
                $alpha = ($pixel & 0x7F000000) >> 24;
                if ($alpha != 127) {
                    $found++;
                    $bounds[0] = min($bounds[0], $x);
                    $bounds[1] = min($bounds[1], $y);
                    $bounds[2] = max($bounds[2], $x);
                    $bounds[3] = max($bounds[3], $y);
                }
            }
        }
        if ($found < 2) {
            echo "$indent Could not find enough non-transparent pixels in $pathname\n";
            continue;
        }

        $images[] = array('image' => $image, 'filename' => $filename);
    }

    // If this folder was empty, skip
    if (!$images) {
        return;
    }

    // Crop and re-scale
    echo "$indent Cropping to: " . json_encode($bounds) . "\n";
    $width = $bounds[2] - $bounds[0];
    $height = $bounds[3] - $bounds[1];
    if ($maxSize)  {
        $maxBounds = $width;
        $maxBounds = max($maxBounds, $height);
        if ($maxBounds > $maxSize) {
            $scale = $maxSize / $maxBounds;
        }
    }
    if ($scale) {
        echo "$indent Scaling to {$scale}x\n";
    }
    $crop = array('x' => $bounds[0], 'y' => $bounds[1], 'width' => $width, 'height' => $height);
    foreach ($images as $imageInfo) {
        $image = $imageInfo['image'];
        $filename = $imageInfo['filename'];
        $cropped = imagecrop($image, $crop);
        if (!$cropped) {
            echo "$indent Failed to crop $filename\n";
            continue;
        }
        if ($scale) {
            $targetWidth = $width * $scale;
            $targetHeight = $height * $scale;
            $cropped = imagescale($cropped, $targetWidth, $targetHeight);
            if (!$cropped) {
                echo "$indent Failed to scale $filename\n";
                continue;
            }
        }
        imagesavealpha($cropped, true);
        $outputFilename = $outputFolder . '/' . $filename;

        if (!file_exists($outputFolder)) {
            mkdir($outputFolder);
        }
        imagepng($cropped, $outputFilename);

        echo "$indent Wrote to $outputFilename\n";
    }
}

processFolder($folder);