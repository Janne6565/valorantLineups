<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);


include "../database.php";
include "../util.php";

if (checkAuthed()) {
  $params = getParams(array("userId", "authKey"));

  $query = "SELECT * FROM Lineups WHERE userId = ?";
    
  $conn = connect();

  $stmt = $conn->prepare($query);
  
  $stmt->bind_param("i", $params["userId"]);
  $stmt->execute();

  $res = $stmt->get_result();

  $lineups = array();

  foreach ($res as $row) {
    $lineupId = $row["ID"];

    $sqlTags = "SELECT * FROM LineupTags WHERE LineupId = $lineupId;";

    $stmt = $conn->prepare($sqlTags);
    $stmt->execute();

    $tags = $stmt->get_result();
    
    $row["tags"] = $tags;

    $spotFromId = $row["FromSpotId"];
    $spotToId = $row["ToSpotId"];
  
    $fromSpotSql = "SELECT * FROM Spots WHERE ID = $spotFromId";
    $stmt = $conn->prepare($fromSpotSql);
    $stmt->execute();
    $fromSpot = $stmt->get_result()->fetch_assoc();

    $toSpotSql = "SELECT * FROM Spots WHERE ID = $spotToId";
    $stmt = $conn->prepare($toSpotSql);
    $stmt->execute();
    $toSpot = $stmt->get_result()->fetch_assoc();

    $row["fromSpot"] = $fromSpot;

    $row["toSpot"] = $toSpot;
  
    $mapId = $fromSpot["MapId"];
    $sqlMap = "SELECT * FROM Maps WHERE ID = $mapId";
    $stmt = $conn->prepare($sqlMap);
    $stmt->execute();
    $map = $stmt->get_result()->fetch_assoc();

    $row["map"] = $map;

    array_push($lineups, $row);
  }

  echo json_encode(array("code"=>200, "data"=>$lineups));
  
  $conn->close();
} else {

  echo json_encode(array("code"=>300, "message"=>"User not authorized"));

}


