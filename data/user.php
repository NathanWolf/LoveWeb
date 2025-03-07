<?php
require_once 'LoveDatabase.class.php';
require_once 'utilities.inc.php';

try {
    $action = getParameter('action');
    $db = new com\elmakers\love\LoveDatabase();

    switch ($action) {
        case 'login':
            $email = getParameter('email');
            $password = getParameter('password');
            $user = $db->login($email, $password, $_SERVER['REMOTE_ADDR']);
            die(json_encode(array('success' => true, 'user' => $user)));
        case 'logout':
            $userId = getParameter('user');
            $token = getParameter('token');
            $db->logout($userId, $token);
            die(json_encode(array('success' => true)));
        case 'register':
            $email = getParameter('email');
            $password = getParameter('password');
            $firstName = getParameter('first', '');
            $lastName = getParameter('last', '');
            $user = $db->createUser($email, $password, $firstName, $lastName, $_SERVER['REMOTE_ADDR']);
            die(json_encode(array('success' => true, 'user' => $user)));
        case 'save_property';
            $userId = getParameter('user');
            $token = getParameter('token');
            $user = $db->validateLogin($userId, $token);
            $property = getParameter('property');
            $value = getParameter('value');
            $db->saveUserProperty($userId, $property, $value);
            $user['properties'][$property] = array(
                'property_id' => $property,
                'value' => $value
            );
            die(json_encode(array('success' => true, 'user' => $user)));
        case 'return':
            $userId = getParameter('user');
            $token = getParameter('token');
            $user = $db->validateLogin($userId, $token);
            die(json_encode(array('success' => true, 'user' => $user)));
        case 'users':
            $userId = getParameter('user');
            $token = getParameter('token');
            $user = $db->validateLogin($userId, $token);
            if (!$user['admin']) {
                die(json_encode(array('success' => false, 'message' => 'Unauthorized')));
            }
            $users = $db->getConversationUsers();
            die(json_encode(array('success' => true, 'users' => $users)));
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
