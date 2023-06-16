<?php

include "../util.php";
include "../database.php";

$conn = connect();

$params = getParams(array("mapId"));

$sql = "SELECT * FROM Spots WHERE MapId = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $params["mapId"]);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $spots = array();
    while ($row = $result->fetch_assoc()) {
        array_push($spots, $row);
    }

    echo json_encode(array("code"=>200, "data"=>$spots));
} else {
    echo json_encode(array("code"=>404, "message"=>"No spots found"));
}
