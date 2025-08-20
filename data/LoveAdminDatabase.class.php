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

    public function updatePortrait($characterId, $portrait) {
        $record = array('id' => $characterId, 'portrait' => json_encode($portrait) );
        $this->save('persona', $record);
    }

    public function saveDressupItemTitle($dressupItem) {
        $sql = <<<SQL
UPDATE persona_dressup_item SET title = :title WHERE persona_id = :persona AND category_id = :category AND image_id = :item
SQL;
        $data = array(
            'title' => $dressupItem['title'],
            'persona' => $dressupItem['persona_id'],
            'category' => $dressupItem['category_id'],
            'item' => $dressupItem['image_id'],
        );
        $this->execute($sql, $data);
    }
}
