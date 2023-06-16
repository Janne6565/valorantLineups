<?php

include "../util.php";
include "../database.php";

$conn = connect();

$sql = "SELECT * FROM Agents";

$result = $conn->query($sql);
$agents = array();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $roleId = $row["RoleId"];
        $sql = "SELECT * FROM Roles WHERE ID = $roleId;";
        $roleResult = $conn->query($sql);
        $role = $roleResult->fetch_assoc();

        $row["Role"] = $role;

        array_push($agents, $row);
    }
    echo json_encode(array("code" => 200, "data" => $agents));
} else {
    echo "0 results";
}

$conn->close();
