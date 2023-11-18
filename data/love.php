<?php
header("Content-Type: application/json");

try {
    $characters = json_decode(file_get_contents('characters.json'), true);
    $response = array(
        'success' => true,
        'characters' => $characters
    );
} catch (Exception $ex) {
    $response = array(
        'success' => false,
        'message' => $ex->getMessage()
    );
}

echo json_encode($response);
