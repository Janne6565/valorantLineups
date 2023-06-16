<?php

include "../util.php";
include "../database.php";

$conn = connect();

$parameters = getParams(["userId", "newUsername"]);
if (checkAuthed()) {
    $sql = "UPDATE Users SET Username = ? WHERE UserId = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $parameters["newUsername"], $parameters["userId"]);
    $stmt->execute();
    echo json_encode(array("message" => "Username changed", "code" => 200, "title" => "Username changed"));
} else {
    throwCode("Not authorized", 401, "Not authorized");
}