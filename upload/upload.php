<?php
// activate error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Example usage
if (isset($_FILES['image']) && isset($_FILES['image']['tmp_name'])) {
    $imagePath = $_FILES['image']['tmp_name'];
    $clientId = '863fbdb17bc408a';  // Replace with your Imgur API client ID

    // Upload the image and get the URL
    $imageUrl = uploadToImgur($imagePath, $clientId);

    if ($imageUrl) {
        $response = array('success' => true, 'imageUrl' => $imageUrl);
    } else {
        $response = array('success' => false);
    }
} else {
    $response = array('success' => false);
}

header('Content-Type: application/json');
echo json_encode($response);
