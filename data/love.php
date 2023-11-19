<?php
header("Content-Type: application/json");

try {
    $characters = json_decode(file_get_contents('characters.json'), true);
    $quizzes = json_decode(file_get_contents('quizzes.json'), true);
    $response = array(
        'success' => true,
        'characters' => $characters,
        'quizzes' => $quizzes
    );
} catch (Exception $ex) {
    $response = array(
        'success' => false,
        'message' => $ex->getMessage()
    );
}

echo json_encode($response);
