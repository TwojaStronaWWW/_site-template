<?php
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
session_start();

$toEmail = 'kontakt@twojadomena.pl';
$subject = '🔔 Potencjalny klient (Lead Alert)';

$response = ['success' => false, 'message' => ''];

if (isset($_SESSION['lead_recovered']) && $_SESSION['lead_recovered'] === true) {
    $response['message'] = 'Lead already recovered.';
    echo json_encode($response);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['action']) && $_POST['action'] === 'recover_lead') {
    $clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Nieznane IP';

    $email_content = "Witaj,\n\n";
    $email_content .= "Użytkownik przebywa na stronie od dłuższego czasu i wykazuje zainteresowanie ofertą.\n\n";
    $email_content .= "Data: " . date("Y-m-d H:i:s") . "\n";
    $email_content .= "Adres IP: " . htmlspecialchars($clientIp, ENT_QUOTES, 'UTF-8') . "\n";

    $headers = "From: system@twojadomena.pl\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (@mail($toEmail, $subject, $email_content, $headers)) {
        $_SESSION['lead_recovered'] = true;
        $response['success'] = true;
        $response['message'] = 'Lead alert sent.';
    } else {
        $response['message'] = 'Failed to send alert.';
    }
} else {
    $response['message'] = 'Invalid request.';
}

echo json_encode($response);
?>
