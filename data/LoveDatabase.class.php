<?php

namespace com\elmakers\love;

use Exception;

require_once 'Database.class.php';

class LoveDatabase extends Database {
    public function createUser($email, $password, $firstName, $lastName) {
        $existing = $this->getUser($email);
        if ($existing) {
            throw new Exception("User $email already exists");
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $token = $this->generateToken();
        $user = array(
            'email' => $email,
            'password_hash' => $hash,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'token' => $token
        );
        $this->insert('user', $user);
        return $user;
    }

    private function generateToken() {
        return bin2hex(random_bytes(16));;
    }

    public function login($email, $password) {
        $user = $this->getUser($email);
        if (!$user) {
            throw new Exception("Unknown user $email");
        }
        if (!password_verify($password, $user['password_hash'])) {
            throw new Exception("Incorrect password for user $email");
        }
        if (!$user['token']) {
            $user['token'] = $this->generateToken();
            $this->save('user', $user);
        }
        $this->sanitize($user);
        return $user;
    }

    public function sanitize(&$user) {
        unset($user['password_hash']);
    }

    public function changePassword($email, $token, $password) {
        $user = $this->validateLogin($email, $token);
        $user['password_hash'] = password_hash($password);
        $this->save('user', $user);
    }

    public function forceChangePassword($email, $password) {
        $user = $this->getUser($email);
        if (!$user) {
            throw new Exception("Invalid user $email");
        }
        $user['password_hash'] = password_hash($password);
        $this->save('user', $user);
    }

    public function validateLogin($email, $token) {
        $user = $this->getUser($email);
        if (!$user || $user['token'] !== $token) {
            throw new Exception("Invalid login for $email");
        }
        return $user;
    }

    public function logout($email) {
        $this->execute('UPDATE user SET token=null WHERE email=:email', array('email' => $email));
    }

    public function getUser($email) {
        return $this->get('user', $email, 'email');
    }
}
