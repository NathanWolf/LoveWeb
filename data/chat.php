<?php
header("Cache-Control: no-cache");

// With love to https://github.com/unconv/chat-wtf !

if (ob_get_level()) ob_end_clean();

require_once 'LoveDatabase.class.php';
require('config.inc.php');
$SETTINGS = $_config;

if (!isset($_REQUEST['action'])) {
    die("Missing action parameter");
}

$ACTION = $_REQUEST['action'];
$MODEL = 'gpt-4o';
$USER_ID = $_REQUEST['user_id'] ?? null;
$STORAGE_TYPE = $USER_ID ? "sql" : "session";
$PARAMETERS = array();

require(__DIR__ . "/autoload.php");

function get_db(): PDO|null {
    global $STORAGE_TYPE;
    global $SETTINGS;

    if ($STORAGE_TYPE === "session" ) {
        return null;
    }

    $dsn = "mysql:host={$SETTINGS["database"]["server"]};dbname={$SETTINGS["database"]["database"]}";
    $db = new PDO(
        $dsn,
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

// Actions that don't require an existing conversation
switch ($ACTION) {
    case 'list':
        $conversation_class->setUserId($USER_ID);
        $chats = $conversation_class->get_chats();
        $conversations = array();
        foreach ($chats as $chat) {
            $conversations[] = $chat->getData();
        }
        die(json_encode(array('conversations' => $conversations)));
    case 'start':
        if (!isset($_REQUEST['target_persona_id'])) {
            die("Missing target_persona_id parameter");
        }
        $loveDatabase = new \com\elmakers\love\LoveDatabase();
        $targetPersonaId = $_REQUEST['target_persona_id'];
        $targetPersona = $loveDatabase->getCharacter($targetPersonaId);
        if (!$targetPersona || !$targetPersona['chat']) {
            die("Invalid character: $targetPersonaId");
        }
        $sourcePersonaId = $_REQUEST['source_persona_id'] ?? null;
        $sourceAlternativeId = $_REQUEST['source_alternative_id'] ?? null;
        $targetAlternativeId = $_REQUEST['target_alternative_id'] ?? null;
        $title = $_REQUEST['title'] ?? "Untitled chat";
        $conversation = new $conversation_class($db);
        $conversation->set_title($title);
        $conversation->setUserId($USER_ID);
        $conversation->setTargetPersonaId($targetPersonaId);
        $conversation->setSourcePersonaId($sourcePersonaId);
        $conversation->setSourceAlternativeId($sourceAlternativeId);
        $conversation->setTargetAlternativeId($targetAlternativeId);
        $conversation->setAnonymous(isset($_REQUEST['anonymous']));
        $conversation->save();

        $system = $targetPersona['chat']['system'] ?? null;
        if (!is_null($targetAlternativeId) && isset($targetPersona['chat']['alternatives'][$targetAlternativeId]['system'])) {
            $system = $targetPersona['chat']['alternatives'][$targetAlternativeId]['system'];
        }
        $sourcePersona = $sourcePersonaId == null ? null : $loveDatabase->getCharacter($sourcePersonaId);
        $sourceSystem = $sourcePersona && isset($sourcePersona['chat']['system']) ? $sourcePersona['chat']['system'] : null;
        if (!is_null($sourceAlternativeId) && isset($sourcePersona['chat']['alternatives'][$sourceAlternativeId]['system'])) {
            $sourceSystem = $sourcePersona['chat']['alternatives'][$sourceAlternativeId]['system'];
        }
        if ($sourceSystem) {
            $system .= "\n\nYou are speaking to someone who would describe themselves like this: $sourceSystem";
        }
        $system_message = [
            "role" => "system",
            "content" => $system
        ];

        $context[] = $system_message;
        $conversation->add_message($system_message);
        die(json_encode(array('conversation' => $conversation->getData())));
}

if (!isset($_REQUEST['chat_id'])) {
    die("Missing chat id");
}
// get chat history from session
$chat_id = intval($_REQUEST['chat_id']);

$conversation = $conversation_class->find($chat_id);

if (!$conversation) {
    die("Invalid chat id: $chat_id");
}

switch ($ACTION) {
    case 'message':
        $role = "user";
        $content = $_POST['message'];
        $message = [
            "role" => $role,
            "content" => $content,
        ];

        $messageId = $conversation->add_message($message);
        $message = array(
            'conversation_id' => $conversation->get_id(),
            'id' => $messageId,
            'content' => $content,
            'role' => $role
        );
        die(json_encode($message));
    case 'edit':
        $content = $_POST['message'];
        $messageId = $_POST['message_id'];
        $conversation->edit_message($messageId, $content);
        $message = array(
            'conversation_id' => $conversation->get_id(),
            'id' => $messageId,
            'content' => $content
        );
        die(json_encode($message));
    case 'resume':
        $context = $conversation->get_messages();
        die(json_encode(array('messages' => $context)));
    case 'stream':
        header("Content-type: text/event-stream");
        $context = $conversation->get_messages();

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

        $messageId = $conversation->add_message($assistant_message);
        $assistant_message['id'] = $messageId;
        $assistant_message['conversation_id'] = $conversation->get_id();
        echo "event: stop\n";
        echo "data: " . json_encode($assistant_message) . "\n\n";
        break;
    default:
        die("Unknown action " . $ACTION);
}
