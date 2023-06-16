<?php

include "../util.php";
include "../database.php";

$params = getParams(array("agent"));

$conn = connect();
$agent = $params["agent"];

$sql = "SELECT * FROM Abilitys WHERE AgentId = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $agent);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $abilities = array();
    while ($row = $result->fetch_assoc()) {
        array_push($abilities, $row);
    }
    echo json_encode(array("code" => 200, "data" => $abilities));
} else {
    echo "0 results";
}

$conn->close();
