<?php

include "../util.php";
include "../database.php";

$conn = connect();

$sql = "SELECT * FROM Maps";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $maps = array();
    while ($row = $result->fetch_assoc()) {
        array_push($maps, $row);
    }
    echo json_encode(array("code" => 200, "data" => $maps));
} else {
    echo "0 results";
}

$conn->close();


