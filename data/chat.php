<?php
header("Cache-Control: no-cache");

// With love to https://github.com/unconv/chat-wtf !

if (ob_get_level()) ob_end_clean();

$settings = require('settings.php');

$MODEL = 'gpt-3.5-turbo';
$STORAGE_TYPE = "session";
$PARAMETERS = array();

require(__DIR__ . "/autoload.php");


function get_db(): PDO|null {
    global $STORAGE_TYPE;

    if ($STORAGE_TYPE === "session" ) {
        return null;
    }

    $settings = require( __DIR__ . "/settings.php" );
    $db = new PDO(
        $settings["db"]["dsn"],
        $settings["db"]["username"] ?? null,
        $settings["db"]["password"] ?? null
    );

    $db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

    return $db;
}

function get_conversation_class($db): ConversationInterface {
    global $STORAGE_TYPE;

    $conversation_class = [
        "session" => SessionConversation::class,
        "sql" => SQLConversation::class,
    ];

    return new $conversation_class[$STORAGE_TYPE]($db);
}

$db = get_db();
$conversation_class = get_conversation_class($db);

// get chat history from session
$chat_id = intval($_REQUEST['chat_id']);

$conversation = $conversation_class->find($chat_id, $db);

if (!$conversation) {
    $conversation = new $conversation_class($db);
    $conversation->set_title("Untitled chat");
    $conversation->save();
}

$context = $conversation->get_messages();

if (empty($context) && isset($_REQUEST['system'])) {
    $system_message = [
        "role" => "system",
        "content" => $_REQUEST['system']
    ];

    $context[] = $system_message;
    $conversation->add_message($system_message);
}

if (isset($_POST['message'])) {
    $message = [
        "role" => "user",
        "content" => $_POST['message'],
    ];

    $conversation->add_message($message);

    echo $conversation->get_id();
    exit;
}

header("Content-type: text/event-stream");

$error = null;
$response_text = '';

// create a new completion
try {
    $chatgpt = new ChatGPT($CHATGPT_API_KEY);

    $chatgpt->set_model($MODEL);
    $chatgpt->set_params($PARAMETERS);

    foreach ($context as $message) {
        switch ($message['role']) {
            case "user":
                $chatgpt->umessage($message['content']);
                break;
            case "assistant":
                $chatgpt->amessage($message['content']);
                break;
            case "system":
                $chatgpt->smessage($message['content']);
                break;
        }
    }
    $response_text = $chatgpt->stream(StreamType::Event)->content;
} catch (Exception $e) {
    $error = "Sorry, there was an unknown error in the OpenAI request";
}

if ($error !== null) {
    $response_text = $error;
    echo "data: " . json_encode(["content" => $error]) . "\n\n";
    flush();
}

$assistant_message = [
    "role" => "assistant",
    "content" => $response_text,
];

$conversation->add_message($assistant_message);

echo "event: stop\n";
echo "data: stopped\n\n";
