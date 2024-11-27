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
$loveDatabase = new \com\elmakers\love\LoveDatabase();

function getCharacterName($persona) {
    $name = $persona['first_name'];
    if (isset($persona['nick_name']) && $persona['nick_name']) {
        $name = $persona['nick_name'];
    } else if ($persona['last_name']) {
        $name .= ' ' . $persona['last_name'];
    }
    return $name;
}

function getCharacterPrompt($loveDatabase, $persona, $alternativeId) {
    if (!$persona) {
        return null;
    }
    $prompt = 'Your name is ' . getCharacterName($persona) . "\n";
    if ($persona['birth_name']) {
        $prompt .= 'Your birth name is ' . $persona['birth_name'] . "\n";
    }
    $system = null;
    if ($persona['chat']['system']) {
        $system = $persona['chat']['system'];
    }
    if (!is_null($alternativeId) && isset($persona['chat']['alternatives'][$alternativeId]['system'])) {
        $system = $persona['chat']['alternatives'][$alternativeId]['system'];
    }
    if ($system) {
        $prompt .= $system . "\n\n";
    }
    if ($persona['backstory']) {
        $prompt .= 'Your backstory is as follows: ' . $persona['backstory'] . "\n";
    }
    if ($persona['home_realm']) {
        $prompt .= 'You currently live in ' . $persona['home_realm'] . "\n";
    }
    if ($persona['birth_realm']) {
        $prompt .= 'You were born in ' . $persona['birth_realm'] . "\n";
    }
    if ($persona['notes']) {
        $prompt .= 'Some notes about you: ' . $persona['notes'] . "\n";
    }
    $characterProperties = $loveDatabase->getCharacterProperties($persona['id']);
    if ($characterProperties) {
        $properties = $loveDatabase->getProperties();
        foreach ($characterProperties as $characterProperty) {
            if (!isset($properties[$characterProperty['property_id']])) continue;
            $property = $properties[$characterProperty['property_id']];
            if ($property['question']) {
                $prompt .= 'Your answer to "' . $property['question'] . '" is "' . $characterProperty['value'] . "\"\n";
            } else {
                $prompt .= 'Your ' . $property['name'] . ' is ' . $characterProperty['value'] . "\n";
            }
        }
    }
    $characterRelationships = $loveDatabase->getCharacterRelationships($persona['id']);
    if ($characterRelationships) {
        $relationships = $loveDatabase->getRelationships();
        // Too much overhead in getCharacters
        $characters = $loveDatabase->getAll('persona');
        $characters = $loveDatabase->index($characters);
        foreach ($characterRelationships as $characterRelationship) {
            if (!isset($characters[$characterRelationship['related_persona_id']])) continue;
            if (!isset($relationships[$characterRelationship['relationship_id']])) continue;
            $related = $characters[$characterRelationship['related_persona_id']];
            $relationship = $relationships[$characterRelationship['relationship_id']];
            $relatedName = getCharacterName($related);
            $prompt .= 'You have a ' . $relationship['name'] . ' named ' . $relatedName . "\n";
        }
    }

    return $prompt;
}

function getUserPrompt($loveDatabase, $userId) {
    $user = $loveDatabase->getUser($userId);
    $prompt = 'My name is ' . getCharacterName($user) . "\n";
    $system = null;
    if ($user['chat']['system']) {
        $system = $user['chat']['system'];
    }
    if ($system) {
        $prompt .= "\n" . $system;
    }
    return $prompt;
}

function getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $userId, $anonymous) : string {
    $prompt = getCharacterPrompt($loveDatabase, $targetPersona, $targetAlternativeId);
    $sourcePrompt = null;
    if ($sourcePersona) {
        $sourcePrompt = getCharacterPrompt($loveDatabase, $sourcePersona, $sourceAlternativeId);
    } else if ($userId && !$anonymous) {
        $sourcePrompt = getUserPrompt($loveDatabase, $userId);
    }

    if ($sourcePrompt) {
        $prompt .= "\n\nYou are speaking to someone who would describe themselves like this:\n$sourcePrompt";
    }
    return $prompt;
}

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
    case 'prompt':
        $targetPersonaId = $_REQUEST['target_persona_id'];
        $targetPersona = $loveDatabase->getCharacter($targetPersonaId);
        if (!$targetPersona || !$targetPersona['chat']) {
            die("Invalid character: $targetPersonaId");
        }
        $sourcePersonaId = $_REQUEST['source_persona_id'] ?? null;
        $sourcePersona = $sourcePersonaId == null ? null : $loveDatabase->getCharacter($sourcePersonaId);
        $sourceAlternativeId = $_REQUEST['source_alternative_id'] ?? null;
        $targetAlternativeId = $_REQUEST['target_alternative_id'] ?? null;
        $anonymous = isset($_REQUEST['anonymous']);
        $prompt = getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $USER_ID, $anonymous);
        die(json_encode(array('prompt' => $prompt)));
    case 'start':
        if (!isset($_REQUEST['target_persona_id'])) {
            die("Missing target_persona_id parameter");
        }
        $targetPersonaId = $_REQUEST['target_persona_id'];
        $targetPersona = $loveDatabase->getCharacter($targetPersonaId);
        if (!$targetPersona || !$targetPersona['chat']) {
            die("Invalid character: $targetPersonaId");
        }
        $sourcePersonaId = $_REQUEST['source_persona_id'] ?? null;
        $sourcePersona = $sourcePersonaId == null ? null : $loveDatabase->getCharacter($sourcePersonaId);
        $sourceAlternativeId = $_REQUEST['source_alternative_id'] ?? null;
        $targetAlternativeId = $_REQUEST['target_alternative_id'] ?? null;
        $anonymous = isset($_REQUEST['anonymous']);
        $title = $_REQUEST['title'] ?? "Untitled chat";
        $conversation = new $conversation_class($db);
        $conversation->set_title($title);
        $conversation->setUserId($USER_ID);
        $conversation->setTargetPersonaId($targetPersonaId);
        $conversation->setSourcePersonaId($sourcePersonaId);
        $conversation->setSourceAlternativeId($sourceAlternativeId);
        $conversation->setTargetAlternativeId($targetAlternativeId);
        $conversation->setAnonymous($anonymous);
        $conversation->save();
        $system = getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $USER_ID, $anonymous);
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
        $targetPersonaId = $conversation->getTargetPersonaId();
        $sourcePersonaId = $conversation->getSourcePersonaId();
        $targetAlternativeId = $conversation->getTargetAlternativeId();
        $sourceAlternativeId = $conversation->getSourceAlternativeId();
        $anonymous = $conversation->getAnonymous();
        $targetPersona = $loveDatabase->getCharacter($targetPersonaId);
        $sourcePersona = $sourcePersonaId == null ? null : $loveDatabase->getCharacter($sourcePersonaId);
        $system = getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $USER_ID, $anonymous);
        $conversation->resume();
        $conversation->updateSystem($system);
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
