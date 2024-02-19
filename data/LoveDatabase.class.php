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

    public function getTierLists() {
        $tierLists = $this->getAll('tier_list');
        $tiers = $this->getAll('tier');

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

    public function getCharacters() {
        // Note that the db name is "persona" to avoid issues with "character" being a reserved word.
        $characters = $this->getAll('persona');
        $relationships = $this->getAll('persona_relationship');
        $tiers = $this->getAll('persona_tier');
        $properties = $this->getAll('persona_property');

        $results = array();
        foreach ($characters as $character) {
            $character['tiers'] = array();
            $character['relationships'] = array();
            $character['properties'] = array();
            $character['name'] = $character['first_name'];
            $character['full_name'] = $character['first_name'];
            if ($character['last_name']) {
                $character['full_name'] .= ' ' . $character['last_name'];
            }
            $results[$character['id']] = $character;
        }
        foreach ($relationships as $relationship) {
            if (isset($results[$relationship['persona_id']]['relationships'][$relationship['id']])) {
                $results[$relationship['persona_id']]['relationships'][$relationship['id']][] = $relationship['related_persona_id'];
            } else {
                $results[$relationship['persona_id']]['relationships'][$relationship['id']] = array($relationship['related_persona_id']);
            }
        }
        foreach ($tiers as $tier) {
            $results[$tier['persona_id']]['tiers'][$tier['tier_list_id']] = $tier['tier_id'];
        }
        foreach ($properties as $property) {
            $results[$property['persona_id']]['properties'][$property['property_id']] = $property['value'];
        }

        return $results;
    }
}
