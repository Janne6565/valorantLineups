<?php

include "../util.php";
include "../database.php";

if (checkAuthed()) {
    $params = getParams(array("lineupId", "userId"));


    $sql = "";
    $stmt = null;
    if (isUserAdmin()) {
        $sql = "DELETE FROM Lineups WHERE ID = ?";

        $conn = connect();
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $params["lineupId"]);
    } else {
        $sql = "SELECT * FROM Lineups WHERE ID = ? AND UserID = ?";

        $conn = connect();
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $params["lineupId"], $params["userId"]);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        throwCode("Lineup not found", 404, "Lineup not found");
    }
} else {
    throwCode("Not authorized", 401, "Not authorized");
}
