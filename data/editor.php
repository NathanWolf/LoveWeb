<?php
require_once 'LoveAdminDatabase.class.php';
require_once 'utilities.inc.php';

try {
    $action = getParameter('action');
    $db = new com\elmakers\love\LoveAdminDatabase();
    $user = getParameter('user');
    $token = getParameter('token');
    $db->authorize($user, $token);

    switch ($action) {
        case 'save_character':
            $allProperties = $db->getProperties();
            $characterId = getParameter('character');
            $properties = getParameter('properties');
            $properties = json_decode($properties, true);
            $character = array('id' => $characterId);
            foreach ($properties as $propertyId => $value) {
                if ($propertyId == 'backstory') {
                    $character['backstory'] = $value;
                } else if ($propertyId == 'description') {
                    $character['description'] = $value;
                } else if ($propertyId == 'first_name') {
                    $character['first_name'] = $value;
                } else if ($propertyId == 'last_name') {
                    $character['last_name'] = $value;
                } else if ($propertyId == 'chat') {
                    if ($value) {
                        $value = array('system' => $value);
                        $character['chat'] = json_encode($value);
                    } else {
                        $character['chat'] = null;
                    }
                } else if ($propertyId == 'portraitOffset') {
                    $character['portrait'] = json_encode(array('offset' => $value));
                } else {
                    if (!isset($allProperties[$propertyId])) {
                        throw new Exception("Unknown property: $propertyId");
                    }
                    if ($value) {
                        $newProperty = array(
                            'persona_id' => $characterId,
                            'property_id' => $propertyId,
                            'value' => $value
                        );
                        $db->replace('persona_property', $newProperty);
                    } else {
                        $db->execute('DELETE FROM persona_property where persona_id=:character AND property_id=:property',
                            array('character' => $characterId, 'property' => $propertyId)
                        );
                    }
                }
            }
            if (count($character) <= 1) {
                throw new Exception("No data to save");
            }
            $db->save('persona', $character);
            die(json_encode(array('success' => true, 'user' => $user, 'character' => $character)));
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
