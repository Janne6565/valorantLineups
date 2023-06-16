<?php

include "../util.php";
include "../database.php";

$params = getParams(array("email", "password"));

$conn = connect();

$query = "SELECT * FROM Users WHERE Email = ?";

$stmt = $conn->prepare($query);

$stmt->bind_param("s", $params["email"]);

$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows == 0) {
    throwCode("email or password is wrong", 400, "Email or password is wrong");
}

$user = $result->fetch_assoc();

if (!password_verify($params["password"], $user["Password"])) {
    throwCode("Email or password is wrong", 400, "Email or password is wrong");
} else {
    $query = "SELECT * FROM UserAuths WHERE UserId = ? AND ExpirationDate > NOW()";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $user["ID"]);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        $token = bin2hex(random_bytes(32));
        $query = "INSERT INTO UserAuths (UserId, AuthKey, ExpirationDate) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 31 DAY))";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $user["ID"], $token);
        $stmt->execute();

        echo json_encode(array("message" => "User logged in", "code" => 200, "title" => "User logged in", "id" => $user["ID"], "token" => $token));
    } else {
        $token = $result->fetch_assoc()["AuthKey"];
        echo json_encode(array("message" => "User logged in", "code" => 200, "title" => "User logged in", "id" => $user["ID"], "token" => $token));
    }
}

$conn->close();
