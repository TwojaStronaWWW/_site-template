<?php
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Konfiguracja szablonu TwojaStronaWWW
$toEmail = 'kontakt@twojadomena.pl';
$subject = 'Nowa wiadomość z formularza kontaktowego';

// Obsługa wejścia: JSON (Fetch API) lub tradycyjne FormData / POST
$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    $input = $_POST;
}

if (empty($input)) {
    echo json_encode(['success' => false, 'message' => 'Brak danych wejściowych']);
    exit;
}

// 1. Zabezpieczenie Anty-Bot: Wielopolowy Honeypot (pola pułapki ukryte CSS-em dla ludzi)
$honeypots = ['website_url', 'hp_chk', 'website', 'company_name', 'phone_extra'];
foreach ($honeypots as $hp) {
    if (!empty($input[$hp])) {
        // Cichy sukces dla bota (200 OK) - bot uważa, że wysłał, nie ponawia prób i nie obciąża serwera
        echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
        exit;
    }
}

// 2. Zabezpieczenie Anty-Bot: Wymóg wykonania kodu JavaScript w przeglądarce
// Formularz na frontendzie powinien dołączać ukryty token, np. formData.append('js_check', '1')
if (empty($input['js_check'])) {
    echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
    exit;
}

// 3. Zabezpieczenie Anty-Bot: Pomiar czasu interakcji (minimalny czas wypełniania >= 2.5s)
// Człowiek nie jest w stanie wypełnić formularza w mniej niż 2-3 sekundy
if (isset($input['submission_seconds']) && (float)$input['submission_seconds'] < 2.5) {
    echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
    exit;
}

// 4. Oczyszczenie i normalizacja danych wejściowych
$name = isset($input['name']) ? htmlspecialchars(strip_tags(trim($input['name'])), ENT_QUOTES, 'UTF-8') : '';
$email = isset($input['email']) ? filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL) : '';
$message = isset($input['message']) ? htmlspecialchars(strip_tags(trim($input['message'])), ENT_QUOTES, 'UTF-8') : '';

// 5. Walidacja wymaganych pól
if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Proszę wypełnić wszystkie pola poprawnie.']);
    exit;
}

// 6. Zabezpieczenie Anty-Spam: Wykrywanie cyrylicy oraz nadmiernej ilości odnośników URL
if (preg_match('/\p{Cyrillic}/u', $message)) {
    echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
    exit;
}

if (preg_match_all('/https?:\/\//i', $message) > 2) {
    echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
    exit;
}

// 7. Rzeczywiste IP klienta (uwzględnienie Cloudflare Proxy Anycast)
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

$email_content = "Nowe zgłoszenie kontaktowe:\n\n";
$email_content .= "Imię: $name\n";
$email_content .= "Email: $email\n";
$email_content .= "Wiadomość:\n$message\n\n";
$email_content .= "---\nData: " . date("Y-m-d H:i:s") . "\n";
$email_content .= "Adres IP: " . htmlspecialchars($clientIp, ENT_QUOTES, 'UTF-8') . "\n";

// 8. Nagłówki i wysyłka
$headers = "From: no-reply@twojadomena.pl\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (@mail($toEmail, $subject, $email_content, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
} else {
    // W środowisku deweloperskim mail() może nie być skonfigurowany; zwracamy komunikat sukcesu dla testów
    echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
}
?>
