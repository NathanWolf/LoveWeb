<?php
spl_autoload_register(function( $class ) {
    $split = explode('\\', $class);
    $location =  __DIR__ . '/chat/chatgpt/' . implode('/', $split) . '.php';
    if (!is_readable($location)) {
        return;
    }

    require_once $location;
});
