<?php

include "../util.php";
include "../database.php";

if (checkAuthed()) {
    $params = getParams(array("userId", "spotId"));
    $sql = "DELETE FROM Spots WHERE ID = ? AND UserID = ?";
    $conn = connect();
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $params["spotId"], $params["userId"]);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    throwCode("Not authorized", 401, "Not authorized");
}