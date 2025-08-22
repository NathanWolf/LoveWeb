<?php

namespace com\elmakers\love;

use Exception;

require_once 'Database.class.php';

class LoveDatabase extends Database {
    public static $HASH_ALGORITHM = 'sha256';

    public function createUser($email, $password, $firstName, $lastName, $address) {
        $existing = $this->lookupUser($email);
        if ($existing) {
            throw new Exception("User $email already exists");
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $user = array(
            'email' => $email,
            'password_hash' => $hash,
            'first_name' => $firstName,
            'last_name' => $lastName
        );
        $this->insert('user', $user);
        $user = $this->lookupUser($email);
        if (!$user) {
            throw new Exception("Failed to create new user account");
        }
        $token = $this->generateToken();
        $this->insert('user_token', array('user_id' => $user['id'], 'token' => $token, 'remote_address' => $address));
        $this->sanitize($user, $token);
        $user['properties'] = array();
        return $user;
    }

    public function getUsers() {
        return $this->getAll('user');
    }

    public function getConversationUsers() {
        $sql = <<<CDATA
with latest_conversation as (
    select user_id, max(conversation.updated) as latest_updated
    from conversation
    group by user_id
),
latest_token as (
    select user_id, max(user_token.token) as latest_token
    from user_token
    group by user_id
)
select user.id, user.first_name, user.last_name, user.email, 
       latest_conversation.latest_updated as latest_chat,
       latest_token.latest_token as token
from user
left join latest_conversation
    on user.id = latest_conversation.user_id
left join latest_token
    on user.id = latest_token.user_id
order by latest_conversation.latest_updated desc;
CDATA;
        return $this->query($sql);
    }

    private function generateToken() {
        return bin2hex(random_bytes(16));;
    }

    public function login($email, $password, $address) {
        $user = $this->lookupUser($email);
        if (!$user) {
            throw new Exception("Unknown user $email");
        }
        if (!password_verify($password, $user['password_hash'])) {
            throw new Exception("Incorrect password for user $email");
        }
        $token = $this->generateToken();
        $this->insert('user_token', array('user_id' => $user['id'], 'token' => $token, 'remote_address' => $address));
        $this->sanitize($user, $token);
        return $user;
    }

    public function sanitize(&$user, $token) {
        unset($user['password_hash']);
        $user['token'] = $token;
    }

    public function changePassword($userId, $token, $password) {
        $user = $this->validateLogin($userId, $token);
        $user['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        $this->saveUser($user);
    }

    public function forceChangePassword($email, $password) {
        $user = $this->lookupUser($email);
        if (!$user) {
            throw new Exception("Invalid user $email");
        }
        $user['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        $this->saveUser($user);
    }

    public function validateLogin($userId, $token) {
        $user = $this->getUser($userId);
        if (!$user) {
            throw new Exception("Invalid user: $userId");
        }
        $token = $this->queryOne('user_token', 'user_id=:user AND token=:token', array('user' => $userId, 'token' => $token));
        if (!$token){
            throw new Exception("Invalid logic for user: $userId");
        }
        $this->sanitize($user, $token['token']);
        return $user;
    }

    public function logout($userId, $token) {
        $this->validateLogin($userId, $token);
        $this->execute('DELETE FROM user_token WHERE user_id=:user AND token=:token', array('user' => $userId, 'token' => $token));
    }

    private function processUser(&$user) {
        if ($user) {
            $user['properties'] = $this->getUserProperties($user['id']);
            if ($user['chat']) {
                $user['chat'] = json_decode($user['chat'], true);
            }
            if ($user['preferences']) {
                $user['preferences'] = json_decode($user['preferences'], true);
            } else {
                $user['preferences'] = array();
            }
        }
    }

    public function lookupUser($email) {
        $user = $this->get('user', $email, 'email');
        $this->processUser($user);
        return $user;
    }

    public function getUser($userId) {
        $user = $this->get('user', $userId);
        $this->processUser($user);
        return $user;
    }

    public function saveUser($user) {
        unset($user['properties']);
        if (isset($user['preferences'])) {
            $user['preferences'] = json_encode($user['preferences']);
        }
        $this->save('user', $user);
    }

    public function getUserProperties($userId) {
        $properties = $this->query('SELECT property_id, value FROM user_property WHERE user_id = :id',
            array('id' => $userId)
        );
        return $this->index($properties, 'property_id');
    }

    public function getTierLists() {
        $tierLists = $this->getAll('tier_list');
        $tiers = $this->getAll('tier', 'priority desc');

        $results = array();
        foreach ($tierLists as $tierList) {
            $tierList['tiers'] = array();
            $results[$tierList['id']] = $tierList;
        }
        foreach ($tiers as $tier) {
            $results[$tier['tier_list_id']]['tiers'][$tier['id']] = $tier;
        }

        return $results;
    }

    public function getCharacter($id) {
        return $this->fixupCharacter($this->get('persona', $id));
    }

    public function getCharacterImages($characterId) {
        $images = $this->get('persona_image', $characterId, 'persona_id');
        return self::index($images, 'image_id');
    }

    public function getCharacterRelationships($characterId) {
        return $this->query('SELECT * FROM persona_relationship WHERE persona_id = :id', array('id' => $characterId));
    }

    public function getCharacterProperties($characterId) {
        return $this->query('SELECT * FROM persona_property WHERE persona_id = :id', array('id' => $characterId));
    }

    public function getCharacterRelationship($characterId, $relationshipId, $targetId) {
        $records = $this->query(
            'SELECT * FROM  persona_relationship WHERE persona_id = :id AND relationship_id = :relationship AND related_persona_id = :target',
            array('id' => $characterId, 'relationship' => $relationshipId, 'target' => $targetId)
        );
        return $records ? $records[0] : null;
    }

    public function addCharacterRelationship($characterId, $relationshipId, $targetId) {
        $record = array(
            'persona_id' => $characterId,
            'relationship_id' => $relationshipId,
            'related_persona_id' => $targetId
        );
        $this->insert('persona_relationship', $record);
    }

    public function removeCharacterRelationship($characterId, $relationshipId, $targetId) {
        $this->execute(
            'DELETE FROM  persona_relationship WHERE persona_id = :id AND relationship_id = :relationship AND related_persona_id = :target',
            array('id' => $characterId, 'relationship' => $relationshipId, 'target' => $targetId)
        );
    }

    public function getCharacterImage($characterId, $imageId) {
        return $this->queryOne('persona_image', 'persona_id=:persona AND image_id=:image', array('persona' => $characterId, 'image' => $imageId));
    }

    private function fixupCharacter($character) {
        $character['tiers'] = array();
        $character['relationships'] = array();
        $character['properties'] = array();
        $character['images'] = array();
        $character['name'] = $character['first_name'];
        if ($character['nick_name']) {
            $character['name'] = $character['nick_name'];
        }
        if ($character['variant_name']) {
            $character['name'] .= ' (' . $character['variant_name'] . ')';
        }
        $character['full_name'] = $character['first_name'];
        if ($character['last_name']) {
            $character['full_name'] .= ' ' . $character['last_name'];
        }
        if ($character['chat']) {
            $character['chat'] = json_decode($character['chat'], true);
        }
        if ($character['portrait']) {
            $character['portrait'] = json_decode($character['portrait'], true);
        }
        return $character;
    }

    private function fixupRealm($realm) {
        $realm['properties'] = array();
        $realm['images'] = array();
        if ($realm['chat']) {
            $realm['chat'] = json_decode($realm['chat'], true);
        }
        return $realm;
    }

    public function getNewCharacters($amount) {
        $characters = $this->index($characters);
        return $characters;
    }

    public function getCharacters($amount = 0) {
        // Note that the db name is "persona" to avoid issues with "character" being a reserved word.
        if ($amount) {
            $characters = $this->getAll('persona', 'created desc');
            $characters = array_splice($characters, 0, $amount);
        } else {
            $characters = $this->getAll('persona');
        }
        $relationships = $this->getAll('persona_relationship');
        $tiers = $this->getAll('persona_tier');
        $properties = $this->getAll('persona_property');
        $images = $this->getAll('persona_image');

        $allCharacters = array();
        foreach ($characters as $character) {
            $allCharacters[$character['id']] = $this->fixupCharacter($character);
        }
        foreach ($relationships as $relationship) {
            if (!isset($allCharacters[$relationship['persona_id']])) continue;
            if (isset($allCharacters[$relationship['persona_id']]['relationships'][$relationship['relationship_id']])) {
                $allCharacters[$relationship['persona_id']]['relationships'][$relationship['relationship_id']][] = $relationship['related_persona_id'];
            } else {
                $allCharacters[$relationship['persona_id']]['relationships'][$relationship['relationship_id']] = array($relationship['related_persona_id']);
            }
        }
        foreach ($tiers as $tier) {
            if (!isset($allCharacters[$tier['persona_id']])) continue;
            $allCharacters[$tier['persona_id']]['tiers'][$tier['tier_list_id']] = $tier;
        }
        foreach ($properties as $property) {
            if (!isset($allCharacters[$property['persona_id']])) continue;
            $allCharacters[$property['persona_id']]['properties'][$property['property_id']] = $property['value'];
        }
        foreach ($images as $image) {
            if (!isset($allCharacters[$image['persona_id']])) continue;
            $allCharacters[$image['persona_id']]['images'][$image['image_id']] = $image;
        }

        $results = array();
        $alternates = array();
        foreach ($allCharacters as $character) {
            if ($character['base_id']) {
                if (!isset($alternates[$character['base_id']])) {
                    $alternates[$character['base_id']] = array();
                }
                $alternates[$character['base_id']][$character['id']] = $character;
            } else {
                $character['variants'] = array();
                $results[$character['id']] = $character;
            }
        }
        foreach ($alternates as $baseId => $alternateCharacters){
            $results[$baseId]['variants'] = $alternateCharacters;
        }
        return $results;
    }

    public function getRealms() {
        $realms = $this->getAll('realm');
        $properties = $this->getAll('realm_property');
        $images = $this->getAll('realm_image');

        $results = array();
        foreach ($realms as $realm) {
            $results[$realm['id']] = $this->fixupRealm($realm);
        }
        foreach ($properties as $property) {
            if (!isset($results[$property['realm_id']])) continue;
            $results[$property['realm_id']]['properties'][$property['realm_property_type_id']] = $property['value'];
        }
        foreach ($images as $image) {
            if (!isset($results[$image['realm_id']])) continue;
            $results[$image['realm_id']]['images'][$image['image_id']] = $image;
        }

        return $results;
    }

    public function getRealm($id) {
        return $this->fixupRealm($this->get('realm', $id));
    }

    public function getRealmProperties($realmId) {
        return $this->query('SELECT * FROM realm_property WHERE realm_id = :id', array('id' => $realmId));
    }

    public function getRealmPersonas($realmId) {
        return $this->query('SELECT * FROM realm_persona WHERE realm_id = :id', array('id' => $realmId));
    }

    public function getQuizzes() {
        $quizzes = $this->getAll('quiz');
        $quizzes = $this->index($quizzes);
        foreach ($quizzes as &$quizRef) {
            $quizRef['questions'] = array();
        }
        $questions = $this->getAll('quiz_question');
        foreach ($questions as &$questionRef) {
            $questionRef['answers'] = array();
        }
        $questions = $this->index($questions);
        $answers = $this->getAll('quiz_answer');
        foreach ($answers as $answer) {
            if (isset($questions[$answer['quiz_question_id']])) {
                $questions[$answer['quiz_question_id']]['answers'][] = $answer;
            }
        }
        foreach ($questions as $question) {
            if (isset($quizzes[$question['quiz_id']])) {
                $quizzes[$question['quiz_id']]['questions'][] = $question;
            }
        }
        return $quizzes;
    }

    public function getRelationships() {
        $relationships = $this->getAll('relationship');
        $relationships = $this->index($relationships);
        return $relationships;
    }

    public function getProperties() {
        $properties = $this->getAll('property', 'question, priority desc');
        $properties = $this->index($properties);
        return $properties;
    }

    public function getRealmPropertyTypes() {
        $properties = $this->getAll('realm_property_type', 'id, priority desc');
        $properties = $this->index($properties);
        return $properties;
    }

    public function getMonths() {
        $months = $this->getAll('month');
        $months = $this->index($months);
        return $months;
    }

    public function getMiniPersona() {
        $mini = $this->getAll('persona_mini');
        $mini = $this->index($mini, 'persona_id');
        return $mini;
    }

    public function getDressupPersona() {
        $dressup = $this->getAll('persona_dressup');
        foreach ($dressup as &$dressupRef) {
            $dressupRef['items'] = array();
            $dressupRef['categories'] = array();
        }
        $dressup = $this->index($dressup, 'persona_id');
        $items = $this->getAll('persona_dressup_item');
        foreach ($items as $item) {
            if (!isset($dressup[$item['persona_id']]['items'][$item['category_id']])) {
                $dressup[$item['persona_id']]['items'][$item['category_id']] = array();
            }
            $dressup[$item['persona_id']]['items'][$item['category_id']][$item['image_id']] = $item;
        }
        $categories = $this->getAll('persona_dressup_category');
        foreach ($categories as $category) {
            $dressup[$category['persona_id']]['categories'][$category['category_id']] = $category;
        }

        return $dressup;
    }

    public function getDressupCategories() {
        $dressup = $this->getAll('dressup_category', 'priority');
        $dressup = $this->index($dressup);
        return $dressup;
    }

    public function getTimelineEvents() {
        return $this->getAll('timeline_event', 'year, month, day, priority');
    }

    public function saveUserProperty($userId, $propertyId, $value) {
        $property = $this->queryOne(
            'user_property',
            'user_id = :user AND property_id = :property',
            array('user' => $userId, 'property' => $propertyId)
        );
        if (!$property) {
            $property = array('user_id' => $userId, 'property_id' => $propertyId, 'value' => $value);
            $this->insert('user_property', $property);
        } else {
            $property['value'] = $value;
            $this->save('user_property', $property, 'user_id', 'property_id');
        }
    }

    public function createPortrait($characterImage, $targetWidth = 256, $targetHeight = 256, $outputFilename = null) {
        if (!isset($characterImage['persona_id'])) {
            throw new Exception("Invalid character image record: " . json_encode($characterImage));
        }
        $characterId = $characterImage['persona_id'];
        $metadata = $characterImage['metadata'];
        $metadata = $metadata ? json_decode($metadata, true) : array();
        if (!isset($metadata['center']) || !isset($metadata['radius'])) {
            throw new Exception("Character $characterImage missing portrait info: " . json_encode($characterImage));
        }
        $fullImage = dirname(__FILE__) . '/../image/dynamic/characters/' . $characterId . '/full.png';
        if (!file_exists($fullImage)) {
            throw new Exception("No character image found at: $fullImage");
        }

        $image = imagecreatefrompng($fullImage);
        if (!$fullImage) {
            throw new Exception(" Error loading $fullImage");
        }
        list($centerX, $centerY) = $metadata['center'];
        $radius = $metadata['radius'];
        $crop = array(
            'x' => $centerX - $radius,
            'y' => $centerY - $radius,
            'width' => $radius * 2,
            'height' => $radius * 2
        );
        $cropped = imagecrop($image, $crop);
        $scaled = imagescale($cropped, $targetWidth, $targetHeight);
        imagesavealpha($scaled, true);
        if (!$outputFilename) {
            $outputFolder = dirname(__FILE__) . '/../image/dynamic/characters/' . $characterId;
            if (!file_exists($outputFolder)) {
                @mkdir($outputFolder, 0777, true);
            }
            $outputFilename = $outputFolder . '/portrait.png';
        }
        imagepng($scaled, $outputFilename);
    }

    public function findOutfit($personaId, $outfit) {
        $outfit = json_encode($outfit);
        $hash = hash(self::$HASH_ALGORITHM, $outfit);
        $existing = $this->query('SELECT * FROM dressup_outfit WHERE hash = :hash and persona_id = :persona', array('hash' => $hash, 'persona' => $personaId));
        foreach ($existing as $check) {
            if ($check['outfit'] == $outfit) return $check;
        }
        return null;
    }

    public function saveOutfit($personaId, $outfit) {
        $existing = $this->findOutfit($personaId, $outfit);
        if ($existing) {
            return $existing;
        }
        $outfitString = json_encode($outfit);
        $hash = hash(self::$HASH_ALGORITHM, $outfitString);
        $newRecord = array(
            'outfit' => $outfitString,
            'persona_id' => $personaId,
            'hash' => $hash,
            'hash_algorithm' => self::$HASH_ALGORITHM,
            'version' => 1
        );
        $this->insert('dressup_outfit', $newRecord);
        // Can't get the auto-generated uuid without finding the new record
        $newRecord = $this->findOutfit($personaId, $outfit);
        if (!$newRecord) {
            throw new Exception("Failed to create new dressup_outfit record");
        }
        return $newRecord;
    }

    public function saveUserOutfit($userId, $outfitId, $title) {
        $sql = <<<SQL
INSERT INTO user_dressup_outfit (user_id, outfit_id, title) VALUES (:user, :outfit, :title) ON DUPLICATE KEY UPDATE share_count = share_count + 1, title = COALESCE(:newtitle, title)
SQL;
        $this->execute($sql, array('user' => $userId, 'outfit' => $outfitId, 'title' => $title, 'newtitle' => $title));
    }

    public function loadUserOutfit($userId, $outfitId) {
        $records = $this->query('SELECT * FROM user_dressup_outfit WHERE user_id = :user and outfit_id = :outfit', array('user' => $userId, 'outfit' => $outfitId));
        return $records ? $records[0] : null;
    }

    public function loadOutfit($id) {
        return $this->get('dressup_outfit', $id);
    }

    public static function makeOutfitItemTitle($categoryId, $itemId) {
        $title = $itemId;
        $categoryIdSingular = substr($categoryId, 0, -1);
        $categoryIdSecondary = null;
        $categoryIdTertiary = null;
        if ($categoryId == 'accessories') {
            $categoryIdSingular = 'accessory';
        } else if ($categoryId == 'eyes_left') {
            $categoryIdSingular = 'left_eye';
            $categoryIdSecondary = '_eye_left';
            $categoryIdTertiary = 'eye_left_';
        } else if ($categoryId == 'eyes_right') {
            $categoryIdSingular = 'right_eye';
            $categoryIdSecondary = '_eye_right';
            $categoryIdTertiary = 'eye_right_';
        } else if ($categoryId == 'hair_back') {
            $categoryIdSingular = 'back_hair';
        } else if ($categoryId == 'hair_front') {
            $categoryIdSingular = 'front_hair';
        }
        $title = str_replace($categoryId . '_', '', $title);
        $title = str_replace($categoryIdSingular . '_', '', $title);
        if ($categoryIdSecondary) {
            $title = str_replace($categoryIdSecondary, '', $title);
        }
        if ($categoryIdTertiary) {
            $title = str_replace($categoryIdTertiary, '', $title);
        }
        $title = str_replace('_', ' ', $title);
        $title = ucwords($title);
        $title = str_replace('Tshirt', 'T-Shirt', $title);

        return $title;
    }
}
