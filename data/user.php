<?php
require_once 'LoveDatabase.class.php';
require_once 'utilities.inc.php';

try {
    $action = getParameter('action');
    $db = new com\elmakers\love\LoveDatabase();

    switch ($action) {
        case 'login':
            $email = getParameter('user');
            $password = getParameter('password');
            $token = $db->login($email, $password);
            die(json_encode(array('success' => true, 'token' => $token)));
        case 'logout':
            $email = getParameter('user');
            $token = getParameter('token');
            $db->validateLogin($email, $token);
            $db->logout($email);
            die(json_encode(array('success' => true)));
        case 'register':
            $email = getParameter('user');
            $password = getParameter('password');
            $firstName = getParameter('first', '');
            $lastName = getParameter('last', '');
            $token = $db->createUser($email, $password, $firstName, $lastName);
            die(json_encode(array('success' => true, 'token' => $token)));
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
