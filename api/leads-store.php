<?php
declare(strict_types=1);

function csv_files(): array {
    return glob(__DIR__ . '/leads_*.csv') ?: [];
}

function is_draft_file(string $file): bool {
    return strpos(basename($file), '_draft_') !== false;
}

/**
 * Ochrona przed CSV Formula Injection (OWASP DDE) — neutralizuje znaki sterujące (=, +, -, @, TAB, CR)
 */
function sanitize_csv_cell(string $value): string {
    $clean = trim((string)preg_replace('/[\r\n]+/', ' ', $value));
    if ($clean !== '' && in_array($clean[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
        return "'" . $clean;
    }
    return $clean;
}

/**
 * Normalizuje wiersz CSV (kompatybilność wsteczna 6 kolumn -> 8 kolumn:
 * [0]=date, [1]=time, [2]=name, [3]=email, [4]=message, [5]=ip_hash, [6]=phone, [7]=newsletter)
 */
function normalize_lead_row(array $row): ?array {
    if (count($row) === 6) {
        return [$row[0], $row[1], $row[2], $row[3], $row[4], $row[5], '-', 'NIE'];
    }
    if (count($row) >= 8) {
        return array_slice($row, 0, 8);
    }
    return null;
}

function read_leads(bool $draft = false, int $limit = 200): array {
    $rows = [];
    $files = csv_files();
    rsort($files);

    foreach ($files as $file) {
        if ($draft !== is_draft_file($file)) {
            continue;
        }

        if (($h = @fopen($file, 'rb')) === false) {
            continue;
        }

        $fileRows = [];
        if (@flock($h, LOCK_SH)) {
            fgetcsv($h);

            while (($row = fgetcsv($h)) !== false) {
                $normalized = normalize_lead_row($row);
                if ($normalized !== null) {
                    array_unshift($fileRows, $normalized);
                }
            }
            @flock($h, LOCK_UN);
        }
        fclose($h);

        foreach ($fileRows as $r) {
            $rows[] = $r;
            if (count($rows) >= $limit) {
                break 2;
            }
        }

        if (count($rows) >= $limit) {
            break;
        }
    }
    return $rows;
}

function lead_id(array $row): string {
    $normalized = normalize_lead_row($row) ?? $row;
    return hash('sha256', implode('|', array_slice($normalized, 0, 6)));
}

function save_lead(array $data, bool $draft = false): void {
    if (count($data) < 6) {
        return;
    }
    $normalized = normalize_lead_row($data);
    if ($normalized === null) {
        return;
    }
    $sanitizedRow = array_map(static function ($cell): string {
        return sanitize_csv_cell((string)$cell);
    }, $normalized);

    $suffix = $draft ? '_draft' : '';
    $file = __DIR__ . '/leads' . $suffix . '_' . date('Y-m') . '.csv';

    $fp = @fopen($file, 'a+b');
    if (!$fp) return;

    if (@flock($fp, LOCK_EX)) {
        clearstatcache(true, $file);
        $stat = fstat($fp);
        $isNew = ($stat === false || ($stat['size'] ?? 0) === 0);
        if ($isNew) {
            fputcsv($fp, ['date', 'time', 'name', 'email', 'message', 'ip_hash', 'phone', 'newsletter']);
        }
        fputcsv($fp, $sanitizedRow);
        fflush($fp);
        @flock($fp, LOCK_UN);
    }
    fclose($fp);
}

/**
 * Współbieżny odczyt pliku JSON z blokadą współdzieloną flock(LOCK_SH)
 */
function read_json_file(string $file): array {
    if (!file_exists($file)) return [];
    $fp = @fopen($file, 'rb');
    if (!$fp) return [];
    $content = '';
    if (@flock($fp, LOCK_SH)) {
        clearstatcache(true, $file);
        $size = (int)@filesize($file);
        if ($size > 0) {
            $content = (string)fread($fp, $size);
        }
        @flock($fp, LOCK_UN);
    }
    fclose($fp);
    if ($content === '') return [];
    $data = json_decode($content, true);
    return is_array($data) ? $data : [];
}

/**
 * Atomowa transakcja Read-Modify-Write (RMW) na pliku JSON z blokadą wyłączną flock(LOCK_EX)
 * utrzymywaną przez cały cykl: Odczyt -> Modyfikacja -> Kopia .bak -> Zapis -> Zwolnienie blokady.
 * Eliminuje wyścigi TOCTOU (Lost Update) przy równoczesnych operacjach wielu użytkowników/moderatorów.
 *
 * @param string   $file       Ścieżka do pliku JSON
 * @param callable $mutator    Funkcja function(array &$data): mixed — zwraca false, aby anulować zapis
 * @param bool     $purgeCache Czy wysłać nagłówek X-LiteSpeed-Purge
 * @return array{ok: bool, result: mixed}
 */
function update_json_file(string $file, callable $mutator, bool $purgeCache = true): array {
    $fp = @fopen($file, 'c+b');
    if (!$fp) {
        return ['ok' => false, 'result' => null];
    }

    if (!@flock($fp, LOCK_EX)) {
        fclose($fp);
        return ['ok' => false, 'result' => null];
    }

    rewind($fp);
    $existingContent = stream_get_contents($fp);
    $data = [];
    if ($existingContent !== false && $existingContent !== '') {
        $decoded = json_decode($existingContent, true);
        if (is_array($decoded)) {
            $data = $decoded;
        }
    }

    $mutationResult = $mutator($data);
    if ($mutationResult === false) {
        @flock($fp, LOCK_UN);
        fclose($fp);
        return ['ok' => false, 'result' => null];
    }

    $encoded = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($encoded === false) {
        @flock($fp, LOCK_UN);
        fclose($fp);
        return ['ok' => false, 'result' => null];
    }

    if ($existingContent !== false && strlen($existingContent) > 0) {
        @file_put_contents($file . '.bak', $existingContent, LOCK_EX);
    }

    ftruncate($fp, 0);
    rewind($fp);
    $written = fwrite($fp, $encoded);
    fflush($fp);
    @flock($fp, LOCK_UN);
    fclose($fp);

    if ($written !== false && $purgeCache && !headers_sent()) {
        header("X-LiteSpeed-Purge: *");
    }

    return ['ok' => $written !== false, 'result' => $mutationResult];
}
