<?php

namespace com\elmakers\love;

require_once 'LoveDatabase.class.php';

class LoveAdminDatabase extends LoveDatabase {
    public function __construct() {
        parent::__construct(true);
    }
}
