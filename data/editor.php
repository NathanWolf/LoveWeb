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
        case 'save_event':
            $event = getParameter('event');
            $event = json_decode($event, true);
            if (!$event) {
                throw new Exception("Invalid event parameter");
            }
            if ($event['id']) {
                $db->save('timeline_event', $event);
            } else {
                $event['id'] = $db->insert('timeline_event', $event);
            }
            die(json_encode(array('success' => true, 'user' => $user, 'event' => $event)));
            case 'save_character':
            $debug = array();
            $allProperties = $db->getProperties();
            $characterId = getParameter('character');
            $properties = getParameter('properties');
            $properties = json_decode($properties, true);
            $existing = $db->getCharacter($characterId);
            if (!$existing) {
                throw new Exception("Unknown character: $characterId");
            }
            $character = array('id' => $characterId);
            $images = array();
            $relationships = array();
            $newRelationships = array();
            foreach ($properties as $propertyId => $value) {
                if ($propertyId == 'backstory') {
                    $character['backstory'] = $value;
                } else if ($propertyId == 'notes') {
                    $character['notes'] = $value;
                } else if ($propertyId == 'description') {
                    $character['description'] = $value;
                } else if ($propertyId == 'nick_name') {
                    $character['nick_name'] = $value;
                } else if ($propertyId == 'birth_name') {
                    $character['birth_name'] = $value;
                } else if ($propertyId == 'first_name') {
                    $character['first_name'] = $value;
                } else if ($propertyId == 'last_name') {
                    $character['last_name'] = $value;
                } else if ($propertyId == 'middle_name') {
                    $character['middle_name'] = $value;
                } else if ($propertyId == 'chat') {
                    if ($value) {
                        $character['chat'] = $value;
                    } else {
                        $character['chat'] = null;
                    }
                } else if ($propertyId == 'portrait') {
                    $portrait = json_decode($value, true);
                    $imageRecord = $db->getCharacterImage($characterId, 'portrait');
                    $version = 1;
                    if ($imageRecord) {
                        $imageRecord['version']++;
                        $metadata = $imageRecord['metadata'] ? json_decode($imageRecord['metadata'], true) : array();
                        $metadata = array_merge($metadata, $portrait);
                        $imageRecord['metadata'] = json_encode($metadata);
                        $db->save('persona_image', $imageRecord, 'persona_id', 'image_id');
                    } else {
                        $imageRecord = array(
                            'persona_id' => $characterId,
                            'image_id' => 'portrait',
                            'title' => 'Portrait',
                            'description' => "This character's headshot",
                            'tags' => 'portrait,current',
                            'width' => 256,
                            'height' => 256,
                            'metadata' => json_encode($portrait)
                        );
                        $db->insert('persona_image', $imageRecord);
                    }
                    $images = array('portrait' => $imageRecord);
                    $db->createPortrait($imageRecord);
                } else if ($propertyId == 'relationships') {
                    $relationships = json_decode($value, true);
                    $existingRelationships = $db->getCharacterRelationships($characterId);
                    $relationshipTypes = $db->getRelationships();
                    $existingMap = array();
                    foreach ($existingRelationships as $existingRelationship) {
                        $key = $existingRelationship['relationship_id'] . ':' . $existingRelationship['related_persona_id'];
                        $existingMap[$key] = $existingRelationship;
                    }
                    foreach ($relationships as $relationshipType => $targetList) {
                        foreach ($targetList as $target) {
                            $key = $relationshipType . ':' . $target;
                            if (isset($existingMap[$key])) {
                                unset($existingMap[$key]);
                            } else if (isset($relationshipTypes[$relationshipType])) {
                                $debug[] = "Adding new relationship for $characterId: $relationshipType $target";
                                $db->addCharacterRelationship($characterId, $relationshipType, $target);
                                $newRelationships[] = array('persona_id' => $characterId, 'relationship_id' => $relationshipType, 'related_persona_id' => $target);
                                $relationshipTypeRecord = $relationshipTypes[$relationshipType];
                                if ($relationshipTypeRecord['inverse_relationship_id']) {
                                    $inverseType = $relationshipTypeRecord['inverse_relationship_id'];
                                    $existing = $db->getCharacterRelationship($target, $inverseType, $characterId);
                                    if (!$existing) {
                                        $debug[] = "Adding new inverse relationship for $target: $inverseType $characterId";
                                        $db->addCharacterRelationship($target, $inverseType, $characterId);
                                        $newRelationships[] = array('persona_id' => $target, 'relationship_id' => $inverseType, 'related_persona_id' => $characterId);
                                    }
                                }
                            } else {
                                throw new Exception("Unknown relationship type: $relationshipType");
                            }
                        }
                    }
                    // Remove any that aren't valid anymore
                    foreach ($existingMap as $remove) {
                        $removeRelationshipId = $remove['relationship_id'];
                        $removeCharacterId = $remove['related_persona_id'];
                        $debug[] = "Removing relationship for $characterId: $removeRelationshipId $removeCharacterId";
                        $db->removeCharacterRelationship($characterId, $removeRelationshipId, $removeCharacterId);
                    }
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
            if ($images) {
                $character['images'] = $images;
            }
            if ($relationships) {
                $character['relationships'] = $relationships;
            }
            die(json_encode(array('success' => true, 'user' => $user, 'character' => $character, 'debug' => $debug, 'relationships' => $newRelationships)));
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
