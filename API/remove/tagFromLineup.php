<?php

include "../util.php";
include "../database.php";

if (checkAuthed()) {
    $params = getParams(array("lineupId", "userId", "tagId"));

    if (!isUserAdmin()) {
        $sqlCheckOwned = "SELECT * FROM Lineups WHERE ID = ? AND UserID = ?";

        $stmtCheckOwned = $conn->prepare($sqlCheckOwned);
        $stmtCheckOwned->bind_param("ii", $params["lineupId"], $params["userId"]);

        $stmtCheckOwned->execute();
        $resultCheckOwned = $stmtCheckOwned->get_result();

        if ($resultCheckOwned->num_rows == 0) {
            throwCode("Lineup not found", 404, "Lineup not found");
        }
    }

    $sql = "DELETE FROM LineupTags, Lineups WHERE Lineups.id = LineupTags.LineupId AND Lineups.UserId = ? AND TagId = ? AND LineupId = ?";
    $conn = connect();
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $params["userId"], $params["tagId"], $params["lineupId"]);
    $stmt->execute();
    $result = $stmt->get_result();
    
} else {
    throwCode("Not authorized", 401, "Not authorized");
}
