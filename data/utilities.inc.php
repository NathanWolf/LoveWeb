<?php

function getParameter($parameter, $defaultValue = null) {
    if (!isset($_REQUEST[$parameter])) {
        if (!is_null($defaultValue)) {
            return $defaultValue;
        }
        throw new Exception("Missing required parameter: $parameter");
    }

    return $_REQUEST[$parameter];
}
