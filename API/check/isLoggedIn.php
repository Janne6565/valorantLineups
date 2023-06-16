<?php

include "../database.php";
include "../util.php";

$conn = connect();

$parameters = getParams(["userId", "authKey"]);

$userId = $parameters["userId"];
$authKey = $parameters["authKey"];

$sql = "SELECT * FROM UserAuths WHERE UserAuths.UserId = ? AND UserAuths.AuthKey = ? AND UserAuths.ExpirationDate > NOW()";

$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $userId, $authKey);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $query = "SELECT * FROM Users WHERE Users.ID = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $res = $result->fetch_assoc();
    $res["Password"] = null;

    echo json_encode(array("isLoggedIn" => true, "user" => $res, "code" => 200));
} else {
    echo json_encode(array("isLoggedIn" => false, "code" => 401));
}
