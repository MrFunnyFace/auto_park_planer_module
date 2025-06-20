<?php

class AuthUtils {
    public function validateToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        return isset($_SESSION['user_id']) ? [
            'ID' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'role' => $_SESSION['user_role']
        ] : null;
    }
}