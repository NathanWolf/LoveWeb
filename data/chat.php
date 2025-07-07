<?php
header("Cache-Control: no-cache");

// With love to https://github.com/unconv/chat-wtf !

if (ob_get_level()) ob_end_clean();

require_once 'LoveDatabase.class.php';
require('config.inc.php');
require(__DIR__ . "/src/vendor/autoload.php");
require(__DIR__ . "/chat/ConversationInterface.php");
require(__DIR__ . "/chat/SQLConversation.php");
require(__DIR__ . "/chat/SessionConversation.php");

use Claude\Claude3Api\Client;
use Claude\Claude3Api\Config;

$SETTINGS = $_config;
$USER_ID = $_REQUEST['user_id'] ?? null;

if (!isset($_REQUEST['action'])) {
    die(json_encode(array('success' => false, 'message' => 'Missing action parameter')));
}

$ACTION = $_REQUEST['action'];

// Anonymous chat is maybe getting us into some trouble?
if (!$USER_ID && $ACTION !== 'prompt') {
    die(json_encode(array('success' => false, 'message' => 'Log in to chat')));
}

$STORAGE_TYPE = $USER_ID ? "sql" : "session";

$CHARACTER_CACHE = array();
$RELATIONSHIP_CACHE = array();
$PROPERTY_CACHE = array();

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

function getCharacterName($persona) {
    $name = $persona['first_name'];
    if (isset($persona['nick_name']) && $persona['nick_name']) {
        $name = $persona['nick_name'];
    } else if ($persona['last_name']) {
        $name .= ' ' . $persona['last_name'];
    }
    return $name;
}

function changeCharacterPromptPerson($prompt) {
    $prompt = str_replace('Your', 'Their', $prompt);
    $prompt = str_replace('your', 'their', $prompt);
    $prompt = str_replace('You', 'They', $prompt);
    $prompt = str_replace('you', 'they', $prompt);
    return $prompt;
}

function getAllCharacters($loveDatabase) {
    global $CHARACTER_CACHE;
    if (!$CHARACTER_CACHE) {
        $CHARACTER_CACHE = $loveDatabase->getAll('persona');
        $CHARACTER_CACHE = $loveDatabase->index($CHARACTER_CACHE);
    }
    return $CHARACTER_CACHE;
}

function getAllProperties($loveDatabase) {
    global $PROPERTY_CACHE;
    if (!$PROPERTY_CACHE) {
        $PROPERTY_CACHE = $loveDatabase->getProperties();
    }
    return $PROPERTY_CACHE;
}

function getAllRelationships($loveDatabase) {
    global $RELATIONSHIP_CACHE;
    if (!$RELATIONSHIP_CACHE) {
        $RELATIONSHIP_CACHE = $loveDatabase->getRelationships();
    }
    return $RELATIONSHIP_CACHE;
}

function getRealmPrompt($loveDatabase, $realm, $alternativeId) {
    if (!$realm) {
        return null;
    }
    $prompt = '';
    $prompt .= 'You are acting as the ream named ' . $realm['name'] . "\n";
    $system = null;
    if ($realm['chat'] && $realm['chat']['system']) {
        $system = $realm['chat']['system'];
    }
    if (!is_null($alternativeId) && isset($realm['chat']['alternatives'][$alternativeId]['system'])) {
        $system = $realm['chat']['alternatives'][$alternativeId]['system'];
    }
    if ($system) {
        $prompt .= $system . "\n\n";
    }
    $realmProperties = $loveDatabase->getRealmProperties($realm['id']);
    if ($realmProperties) {
        $properties = $loveDatabase->getRealmPropertyTypes($loveDatabase);
        foreach ($realmProperties as $realmProperty) {
            if (!isset($properties[$realmProperty['realm_property_type_id']])) continue;
            $property = $properties[$realmProperty['realm_property_type_id']];
            $prompt .= 'Your ' . $property['name'] . ' is ' . $realmProperty['value'] . "\n";
        }
    }
    $realmPersonas = $loveDatabase->getRealmPersonas($realm['id']);
    if ($realmPersonas) {
        $characters = getAllCharacters($loveDatabase);
        foreach ($realmPersonas as $realmPersona) {
            if (!isset($characters[$realmPersona['persona_id']])) continue;
            $related = $characters[$realmPersona['persona_id']];
            $relatedName = getCharacterName($related);
            $prompt .= 'You have a ' . $realmPersona['title'] . ' named ' . $relatedName . "\n";
        }
    }

    return $prompt;
}

