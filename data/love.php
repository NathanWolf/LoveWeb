<?php
header("Content-Type: application/json");
require_once 'LoveDatabase.class.php';

try {
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
    $response = array(
        'success' => true,
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
} catch (Exception $ex) {
    $response = array(
        'success' => false,
        'message' => $ex->getMessage()
    );
}

echo json_encode($response);
