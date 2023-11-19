<?php
header("Content-Type: application/json");

function mapArray(&$array) {
    foreach ($array as $id => &$element) {
        $element['id'] = $id;
    }
    return $array;
}

try {
    $characters = json_decode(file_get_contents('characters.json'), true);
    $quizzes = json_decode(file_get_contents('quizzes.json'), true);
    $response = array(
        'success' => true,
        'characters' => mapArray($characters),
        'quizzes' => mapArray($quizzes)
    );
} catch (Exception $ex) {
    $response = array(
        'success' => false,
        'message' => $ex->getMessage()
    );
}

echo json_encode($response);
