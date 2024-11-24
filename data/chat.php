<?php
header("Cache-Control: no-cache");

// With love to https://github.com/unconv/chat-wtf !

if (ob_get_level()) ob_end_clean();

require('config.inc.php');
$SETTINGS = $_config;

$MODEL = 'gpt-4o';
$STORAGE_TYPE = isset($_REQUEST['user_id']) ? "sql" : "session";
$PARAMETERS = array();

require(__DIR__ . "/autoload.php");

function get_db(): PDO|null {
    global $STORAGE_TYPE;
    global $SETTINGS;

    if ($STORAGE_TYPE === "session" ) {
        return null;
    }

    $db = new PDO(
        $SETTINGS["database"]["server"],
        $SETTINGS["database"]["user"] ?? null,
        $SETTINGS["database"]["password"] ?? null
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
    $chatgpt = new ChatGPT($SETTINGS['openapi']['key']);

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
