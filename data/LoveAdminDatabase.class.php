<?php

namespace com\elmakers\love;

require_once 'LoveDatabase.class.php';

class LoveAdminDatabase extends LoveDatabase {
    public function __construct() {
        parent::__construct(true);
    }

    public function authorize($email, $token) {
        $user = $this->validateLogin($email, $token);
        if (!$user || !$user['admin']) {
            throw new Exception("Unauthorized user");
        }
    }
}
