<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . '/rate-limit.php';

/**
 * Pobiera zmienną środowiskową z getenv(), $_ENV lub pliku .env poza katalogiem publicznym (ISO 27001)
 */
function get_env_secret(string $key, string $default = ''): string {
    $val = getenv($key);
    if ($val !== false && $val !== '') {
        return (string)$val;
    }
    if (!empty($_ENV[$key])) {
        return (string)$_ENV[$key];
    }
    $envPaths = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
    ];
    foreach ($envPaths as $envPath) {
        if (is_readable($envPath)) {
            $lines = @file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (is_array($lines)) {
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) {
                        continue;
                    }
                    list($k, $v) = explode('=', $line, 2);
                    if (trim($k) === $key) {
                        return trim($v, " \t\n\r\0\x0B\"'");
                    }
                }
            }
        }
    }
    return $default;
}

/**
 * Anonimizacja adresu IP zgodnie z zasadą minimalizacji danych RODO (Privacy-by-Design)
 * Zeruje ostatni oktet w IPv4 (np. 192.168.1.0) lub końcówkę w IPv6.
 */
function mask_ip($ip): string {
    if (empty($ip) || !is_string($ip)) {
        return '0.0.0.0';
    }
    $cleanIp = trim(explode(',', $ip)[0]);
    if (filter_var($cleanIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $parts = explode('.', $cleanIp);
        $parts[3] = '0';
        return implode('.', $parts);
    }
    if (filter_var($cleanIp, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        $parts = explode(':', $cleanIp);
        return implode(':', array_slice($parts, 0, 3)) . '::0';
    }
    return '0.0.0.0';
}

// Rzeczywiste IP klienta (uwzględnienie Cloudflare Proxy Anycast) i anonimizacja RODO
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
$maskedIp = mask_ip($clientIp);

// 0. Zabezpieczenie Rate Limiting (ISO 27001): maks. 5 zgłoszeń na 60 sekund
if (!rate_limit('contact_' . $maskedIp, 5, 60)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Zbyt wiele prób wysłania wiadomości. Odczekaj chwilę przed kolejną próbą.']);
    exit;
}

// Obsługa wejścia: JSON (Fetch API) lub tradycyjne FormData / POST
$input = json_decode((string)file_get_contents("php://input"), true);
if (!is_array($input)) {
    $input = is_array($_POST) ? $_POST : [];
}

if (empty($input)) {
    echo json_encode(['success' => false, 'message' => 'Brak danych wejściowych']);
    exit;
}

// 1. Zabezpieczenie Anty-Bot: Wielopolowy Honeypot (pola pułapki ukryte CSS-em dla ludzi)
$honeypots = ['website_url', 'hp_chk', 'website', 'company_name', 'phone_extra'];
foreach ($honeypots as $hp) {
    if (!empty($input[$hp])) {
        echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
        exit;
    }
}

// 2. Zabezpieczenie Anty-Bot: Wymóg wykonania kodu JavaScript w przeglądarce
if (empty($input['js_check'])) {
    echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
    exit;
}

// 3. Zabezpieczenie Anty-Bot: Pomiar czasu interakcji (minimalny czas wypełniania >= 2.5s)
if (!isset($input['submission_seconds']) || (float)$input['submission_seconds'] < 2.5) {
    echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
    exit;
}

// 4. Oczyszczenie i normalizacja danych wejściowych (ochrona przed Email Header Injection)
$rawName = isset($input['name']) ? strip_tags(trim((string)$input['name'])) : '';
$name = mb_substr(trim((string)preg_replace('/[\r\n]+/', ' ', $rawName)), 0, 120);

$rawEmail = isset($input['email']) ? filter_var(trim((string)$input['email']), FILTER_SANITIZE_EMAIL) : '';
$email = mb_substr(trim((string)preg_replace('/[\r\n]+/', '', (string)$rawEmail)), 0, 180);

$message = isset($input['message']) ? mb_substr(trim(strip_tags((string)$input['message'])), 0, 4000) : '';

// 5. Walidacja wymaganych pól
if (empty($name) || empty($message) || !$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
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

// 7. Hybrydowa wysyłka: Helpdesk osTicket API (jeśli skonfigurowano klucz w .env) z fallbackiem do mail()
$osTicketApiKey = get_env_secret('OSTICKET_API_KEY');
$osTicketApiUrl = get_env_secret('OSTICKET_API_URL', 'http://hd.twojastronawww.pl:8080/ticket_hook.php');
$ticketCreated = false;

if (!empty($osTicketApiKey) && function_exists('curl_init')) {
    $ticketData = [
        'name' => $name,
        'email' => $email,
        'subject' => "Wiadomość z formularza od: $name",
        'message' => $message,
        'ip' => $maskedIp,
        'source' => 'Web',
    ];

    $ch = curl_init($osTicketApiUrl);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: ' . $osTicketApiKey,
        'Content-Type: application/json',
        'Expect:'
    ]);
    curl_setopt($ch, CURLOPT_RESOLVE, ['hd.twojastronawww.pl:8080:127.0.0.1']);
    curl_setopt($ch, CURLOPT_USERAGENT, 'EnterpriseSiteTemplate-HelpdeskClient/2.0');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($ticketData, JSON_UNESCAPED_UNICODE));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);

    $apiResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $resArr = json_decode((string)$apiResponse, true);
    $ticketCreated = ($httpCode === 201 && !empty($resArr['success']));
}

if (!$ticketCreated) {
    $toEmail = get_env_secret('CONTACT_EMAIL', 'kontakt@twojadomena.pl');
    $subject = "Nowa wiadomość z formularza kontaktowego od: $name";
    $email_content = "Nowe zgłoszenie kontaktowe:\n\n";
    $email_content .= "Imię lub pseudonim: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Wiadomość:\n$message\n\n";
    $email_content .= "---\nData: " . date("Y-m-d H:i:s") . "\n";
    $email_content .= "Zanonimizowane IP (RODO): $maskedIp\n";

    $headers = "From: no-reply@twojadomena.pl\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    @mail($toEmail, $subject, $email_content, $headers);
}

echo json_encode(['success' => true, 'message' => 'Dziękujemy! Twoja wiadomość została wysłana pomyślnie.']);
