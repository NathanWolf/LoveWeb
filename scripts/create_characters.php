<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

$characters = array(
    'love', 'ciel','thirteen', 'celeste',  'michael', 'angelica',
    'astella', 'vortex', 'cynth', 'cymbeline', 'ezra', 'aura',
    'neptune', 'clara', 'ace', 'beau', 'harper', 'kai', 'victoria',
    'idris', 'jasmine', 'jamie'
);

$characterInfo = array();
foreach ($characters as $character) {
    $sheetExists = file_exists("../image/sheets/$character.png");
    $characterInfo[$character] = array(
        'sheet' => $sheetExists,
        'name' => strtoupper(substr($character, 0, 1)) . substr($character, 1)
    );
}
file_put_contents('../data/characters.json', json_encode($characterInfo));
