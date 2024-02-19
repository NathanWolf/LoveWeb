<?php

if (PHP_SAPI !== 'cli') {
    die('What are you doing?');
}

require_once '../data/LoveAdminDatabase.class.php';

$tierLists = json_decode(file_get_contents('../data/tiers.json'), true);
if (!$tierLists) {
    die("Could not parse tiers.json\n");
}

$db = new \com\elmakers\love\LoveAdminDatabase();

$updated = 0;
$inserted = 0;
foreach ($tierLists as $tierListId => $tierList) {
    $existing = $db->get('tier_list', $tierListId);
    if ($existing) {
        // Not sure we need this.
    } else {
        $newTierList = array('id' => $tierListId, 'name' => $tierList['name']);
        $db->insert('tier_list', $newTierList);
        foreach ($tierList['tiers'] as $tierId => $tier) {
            $newTier = array(
                'id' => $tierId,
                'tier_list_id' => $tierListId,
                'color' => $tier['color'],
                'name' => $tier['title'],
                'dark' => isset($tier['dark']) ? 1 : 0
            );
            $db->insert('tier', $newTier);
        }
        $inserted++;
    }
}

if ($updated) {
    echo "Updated $updated tier lists\n";
}
if ($inserted) {
    echo "Added $inserted tier lists\n";
}
echo "Done.\n";

