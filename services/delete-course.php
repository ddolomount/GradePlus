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

        // Update the course code using a prepared statement
        if ($_POST['invitecode'] != null) {
            $stmt = $conn->prepare("DELETE FROM courses WHERE invite_code = ?");
            $stmt->bind_param("s", $_POST['invitecode']);
            if (!$stmt->execute()) {
                throw new Exception("Failed to update course name: " . $conn->error);
            }
            $stmt->close();
            $stmt = $conn->prepare("DELETE FROM enrollment WHERE invite_code = ?");
            $stmt->bind_param("s", $_POST['invitecode']);
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
