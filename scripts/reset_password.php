<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

if (count($argv) < 3) {
    die("Usage: reset_password <email> <password>\n");
}

require_once '../data/LoveDatabase.class.php';

$love = new \com\elmakers\love\LoveDatabase();
$email = $argv[1];
$password = $argv[2];
$love->forceChangePassword($email, $password);
echo "Changed password for $email\n";
