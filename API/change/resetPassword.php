<?php

include "../util.php";
include "../database.php";


$params = getParams(array("authKey", "password"));

$authKey = $params["authKey"];
$password = $params["password"];

if (strlen($password) < 8) {
    throwCode("Password is too short", 400, "Password too short");
}

$password = password_hash($params["password"], PASSWORD_DEFAULT);

$conn = connect();

$sql = "SELECT * FROM UserPasswordResetKey, Users WHERE Users.ID = UserPasswordResetKey.UserId AND UserPasswordResetKey.AuthKey = ? AND UserPasswordResetKey.ExpirationDate > NOW()";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $authKey);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $rslt = $result->fetch_assoc();
    $userId = $rslt["UserId"];
    
    $query = "UPDATE Users SET Users.Password = ? WHERE Users.ID = ?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("si", $password, $userId);
    $stmt->execute();
    echo json_encode(array("message" => "Password changed", "code" => 200, "title" => "Password changed", "id" => $userId, "email" => $rslt["Email"]));

    $sqlToDelete = "DELETE FROM UserPasswordResetKey WHERE UserPasswordResetKey.AuthKey = ? AND UserPasswordResetKey.UserId = ?";
    $stmt = $conn->prepare($sqlToDelete);
    $stmt->bind_param("si", $authKey, $userId);
    $stmt->execute();
} else {
    throwCode("AuthKey not found", 404, "AuthKey not found");
}
