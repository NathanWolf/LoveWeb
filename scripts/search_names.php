<?php

use com\elmakers\love\LoveDatabase;

require_once '../data/config.inc.php';
require_once '../data/LoveAdminDatabase.class.php';

$love = new com\elmakers\love\LoveAdminDatabase();
$characters = $love->getCharacters();

// Your API key and Custom Search Engine ID
// You need to replace these with your actual credentials
$api_key = $_config['google']['key'];
$search_engine_id = $_config['google']['engine'];


foreach ($characters as $character) {
    if (!is_null($character['first_name_references'])) continue;
    $characterName = $character['first_name'];
    // URL encode the query
    $query = urlencode($characterName);

    // Build the API request URL
    $url = "https://www.googleapis.com/customsearch/v1";
    $params = [
        'key' => $api_key,
        'cx' => $search_engine_id,
        'exactTerms' => $query
    ];

    $request_url = $url . '?' . http_build_query($params);

    // Initialize cURL session
    $curl = curl_init();

    // Set cURL options
    curl_setopt_array($curl, [
        CURLOPT_URL => $request_url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTPHEADER => [
            'Referer: https://elmakers.com',
            'User-Agent: Mozilla/5.0 (compatible; CustomSearchApp/1.0)'
        ]
    ]);

    // Execute the request
    $response = curl_exec($curl);

    // Check for errors
    if (curl_errno($curl)) {
        echo "Error searching $characterName: " . curl_error($curl) . "\n";
        continue;
    }

    // Close cURL session
    curl_close($curl);

    // Decode the JSON response
    $search_results = json_decode($response, true);

    // Check if the search was successful
    if (isset($search_results['error'])) {
        echo "Error searching $characterName: " . $search_results['error']['message'] . "\n";
        continue;
    }

    // Get the total number of results
    if (!isset($search_results['searchInformation']['totalResults'])) {
        echo "Search result missing for $characterName\n";
        continue;
    }
    $total_results = intval($search_results['searchInformation']['totalResults']);

    $saveCharacter = array(
        'id' => $character['id'],
        'first_name_references' => $total_results
    );
    $love->save('persona', $saveCharacter);

    // Display the search query and number of results
    echo "Results for $characterName: $total_results\n";
    usleep(100);
}