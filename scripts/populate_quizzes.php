<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveAdminDatabase.class.php';

$quizzes = json_decode(file_get_contents('../data/quizzes.json'), true);
if (!$quizzes) {
    die("Could not parse quizzes.json\n");
}

$db = new \com\elmakers\love\LoveAdminDatabase();

foreach ($quizzes as $quizId => $quiz) {
    $existing = $db->get('quiz', $quizId);
    if ($existing) {
        // Not sure we need this.
    } else {
        $newQuiz = array(
            'id' => $quizId,
            'name' => $quiz['name']
        );
        echo "Adding $quizId\n";
        $db->insert('quiz', $newQuiz);

        $questions = $quiz['questions'];
        foreach ($questions as $question) {
            $newQuestion = array(
                'quiz_id' => $quizId,
                'question' => $question['question']
            );
            if (isset($question['explanation'])) {
                $newQuestion['explanation'] = $question['explanation'];
            }
            $questionId = $db->insert('quiz_question', $newQuestion);
            $answers = $question['answers'];
            $correct = true;
            foreach ($answers as $answer) {
                $newAnswer = array(
                    'quiz_question_id' => $questionId,
                    'answer' => $answer,
                    'correct' => $correct ? 1 : 0
                );
                $correct = false;
                $db->insert('quiz_answer', $newAnswer);
            }
        }
    }
}

echo "Done.\n";

