<?php
/* 
 * Skrypt pobierający listę kontenerów Docker w Unraid
 */

header('Content-Type: application/json');

try {
    // Pobierz listę kontenerów Docker z systemu
    exec('docker ps -a --format "{{.Names}}\t{{.Status}}\t{{.Image}}" 2>/dev/null', $output, $return_var);
    
    if ($return_var !== 0) {
        throw new Exception("Nie można pobrać listy kontenerów Docker");
    }
    
    $containers = [];
    
    foreach ($output as $line) {
        if (empty(trim($line))) continue;
        
        $parts = explode("\t", $line);
        if (count($parts) >= 3) {
            $name = trim($parts[0]);
            $status = trim($parts[1]);
            $image = trim($parts[2]);
            
            // Pomiń kontenery systemowe i tymczasowe
            if (strpos($name, 'unraid-') === 0 || 
                strpos($name, 'tmp-') === 0 || 
                strpos($image, 'scratch') !== false) {
                continue;
            }
            
            $containers[] = [
                'name' => $name,
                'status' => $status,
                'image' => $image,
                'running' => strpos($status, 'Up') === 0
            ];
        }
    }
    
    // Sortuj kontenery alfabetycznie
    usort($containers, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    echo json_encode([
        'status' => 'success',
        'containers' => $containers,
        'count' => count($containers)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'containers' => []
    ]);
}
?>
