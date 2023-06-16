<?php

include "../util.php";
include "../database.php";

if (checkAuthed()) {
    $params = getParams(array("userId"));
    $sql = "DELETE FROM Users WHERE ID = ?";
    $conn = connect();
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $params["userId"]);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    throwCode("Not authorized", 401, "Not authorized");
}