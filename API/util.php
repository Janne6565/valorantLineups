<?php

function throwCode(string $message, int $code, string $title) {
    http_response_code($code);
    die(json_encode(array("message" => $message, "code" => $code, "title" => $title)));
}

function getParams(array $params): array {
    $parameters = array();

    foreach ($params as $param) {
        if (!isset($_GET[$param])) {
            throwCode("Missing parameter: " . $param, 400, "Missing parameter");
        }
        $parameters[$param] = $_GET[$param];
    }

    return $parameters;
}
 
function checkAuthed(): bool {
    $userId = $_GET["userId"];
    $authKey = $_GET["authKey"];

    $conn = connect();

    $sql = "SELECT * FROM UserAuths WHERE UserAuths.UserId = ? AND UserAuths.AuthKey = ? AND UserAuths.ExpirationDate > NOW()";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $userId, $authKey);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        return true;
    } else {
        return false;
    }
}

function isUserAdmin(): bool {
    if (checkAuthed()) {
        $userId = $_GET["userId"];

        $conn = connect();

        $sql = "SELECT * FROM Users WHERE Users.ID = ? AND Users.IsAdmin = 1";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

?>