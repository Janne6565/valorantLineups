<?php

include "../util.php";
include "../database.php";

$conn = connect(); 

if (checkAuthed()) {
    $params = getParams(array("lineupId", "tagId", "userId"));

    $sqlCheck = "SELECT * FROM Lineups WHERE ID = ? AND UserID = ?";

    $stmtCheck = $conn->prepare($sqlCheck);
    $stmtCheck->bind_param("ii", $params["lineupId"], $params["userId"]);
    
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if ($resultCheck->num_rows == 0 && !isUserAdmin()) {
        throwCode("Lineup not found", 404, "Lineup not found");
    }

    $sql = "INSERT INTO LineupTags (LineupId, TagId) VALUES (?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $params["lineupId"], $params["tagId"]);
    $stmt->execute();
    $result = $stmt->get_result();

    throwCode("Success", 200, "Success");
} else {
    throwCode("Not authorized", 401, "Not authorized");
}