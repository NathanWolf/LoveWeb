<?php
header("Content-Type: application/json");
require_once 'LoveDatabase.class.php';
require_once 'utilities.inc.php';

function loadData() {
    $db = new \com\elmakers\love\LoveDatabase();
    $characters = $db->getCharacters();
    $tiers = $db->getTierLists();
    $relationships = $db->getRelationships();
    $properties = $db->getProperties();
    $realmPropertyTypes = $db->getRealmPropertyTypes();
    $realms = $db->getRealms();
    $quizzes = $db->getQuizzes();
    $timelineEvents = $db->getTimelineEvents();
    $months = $db->getMonths();
    $mini = $db->getMiniPersona();
    $dressupCharacters = $db->getDressupPersona();
    $dressupCategories = $db->getDressupCategories();
    return array(
        'characters' => $characters,
        'quizzes' => $quizzes,
        'tiers' => $tiers,
        'relationships' => $relationships,
        'properties' => $properties,
        'events' => $timelineEvents,
        'months' => $months,
        'realms' => $realms,
        'realm_properties' => $realmPropertyTypes,
        'mini' => $mini,
        'dressup' => array(
            'characters' => $dressupCharacters,
            'categories' => $dressupCategories
        )
    );
}

function loadDressupOutfit($id) {
    $db = new com\elmakers\love\LoveDatabase();
    return $db->loadOutfit($id);
}

function saveDressupOutfit($personaId, $outfit, $userId, $userToken) {
    $db = new com\elmakers\love\LoveDatabase();
    $outfit = $db->saveOutfit($personaId, $outfit);
    if ($outfit && $userId) {
        try {
            $db->validateLogin($userId, $userToken);
            $db->saveUserOutfit($userId, $outfit['id']);
        } catch (Exception $ex) {
            // Going to ignore login issues.
            // error_log('Error saving user outfit: ' . $ex->getMessage());
        }
    }
    return $outfit;
}

try {
    $action = getParameter('action', 'load');
    switch ($action) {
        case 'load':
            $data = loadData();
            $data['success'] = true;
            die(json_encode($data));
        case 'load_outfit':
            $outfitId = getParameter('id');
            $outfit = loadDressupOutfit($outfitId);
            if (!$outfit) {
                throw new Exception("Failed to load outfit id: " . $outfitId);
            }
            die(json_encode(array('success' => true, 'outfit' => $outfit)));
        case 'save_outfit':
            $personaId = getParameter('character');
            $outfit = json_decode(getParameter('outfit'), true);
            $userId = getParameter('user_id', '');
            $userToken = getParameter('user_token', '');
            $outfit = saveDressupOutfit($personaId, $outfit, $userId, $userToken);
            if (!$outfit) {
                throw new Exception("Failed to load outfit");
            }
            die(json_encode(array('success' => true, 'outfit' => $outfit)));
        default:
            throw new Exception("Invalid action: $action");
    }
} catch (Exception $ex) {
    echo json_encode(array(
        'success' => false,
        'message' => $ex->getMessage()
    ));
    // error_log($ex->getTraceAsString());
}
