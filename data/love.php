<?php
header("Content-Type: application/json");
require_once 'LoveDatabase.class.php';

function mapArray(&$array) {
    foreach ($array as $id => &$element) {
        $element['id'] = $id;
    }
    return $array;
}

try {
    $db = new \com\elmakers\love\LoveDatabase();
    $characters = json_decode(file_get_contents('characters.json'), true);
    $quizzes = json_decode(file_get_contents('quizzes.json'), true);
    $tiers = $db->getTierLists();
    $response = array(
        'success' => true,
        'characters' => mapArray($characters),
        'quizzes' => mapArray($quizzes),
        'tiers' => mapArray($tiers)
    );
} catch (Exception $ex) {
    $response = array(
        'success' => false,
        'message' => $ex->getMessage()
    );
}

echo json_encode($response);
