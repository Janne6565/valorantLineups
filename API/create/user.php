<?php

include "../util.php";
include "../database.php";

$parameters = getParams(array("username", "password", "email", "color"));

$username = $parameters["username"];
$password = $parameters["password"];
$email = $parameters["email"];

if (strlen($username) < 3) {
    throwCode("Username is too short", 400, "Username too short");
}

if (strlen($password) < 8) {
    throwCode("Password is too short", 400, "Password too short");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    throwCode("Email is not valid", 400, "Email not valid");
}

$passwordHashed = password_hash($password, PASSWORD_DEFAULT);

$conn = connect();

$query = "INSERT INTO Users (Username, Email, Password, Color) VALUES (?, ?, ?, ?)";

$stmt = $conn->prepare($query);

$stmt->bind_param("ssss", $username, $email, $passwordHashed, $parameters["color"]);

if (!$stmt->execute()) {
    throwCode("Email already exists", 400, "There was an error executing the query");
}

$header = "From: StratsSync <stratssync@stratssync.com>\r\n";

mail($email, "Welcome to StratsSync", "Welcome to the Lineup Guide StratsSync, " . $username . "! \n\nWe hope you enjoy your stay! \n\n- The StratsSync Team", $header);


echo json_encode(array("message" => "User created", "code" => 200, "title" => "User created", "data" => array("id" => $conn->insert_id)));

$conn->close();
