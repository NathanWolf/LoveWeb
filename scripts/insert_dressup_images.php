<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveDatabase.class.php';
require_once '../data/LoveAdminDatabase.class.php';


if (count($argv) < 2) {
    $characterFolder = '../image/dressup/characters';
} else {
    $characterFolder = $argv[1];
}

$db = new \com\elmakers\love\LoveDatabase();
$admin = new \com\elmakers\love\LoveAdminDatabase();

$characters = $db->getCharacters();
$dressup = $db->getDressupPersona();
$categories = $db->getDressupCategories();

function saveCroppedImage($source, $destination, $maxSize) {
    $indent = '    ';
    $image = imagecreatefrompng($source);
    if (!$image) {
        echo "$indent Error loading $source\n";
        return;
    }

    list($width, $height) = getimagesize($source);
    echo "$indent Cropping $source ($width x $height)\n";

    // Find bounds
    $found = 0;
    $bounds = array(100000, 100000, 0, 0);
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
        echo "$indent Could not find enough non-transparent pixels in $source\n";
        return;
    }

    echo "$indent Cropping to: " . json_encode($bounds) . "\n";

    $scale = 0;
    $width = $bounds[2] - $bounds[0] + 1;
    $height = $bounds[3] - $bounds[1] + 1;
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
    $cropped = imagecrop($image, $crop);
    if (!$cropped) {
        echo "$indent Failed to crop $source\n";
        return;
    }
    if ($scale) {
        $targetWidth = ceil($width * $scale);
        $targetHeight = ceil($height * $scale);
        $cropped = imagescale($cropped, $targetWidth, $targetHeight);
        if (!$cropped) {
            echo "$indent Failed to scale $source\n";
            return;
        }
    }
    imagesavealpha($cropped, true);
    imagepng($cropped, $destination);
}

$iterator = new DirectoryIterator($characterFolder);
foreach ($iterator as $fileInfo) {
    if ($fileInfo->isDot()) continue;
    if (!$fileInfo->isDir()) continue;
    $pathname = $fileInfo->getPathname();
    $info = pathinfo($pathname);
    $characterId = $info['filename'];
    if (!isset($characters[$characterId])) {
        echo "Skipping $characterId, unknown\n";
        continue;
    }

    if (!file_exists($pathname . '/base.png')) {
        echo "Character $characterId missing base.png, skipping";
        continue;
    }

    if (!isset($dressup[$characterId])) {
        list($width, $height, $type, $attr) = getimagesize($pathname . '/base.png');
        $newRecord = array(
            'persona_id' => $characterId,
            'width' => $width,
            'height' => $height
        );
        $admin->insert('persona_dressup', $newRecord);
        echo "Saving new dressup for $characterId, $width x $height\n";
    }

    $thumbnailPath = $pathname . '/thumbnails';
    $pathname = $pathname . '/items';
    if (!file_exists($pathname)) {
        echo "Character $characterId items folder does not exist, skipping ($pathname)\n";
        continue;
    }
    if (!file_exists($thumbnailPath)) {
        mkdir($thumbnailPath);
    }
    $character = $characters[$characterId];
    $characterIterator = new DirectoryIterator($pathname);
    foreach ($characterIterator as $characterFileInfo) {
        if ($characterFileInfo->isDot()) continue;
        $pathname = $characterFileInfo->getPathname();
        $info = pathinfo($pathname);
        $categoryId = $info['filename'];
        if (!$categoryId) {
            continue;
        }
        if (!$characterFileInfo->isDir()) {
            echo "Skipping $characterId/$categoryId, unknown file\n";
            continue;
        }
        if (!isset($categories[$categoryId])) {
            echo "Skipping $characterId/$categoryId, unknown category\n";
            continue;
        }

        $categoryIterator = new DirectoryIterator($pathname);
        foreach ($categoryIterator as $categoryFileInfo) {
            if ($categoryFileInfo->isDot()) continue;
            if ($categoryFileInfo->isDir()) continue;
            $pathname = $categoryFileInfo->getPathname();
            $info = pathinfo($pathname);
            $itemId = $info['filename'];
            if (!$itemId) {
                continue;
            }

            $thumbnailFile = $thumbnailPath . '/' . $categoryId . '/' . $itemId . '.png';
            if (!file_exists($thumbnailFile)) {
                if (!file_exists($thumbnailPath . '/' . $categoryId)) {
                    mkdir($thumbnailPath . '/' . $categoryId);
                }

                saveCroppedImage($pathname, $thumbnailFile, 128);
            }

            if (isset($dressup[$characterId]['items'][$categoryId][$itemId])) {
                echo "Skipping $characterId/$categoryId/$itemId, already exists\n";
                continue;
            }

            $title = $itemId;
            $title = str_replace('_', ' ', $title);
            $title = ucwords($title);

            $layer = 0;
            switch ($categoryId) {
                case 'socks': $layer = 10; break;
                case 'shoes': $layer = 20; break;
                case 'pants': $layer = 30; break;
                case 'shorts': $layer = 40; break;
                case 'skirts': $layer = 50; break;
                case 'dresses': $layer = 60; break;
                case 'shirts': $layer = 75; break; // undershirts: 70
                case 'jackets': $layer = 80; break;
                case 'accessories': $layer = 90; break;
                case 'glasses': $layer = 95; break;
                case 'eyes_right': $layer = 83; break;
                case 'eyes_left': $layer = 83; break;
                case 'mouths': $layer = 85; break;
                case 'eyebrows': $layer = 87; break;
                case 'hair_back': $layer = 2; break;
                case 'hair_front': $layer = 81; break;
            }

            $newRecord = array(
                'persona_id' => $characterId,
                'category_id' => $categoryId,
                'image_id' => $itemId,
                'title' => $title,
                'layer' => $layer
            );
            $admin->insert('persona_dressup_item', $newRecord);
            echo "Saving new item for $characterId/$categoryId/$itemId as $title\n";
        }
    }
}
