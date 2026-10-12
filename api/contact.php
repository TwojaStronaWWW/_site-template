<?php
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Konfiguracja szablonu TwojaStronaWWW
$toEmail = 'kontakt@twojadomena.pl';
$subject = 'Nowa wiadomość z formularza kontaktowego';

$response = ['success' => false, 'message' => ''];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // 1. Ochrona Honeypot (pole website_url wypełniane wyłącznie przez boty)
    if (!empty($_POST["website_url"])) {
        $response['success'] = true;
        $response['message'] = 'Dziękujemy! Twoja wiadomość została wysłana.';
        echo json_encode($response);
        exit;
    }

    // 2. Oczyszczenie danych wejściowych
    $name = isset($_POST["name"]) ? htmlspecialchars(strip_tags(trim($_POST["name"])), ENT_QUOTES, 'UTF-8') : '';
    $email = isset($_POST["email"]) ? filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL) : '';
    $message = isset($_POST["message"]) ? htmlspecialchars(strip_tags(trim($_POST["message"])), ENT_QUOTES, 'UTF-8') : '';

    // 3. Walidacja
    if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['message'] = 'Proszę wypełnić wszystkie pola poprawnie.';
        echo json_encode($response);
        exit;
    }

    // 4. Rzeczywiste IP klienta (uwzględnienie Cloudflare Proxy Anycast)
    $clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'Nieznane IP';
    $email_content = "Nowe zgłoszenie kontaktowe:\n\n";
    $email_content .= "Imię: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Wiadomość:\n$message\n\n";
    $email_content .= "---\nData: " . date("Y-m-d H:i:s") . "\n";
    $email_content .= "Adres IP: " . htmlspecialchars($clientIp, ENT_QUOTES, 'UTF-8') . "\n";

    // 5. Nagłówki
    $headers = "From: no-reply@twojadomena.pl\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (@mail($toEmail, $subject, $email_content, $headers)) {
        $response['success'] = true;
        $response['message'] = 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.';
    } else {
        $response['message'] = 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.';
    }
} else {
    $response['message'] = 'Nieprawidłowa metoda żądania.';
}

echo json_encode($response);
?>
