<?php

header('Content-Type: application/json');

// Start the session
session_start();

// Check if the authorization token is correct
if ($_POST['authorize'] === 'gradeplus') {
    $conn = null;
    try {
        // Connect to the MySQL database using prepared statements
        $conn = new mysqli('localhost', 'gradeplusclient', 'gradeplussql', 'gradeplus');
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }

        // Handle the banner image upload if provided
        if (!empty($_FILES['banner'])) {
            $img_dir = "../img/";
            $banner_img = basename($_FILES['banner']['name']);
            $upload_dir = $img_dir . $banner_img;

            if (!move_uploaded_file($_POST['banner']['tmp_name'], $upload_dir)) {
                throw new Exception("Failed to upload file to img directory");
            }

            // Update the course banner using a prepared statement
            $stmt = $conn->prepare("UPDATE courses SET course_banner = ? WHERE invite_code = ?");
            $stmt->bind_param("ss", $upload_dir, $_POST['invitecode']);
            if (!$stmt->execute()) {
                throw new Exception("Failed to update course banner: " . $conn->error);
            }
            $stmt->close();
        }

        // Update the course name using a prepared statement
        if ($_POST['coursename'] != null) {
            $stmt = $conn->prepare("UPDATE courses SET course_name = ? WHERE invite_code = ?");
            $stmt->bind_param("ss", $_POST['coursename'], $_POST['invitecode']);
            if (!$stmt->execute()) {
                throw new Exception("Failed to update course name: " . $conn->error);
            }
            $stmt->close();
            $stmt = $conn->prepare("UPDATE enrollment SET course_name = ? WHERE invite_code = ?");
            $stmt->bind_param("ss", $_POST['coursename'], $_POST['invitecode']);
            if (!$stmt->execute()) {
                throw new Exception("Failed to update course name: " . $conn->error);
            }
        }

        // Update the course code using a prepared statement
        if ($_POST['coursecode'] != null) {
            $stmt = $conn->prepare("UPDATE courses SET course_code = ? WHERE invite_code = ?");
            $stmt->bind_param("ss", $_POST['coursecode'], $_POST['invitecode']);
            if (!$stmt->execute()) {
                throw new Exception("Failed to update course name: " . $conn->error);
            }
            $stmt->close();
            $stmt = $conn->prepare("UPDATE enrollment SET course_code = ? WHERE invite_code = ?");
            $stmt->bind_param("ss", $_POST['coursecode'], $_POST['invitecode']);
            if (!$stmt->execute()) {
                throw new Exception("Failed to update course name: " . $conn->error);
            }
            $stmt->close();
        }

        // Close the connection
        $conn->close();

        // Return success response
        echo json_encode(['success' => 1, 'error' => 0]);
    } catch (Exception $e) {
        // Close the connection if it exists
        if ($conn) {
            $conn->close();
        }

        // Return error response with a message for debugging
        echo json_encode(['success' => 0, 'error' => 1]);
    }
} else {
    // Redirect to the illegal access page
    header("Location: illegal.php");
}
