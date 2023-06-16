<?php
// activate errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);



include "../util.php";
include "../database.php";


$filters = array();
if (isset($_GET["tags"])) {
    $tags = $_GET["tags"];
    $filters["tags"] = explode(",", $tags);
} else {
    $filters["tags"] = array();
}


$conn = connectPdo();

$query = "SELECT * FROM Lineups ";

$stmt = null;

if (isset($_GET["abilityId"])) {
    $abilityId = $_GET["abilityId"];
    $filters["abilityId"] = $abilityId;
    $query .= "WHERE AbilityId = ? ORDER BY ID DESC";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(1, $abilityId, PDO::PARAM_INT);

    $stmt->execute();
} else {
    $filters["abilityId"] = null;

    $query .= "ORDER BY ID DESC";

    $stmt = $conn->prepare($query);
    $stmt->execute();
}




if ($stmt->rowCount() > 0) {
    $lineups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $arr = array();

    foreach ($lineups as $row) {
        $lineupId = $row["ID"];

        $lineup = $row;

        $sql = "SELECT * FROM LineupTags WHERE LineupId = $lineupId;";

        $stmt = $conn->prepare($sql);
        $stmt->execute();

        $tags = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($tags as $tag) {
            $filters["tags"] = array_filter($filters["tags"], function ($t) use ($tag) {
                return $t != $tag["ID"];
            });

            $lineup["Tags"][] = $tag;
        }

        if (count($filters["tags"]) > 0) {
            continue;
        }

        $fromSpot = $row["FromSpotId"];
        $toSpot = $row["ToSpotId"];
    
        $sql = "SELECT * FROM Spots, Maps WHERE Spots.ID = $fromSpot AND Maps.ID = Spots.MapId;";
        $fromSpotResult = $conn->query($sql);
        $fromSpot = $fromSpotResult->fetch(PDO::FETCH_ASSOC);

        $lineup["FromSpot"] = $fromSpot;

        $sql = "SELECT * FROM Spots, Maps WHERE Spots.ID = $toSpot AND Maps.ID = Spots.MapId;";
        $toSpotResult = $conn->query($sql);
        $toSpot = $toSpotResult->fetch(PDO::FETCH_ASSOC);

        $lineup["ToSpot"] = $toSpot;

        if (isset($_GET["mapId"])) {
            if ($fromSpot["MapId"] != $_GET["mapId"]) {
                continue;
            }

            if ($toSpot["MapId"] != $_GET["mapId"]) {
                continue;
            }
        }

        $abilityId = $row["AbilityId"];
        $sql = "SELECT * FROM Abilitys WHERE ID = $abilityId;";
        $abilityResult = $conn->query($sql);
        $ability = $abilityResult->fetch(PDO::FETCH_ASSOC);

        $lineup["Ability"] = $ability;

        array_push($arr, $lineup);
    }

    echo json_encode(array("code" => 200, "data" => $arr));
} else {
    echo json_encode(array("code" => 404, "data" => "No lineups found"));
}

$conn = null;