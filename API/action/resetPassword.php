<?php

include '../util.php';
include '../database.php';

$conn = connect();

$params = getParams(array("email"));

$email = $params["email"];

$sql = "SELECT * FROM Users WHERE Users.Email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    throwCode("Email not found", 404, "Email not found");
} else {
    $reslt = $result->fetch_assoc();
    $userId = $reslt["ID"];

    $sql = "INSERT INTO UserPasswordResetKey (UserId, AuthKey, ExpirationDate) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))";

    $authKey = bin2hex(random_bytes(32));

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $userId, $authKey);
    $stmt->execute();

    $header = "From: StratsSync <stratssync@stratssync.com>\r\n";

    $link = "https://projektejwkk.de/valorantLineups/resetPassword?authKey=" . $authKey;

    $text = "Hello, as you have requested here is the link to reset your Password: " . $link . "\r\nThis Link expires in 1 Hour\r\nIf you did not request this, just ignore this email. \r\n\r\nBest regards, \r\nStatsSync";

    mail($email, "Password Reset", $text, $header);

    echo json_encode(array("message" => "Email sent", "code" => 200, "title" => "Email sent"));
}
