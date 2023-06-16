<?php

include "../util.php";
include "../database.php";

if (checkAuthed()) {
    $params = getParams(array("posX", "posY", "mapId", "userId"));
    $sql = "INSERT INTO Spots (PosX, PosY, MapId, isUsefull, userId) VALUES (?, ?, ?, 0, ?)";

    $conn = connect();
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiii", $params["posX"], $params["posY"], $params["mapId"], $params["userId"]);
    $stmt->execute();

    echo json_encode(array("code" => 200, "message" => "Spot created"));
} else {
    throwCode("Not authorized", 401, "Not authorized");
}