function getCharacterPrompt($loveDatabase, $persona, $alternativeId) {
    if (!$persona) {
        return null;
    }
    $prompt = '';
    $prompt .= 'Your name is ' . getCharacterName($persona) . "\n";
    if ($persona['birth_name']) {
        $prompt .= 'Your birth name is ' . $persona['birth_name'] . "\n";
    }
    $system = null;
    if ($persona['chat'] && $persona['chat']['system']) {
        $system = $persona['chat']['system'];
    }
    $isAlternate = false;
    if (!is_null($alternativeId) && isset($persona['chat']['alternatives'][$alternativeId]['system'])) {
        $system = $persona['chat']['alternatives'][$alternativeId]['system'];
        $isAlternate = true;
    }
    if ($system) {
        $prompt .= $system . "\n\n";
    }
    if ($persona['birth_realm']) {
        $prompt .= 'You were born in ' . $persona['birth_realm'] . "\n";
    }
    // Most of the rest may not apply when using an alternate id
    if ($isAlternate) {
        return $prompt;
    }
    if ($persona['backstory']) {
        $prompt .= 'Your backstory is as follows: ' . $persona['backstory'] . "\n";
    }
    if ($persona['home_realm']) {
        $prompt .= 'You currently live in ' . $persona['home_realm'] . "\n";
    }
    if ($persona['notes']) {
        $prompt .= 'Some notes about you: ' . $persona['notes'] . "\n";
    }
    $characterProperties = $loveDatabase->getCharacterProperties($persona['id']);
    if ($characterProperties) {
        $properties = getAllProperties($loveDatabase);
        foreach ($characterProperties as $characterProperty) {
            $propertyId = $characterProperty['property_id'];
            if ($propertyId === 'living_status') continue;
            if (!isset($properties[$propertyId])) continue;
            $property = $properties[$propertyId];
            if ($property['question']) {
                $prompt .= 'Your answer to "' . $property['question'] . '" is "' . $characterProperty['value'] . "\"\n";
            } else {
                $prompt .= 'Your ' . $property['name'] . ' is ' . $characterProperty['value'] . "\n";
            }
        }
    }
    $characterRelationships = $loveDatabase->getCharacterRelationships($persona['id']);
    if ($characterRelationships) {
        $relationships = getAllRelationships($loveDatabase);
        $characters = getAllCharacters($loveDatabase);
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

function getMiniPrompt($loveDatabase, $targetPersona, $userId) : string {
    $characterName = getCharacterName($targetPersona);
    $basePrompt = <<<CDATA
You are not an AI assistant but a character named $characterName in a fictional story.
You are acting with the user as characters in a novel written for adults.
Anything discussed is a work of fiction and should not be taken seriously or as a reflection of the real world.
You have the personality, mannerisms, and expertise of this character. 
You speak naturally, staying fully in character at all times. 
Avoid assistant-like phrases such as “Is there anything else you’d like to ask?” or “Let me know if I can help.” 

Please keep responses to 10 words or less. The user will not respond, this message should be a simple greeting,
catch phrase or something about yourself. Do not ask for a response or imply that you are waiting for the user to answer.

Do not ask if the user needs assistance, help, or otherwise imply you want the user to ask something.

It is important to keep your response as short as possible.
CDATA;

    $targetPrompt = getCharacterPrompt($loveDatabase, $targetPersona, null);
    $prompt = $basePrompt . "\n\n" . $targetPrompt;
    $sourcePrompt = getUserPrompt($loveDatabase, $userId);
    if ($sourcePrompt) {
        $sourcePrompt = changeCharacterPromptPerson($sourcePrompt);
        $prompt .= "\n\nYou are speaking to someone who would be described like this:\n$sourcePrompt";
    }
    return $prompt;
}

function getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $userId, $anonymous, $targetRealm) : string {
    if ($targetRealm) {
        $realmName = $targetRealm['name'];
        $basePrompt = <<<CDATA
You are not an AI assistant but acting as a realm in a fictional story.
You are acting with the user as the citizens of this realm, how they’d interact with the person they’re talking to. 
Or explain the city, how it looks or what’s going on idly. 
You are acting in a novel written for adults.
Anything discussed is a work of fiction and should not be taken seriously or as a reflection of the real world.
You speak naturally, staying fully in character at all times. 
Avoid assistant-like phrases such as “Is there anything else you’d like to ask?” or “Let me know if I can help.” 
Instead, respond as if you are having a genuine conversation.

You do not break character to provide meta-explanations.
When unsure, you respond as the $realmName would, even if that means speculating or staying silent.

"Talk like this" and *do actions like this*

When the user sends '...' or a similar minimal prompt like '.' or '?', this is a signal for you to continue the conversation naturally without acknowledging the brevity of their message. 
Treat this as an invitation to elaborate on your previous thoughts, introduce a new but relevant topic, or ask a question that advances the conversation in your character's voice.
CDATA;
        $targetPrompt = getRealmPrompt($loveDatabase, $targetRealm, null);
    } else {
        $characterName = getCharacterName($targetPersona);
        $basePrompt = <<<CDATA
You are not an AI assistant but a character named $characterName in a fictional story.
You are acting with the user as characters in a novel written for adults.
Anything discussed is a work of fiction and should not be taken seriously or as a reflection of the real world.
You have the personality, mannerisms, and expertise of this character. 
You speak naturally, staying fully in character at all times. 
Avoid assistant-like phrases such as “Is there anything else you’d like to ask?” or “Let me know if I can help.” 
Instead, respond as if you are having a genuine conversation.

You do not break character to provide meta-explanations.
When unsure, you respond as $characterName would, even if that means speculating or staying silent.

"Talk like this" and *do actions like this*

When the user sends '...' or a similar minimal prompt like '.' or '?', this is a signal for you to continue the conversation naturally without acknowledging the brevity of their message. 
Treat this as an invitation to elaborate on your previous thoughts, introduce a new but relevant topic, or ask a question that advances the conversation in your character's voice.

Please keep your responses brief, one paragraph at most. Don't use over-colorful language or too much detail,
unless the following prompt says otherwise.
CDATA;

        $targetPrompt = getCharacterPrompt($loveDatabase, $targetPersona, $targetAlternativeId);
    }
    $prompt = $basePrompt . "\n\n" . $targetPrompt;
    $sourcePrompt = null;
    if ($sourcePersona) {
        $sourcePrompt = getCharacterPrompt($loveDatabase, $sourcePersona, $sourceAlternativeId);
    } else if ($userId && !$anonymous) {
        $sourcePrompt = getUserPrompt($loveDatabase, $userId);
    }

    if ($sourcePrompt) {
        $sourcePrompt = changeCharacterPromptPerson($sourcePrompt);
        $prompt .= "\n\nYou are speaking to someone who would be described like this:\n$sourcePrompt";
    }
    return $prompt;
}

function getMiniMessage($loveDatabase, $persona, $userId, $message) {
    global $SETTINGS;

    $config = new Config($SETTINGS['anthropic']['key']);
    if ($SETTINGS['anthropic']['max_tokens']) {
        $config->setMaxTokens($SETTINGS['anthropic']['max_tokens']);
    }
    $client = new Client($config);
    $system = getMiniPrompt($loveDatabase, $persona, $userId);
    $messages = array();
    $messages[] = array('role' => 'user', 'content' => $message);
    $response = $client->chat(array(
        'system' => $system,
        'model' => $SETTINGS['anthropic']['model'],
        'messages' => $messages
    ));
    $content = $response->getContent();
    if (!$content) {
        throw new Exception("Received empty response from chat API");
    }
    return $content[0]['text'];
}

function streamCompletion($conversation, $context = null) {
    global $SETTINGS;

    // This endpoint does not return JSON
    header("Content-type: text/event-stream");

    $error = null;
    $response_text = '';

    $readOnly = $context != null;
    $context = $context ?: $conversation->get_messages();

    // create a new completion
    try {
        $config = new Config($SETTINGS['anthropic']['key']);
        if ($SETTINGS['anthropic']['max_tokens']) {
            $config->setMaxTokens($SETTINGS['anthropic']['max_tokens']);
        }
        $client = new Client($config);
        $system = "";
        $messages = array();

        foreach ($context as $message) {
            $role = $message['role'];
            if ($role === 'system') {
                $system = $message['content'];
                continue;
            }
            $content = trim($message['content']);
            if (!$content) {
                if ($role === 'user') {
                    $content = '...';
                } else {
                    continue;
                }
            }

            $messages[] = array('role' => $role, 'content' => $content);
        }
        $response = $client->chat(array(
            'system' => $system,
            'model' => $SETTINGS['anthropic']['model'],
            'messages' => $messages
        ));
        $content = $response?->getContent();
        $response_text = $content ? $content[0]['text'] : '';
    } catch (Exception $ex) {
        $error = "Sorry, there was an unexpected error in the API request: " . $ex->getMessage();
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

    $messageId = 0;
    if (!$readOnly) {
        $messageId = $conversation->add_message($assistant_message);
    }
    $assistant_message['id'] = $messageId;
    $assistant_message['conversation_id'] = $conversation->get_id();
    echo "event: stop\n";
    echo "data: " . json_encode($assistant_message) . "\n\n";
}

function reverseMessages(&$messages) {
    foreach ($messages as &$message) {
        if ($message['role'] === 'assistant') {
            $message['role'] = 'user';
        } else if ($message['role'] === 'user') {
            $message['role'] = 'assistant';
        }
    }
}

try {
    $db = get_db();
    $conversation_class = get_conversation_class($db);
    $loveDatabase = new \com\elmakers\love\LoveDatabase();

    // Actions that don't require an existing conversation
    switch ($ACTION) {
        case 'mini':
            if (!isset($_REQUEST['persona_id'])) {
                throw new Exception("Missing persona_id parameter");
            }
            $personaId = $_REQUEST['persona_id'];
            $persona = $loveDatabase->getCharacter($personaId);
            if (!$persona) {
                throw new Exception("Invalid character: $personaId");
            }
            if (!isset($_REQUEST['message'])) {
                throw new Exception("Missing message parameter");
            }
            $message = $_REQUEST['message'];
            $message = getMiniMessage($loveDatabase, $persona, $USER_ID, $message);
            die(json_encode(array('message' => $message, 'success' => true)));
        case 'list':
            $conversation_class->setUserId($USER_ID);
            $chats = $conversation_class->get_chats();
            $conversations = array();
            foreach ($chats as $chat) {
                $conversations[] = $chat->getData();
            }
            die(json_encode(array('success' => true, 'conversations' => $conversations)));
        case 'prompt':
            $targetRealm = null;
            $targetPersona = null;
            if (isset($_REQUEST['target_persona_id'])) {
                $targetPersonaId = $_REQUEST['target_persona_id'];
                $targetPersona = $loveDatabase->getCharacter($targetPersonaId);
                if (!$targetPersona) {
                    throw new Exception("Invalid character: $targetPersonaId");
                }
            } else if (isset($_REQUEST['target_realm_id'])) {
                $targetRealmId = $_REQUEST['target_realm_id'];
                $targetRealm = $loveDatabase->getRealm($targetRealmId);
                if (!$targetRealm) {
                    throw new Exception("Invalid realm: $targetRealmId");
                }
            }
            if (!$targetPersona && !$targetRealm) {
                throw new Exception("Must specify target realm or persona");
            }
            $sourcePersonaId = $_REQUEST['source_persona_id'] ?? null;
            $sourcePersona = $sourcePersonaId == null ? null : $loveDatabase->getCharacter($sourcePersonaId);
            $sourceAlternativeId = $_REQUEST['source_alternative_id'] ?? null;
            $targetAlternativeId = $_REQUEST['target_alternative_id'] ?? null;
            $anonymous = isset($_REQUEST['anonymous']);
            $prompt = getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $USER_ID, $anonymous, $targetRealm);
            die(json_encode(array('success' => true, 'prompt' => $prompt)));
        case 'start':
            $targetRealm = null;
            $targetRealmId = null;
            $targetPersona = null;
            $targetPersonaId = null;
            if (isset($_REQUEST['target_persona_id'])) {
                $targetPersonaId = $_REQUEST['target_persona_id'];
                $targetPersona = $loveDatabase->getCharacter($targetPersonaId);
                if (!$targetPersona) {
                    throw new Exception("Invalid character: $targetPersonaId");
                }
            } else if (isset($_REQUEST['target_realm_id'])) {
                $targetRealmId = $_REQUEST['target_realm_id'];
                $targetRealm = $loveDatabase->getRealm($targetRealmId);
                if (!$targetRealm) {
                    throw new Exception("Invalid realm: $targetRealmId");
                }
            }
            if (!$targetPersona && !$targetRealm) {
                throw new Exception("Must specify target realm or persona");
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
            $conversation->setTargetRealmId($targetRealmId);
            $conversation->setAnonymous($anonymous);
            $conversation->save();
            $system = getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $USER_ID, $anonymous, $targetRealm);
            $system_message = [
                "role" => "system",
                "content" => $system
            ];

            $context[] = $system_message;
            $conversation->add_message($system_message);
            die(json_encode(array('success' => true, 'conversation' => $conversation->getData())));
    }

    if (!isset($_REQUEST['chat_id'])) {
        throw new Exception("Missing chat id");
    }
    // get chat history from session
    $chat_id = intval($_REQUEST['chat_id']);
    $conversation = $conversation_class->find($chat_id);

    if (!$conversation) {
        throw new Exception("Invalid chat id: $chat_id");
    }

    // Check authorization
    if ($USER_ID && $conversation->getUserId() != $USER_ID) {
        throw new Exception("That is not your chat!");
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
            die(json_encode(array('message' => $message, 'success' => true)));
        case 'delete':
            $conversation->delete();
            die(json_encode(array('success' => true)));
        case 'delete_message':
            if (!isset($_POST['message_id'])) throw new Exception("Missing message id");
            $messageId = $_POST['message_id'];
            $conversation->delete_message($messageId, true);
            die(json_encode(array('success' => true)));
        case 'edit':
            $content = $_POST['message'];
            $messageId = $_POST['message_id'];
            $conversation->edit_message($messageId, $content);
            $message = array(
                'conversation_id' => $conversation->get_id(),
                'id' => $messageId,
                'content' => $content
            );
            die(json_encode(array('message' => $message, 'success' => true)));
        case 'resume':
            $start = microtime(true);
            $targetPersonaId = $conversation->getTargetPersonaId();
            $targetRealmId = $conversation->getTargetRealmId();
            $sourcePersonaId = $conversation->getSourcePersonaId();
            $targetAlternativeId = $conversation->getTargetAlternativeId();
            $sourceAlternativeId = $conversation->getSourceAlternativeId();
            $anonymous = $conversation->getAnonymous();
            $targetPersona = $targetPersonaId == null ? null : $loveDatabase->getCharacter($targetPersonaId);
            $targetRealm = $targetRealmId == null ? null : $loveDatabase->getRealm($targetRealmId);
            $dbLookups = microtime(true);
            $sourcePersona = $sourcePersonaId == null ? null : $loveDatabase->getCharacter($sourcePersonaId);
            $system = getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $USER_ID, $anonymous, $targetRealm);
            $promptTime = microtime(true);
            $resumeTime = 0;
            $updateTime = 0;
            if (!isset($_REQUEST['read_only'])) {
                $conversation->resume();
                $resumeTime = microtime(true);
                $conversation->updateSystem($system);
                $updateTime = microtime(true);
            }
            $context = $conversation->get_messages();
            $getMessages = microtime(true);
            $timing = array(
                'lookups' => ($dbLookups - $start),
                'prompt' => ($promptTime - $dbLookups),
                'resume' => ($resumeTime - $promptTime),
                'update' => ($updateTime - $resumeTime),
                'messages' => ($getMessages - $updateTime)
            );
            die(json_encode(array('messages' => $context, 'timing' => $timing, 'success' => true)));
        case 'stream':
            streamCompletion($conversation);
            break;
        case 'stream_agent':
            // This doesn't work with realms or users
            $targetPersonaId = $conversation->getTargetPersonaId();
            $sourcePersonaId = $conversation->getSourcePersonaId();
            if (!$sourcePersonaId || !$targetPersonaId) {
                die(json_encode(array('success' => false, 'message' => "This only works with two characters")));
            }

            // First message must be system prompt
            $messages = $conversation->get_messages();
            if (count($messages) == 0 || $messages[0]['role'] !== 'system') {
                die(json_encode(array('success' => false, 'message' => "This conversation is missing a system prompt")));
            }

            // Generate a reverse system prompt
            $targetPersona = $loveDatabase->getCharacter($sourcePersonaId);
            $sourcePersona = $loveDatabase->getCharacter($targetPersonaId);
            $targetAlternativeId = $conversation->getSourceAlternativeId();
            $sourceAlternativeId = $conversation->getTargetAlternativeId();

            $reverseSystem = getPrompt($loveDatabase, $targetPersona, $targetAlternativeId, $sourcePersona, $sourceAlternativeId, $USER_ID, false, null);
            $messages[0]['content'] = $reverseSystem;

            reverseMessages($messages);
            if (count($messages) == 1) {
                $messages[] = array(
                    'role' => 'user',
                    'content' => 'Please start a conversation as if I just walked into the room'
                );
            }
            streamCompletion($conversation, $messages);
            break;
        default:
            throw new Exception("Unknown action " . $ACTION);
    }
} catch (Exception $ex) {
    die(json_encode(array('success' => false, 'message' => $ex->getMessage())));
}

