<?php
/* 
 * Skrypt dodający etykiety Traefik do kontenera Docker w Unraid
 */

// Zabezpieczenie przed bezpośrednim dostępem
if (!isset($_POST['container']) || !isset($_POST['subdomain']) || !isset($_POST['service_url'])) {
    die(json_encode(['status' => 'error', 'message' => 'Brak wymaganych danych']));
}

$container = $_POST['container'];
$subdomain = $_POST['subdomain'];
$serviceUrl = $_POST['service_url'];
$schema = $_POST['schema'] ?? 'traefik';

// Walidacja danych wejściowych
if (empty($container) || empty($subdomain) || empty($serviceUrl)) {
    die(json_encode(['status' => 'error', 'message' => 'Wszystkie pola są wymagane']));
}

// Sanityzacja nazwy subdomeny (usunięcie niedozwolonych znaków)
$subdomain = preg_replace('/[^a-zA-Z0-9-]/', '', $subdomain);
$subdomain = strtolower($subdomain);

// Generowanie etykiet na podstawie schematu
function generateTraefikLabels($name, $subdomain, $serviceUrl) {
    $domain = "tail.moniamilki.ovh";
    
    return [
        "traefik.enable=true",
        "traefik.http.routers.{$name}.rule=Host(`{$subdomain}.{$domain}`)",
        "traefik.http.routers.{$name}.entrypoints=websecure",
        "traefik.http.routers.{$name}.tls=true",
        "traefik.http.routers.{$name}.tls.certresolver=letsencrypt",
        "traefik.http.services.{$name}.loadbalancer.server.url=http://{$serviceUrl}"
    ];
}

// Ścieżka do pliku konfiguracyjnego Docker w Unraid
$dockerCfgPath = '/boot/config/plugins/dockerMan/templates-user';
$containerXmlPath = "{$dockerCfgPath}/my-{$container}.xml";

// Sprawdź czy plik kontenera istnieje
if (!file_exists($containerXmlPath)) {
    die(json_encode(['status' => 'error', 'message' => "Nie znaleziono pliku konfiguracyjnego dla kontenera: {$container}"]));
}

try {
    // Wczytaj XML kontenera
    $xml = simplexml_load_file($containerXmlPath);
    if ($xml === false) {
        throw new Exception("Nie można wczytać pliku XML");
    }
    
    // Generuj etykiety
    $labels = generateTraefikLabels($subdomain, $subdomain, $serviceUrl);
    
    // Dodaj lub zaktualizuj etykiety w XML
    $labelsNode = $xml->xpath('//Config[@Type="Label"]');
    
    // Usuń istniejące etykiety Traefik (jeśli są)
    foreach ($labelsNode as $label) {
        if (strpos((string)$label['Target'], 'traefik.') === 0) {
            $dom = dom_import_simplexml($label);
            $dom->parentNode->removeChild($dom);
        }
    }
    
    // Dodaj nowe etykiety
    foreach ($labels as $label) {
        $configNode = $xml->addChild('Config');
        $configNode->addAttribute('Name', $label);
        $configNode->addAttribute('Target', $label);
        $configNode->addAttribute('Default', '');
        $configNode->addAttribute('Mode', '');
        $configNode->addAttribute('Description', 'Traefik label - automatycznie dodane');
        $configNode->addAttribute('Type', 'Label');
        $configNode->addAttribute('Display', 'always');
        $configNode->addAttribute('Required', 'false');
        $configNode->addAttribute('Mask', 'false');
    }
    
    // Zapisz zmiany
    $dom = new DOMDocument('1.0', 'UTF-8');
    $dom->formatOutput = true;
    $dom->loadXML($xml->asXML());
    
    if ($dom->save($containerXmlPath)) {
        // Opcjonalnie: restartuj kontener aby zastosować zmiany
        // exec("docker restart {$container} 2>&1", $output, $return_var);
        
        echo json_encode([
            'status' => 'success', 
            'message' => "Etykiety Traefik zostały dodane do kontenera '{$container}'. Aby zmiany zostały zastosowane, zatrzymaj i uruchom ponownie kontener.",
            'labels' => $labels
        ]);
    } else {
        throw new Exception("Nie można zapisać pliku konfiguracyjnego");
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error', 
        'message' => "Błąd podczas dodawania etykiet: " . $e->getMessage()
    ]);
}
?>
