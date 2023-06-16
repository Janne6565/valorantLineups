<?php
include "../util.php";
include "../database.php";

if (!checkAuthed()) {
    throwCode("Not authorized", 401, "Not authorized");
} else {
    $params = getParams(array("abilityId", "userId", "spotIdFrom", "spotIdTo"));

    if (isset($_FILES['image']) && isset($_FILES['image']['tmp_name']) && isset($_FILES['imageStandOn']) && isset($_FILES['imageStandOn']['tmp_name'])) {
        $allowedTypes = array('image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp');
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($fileInfo, $_FILES['image']['tmp_name']);
        finfo_close($fileInfo);

        if (!in_array($mime, $allowedTypes)) {
            throwCode("Invalid file type. Only JPEG, PNG, and GIF images are allowed.", 400, "Invalid file type");
        }

        $pathToImage = uploadToImgur($_FILES['image']['tmp_name']);
        if ($pathToImage == null) {
            throwCode("Failed to upload image", 500, "Failed to upload image");
        }

        $allowedTypes = array('image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp');
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $infosImageStandOn = finfo_file($fileInfo, $_FILES['imageStandOn']['tmp_name']);
        finfo_close($fileInfo);

        if (!in_array($infosImageStandOn, $allowedTypes)) {
            throwCode("Invalid file type. Only JPEG, PNG, and GIF images are allowed.", 400, "Invalid file type");
        }

        $pathToStandOn = uploadToImgur($_FILES['imageStandOn']['tmp_name']);
        if ($pathToImage == null) {
            throwCode("Failed to upload image", 500, "Failed to upload image");
        }
        


        $unixTimeStamp = time() * 1000;
        $sql = "INSERT INTO Lineups (UserId, Approved, AbilityId, DateCreated, ImageLineup, ImageStandOn, FromSpotId, ToSpotId) VALUES (?, 0, ?, ?, ?, ?, ?, ?)";

        $conn = connect();

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iiissii", $params["userId"], $params["abilityId"], $unixTimeStamp, $pathToImage, $pathToStandOn, $params["spotIdFrom"], $params["spotIdTo"]);
        $stmt->execute();
        $result = $stmt->get_result();

        $id = $conn->insert_id;


        if (isset($_GET["tags"])) {
            $tags = explode(",", $_GET["tags"]);

            foreach ($tags as $tag) {
                $sql = "INSERT INTO LineupTags (LineupId, TagId) VALUES (?, ?)";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ii", $id, $tag);
                $stmt->execute();
                $result = $stmt->get_result();
            }
        }

        throwCode("Success", 200, "Success");
    } else {
        throwCode("Missing parameter: image", 400, "Missing parameter");
    }
}
