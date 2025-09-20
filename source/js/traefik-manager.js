$(document).ready(function() {
    // Załaduj listę kontenerów Docker
    loadDockerContainers();
    
    // Obsługa zmiany w polach formularza
    $('#containerSelect, #subdomain, #serviceUrl').on('change keyup', function() {
        updateLabelPreview();
    });
    
    // Obsługa wysyłania formularza
    $('#labelForm').on('submit', function(e) {
        e.preventDefault();
        addLabelsToContainer();
    });
});

// Funkcja ładująca listę kontenerów Docker
function loadDockerContainers() {
    $.ajax({
        url: '/plugins/traefik-labels-manager/scripts/get_containers.php',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            var select = $('#containerSelect');
            select.empty().append('<option value="">-- Wybierz kontener --</option>');
            
            if (data.status === 'success') {
                data.containers.forEach(function(container) {
                    select.append($('<option>', {
                        value: container.name,
                        text: container.name + ' (' + container.status + ')'
                    }));
                });
            } else {
                console.error('Błąd podczas ładowania kontenerów:', data.message);
                select.append('<option value="">Błąd ładowania kontenerów</option>');
            }
        },
        error: function() {
            console.error('Nie można załadować listy kontenerów');
            $('#containerSelect').append('<option value="">Błąd połączenia</option>');
        }
    });
}

// Funkcja aktualizująca podgląd etykiet
function updateLabelPreview() {
    var container = $('#containerSelect').val();
    var subdomain = $('#subdomain').val();
    var serviceUrl = $('#serviceUrl').val();
    
    var preview = $('#labelPreview');
    
    if (!container || !subdomain || !serviceUrl) {
        preview.html('<em>Wypełnij wszystkie pola aby zobaczyć podgląd</em>');
        return;
    }
    
    // Sanityzacja nazwy subdomeny
    var cleanSubdomain = subdomain.toLowerCase().replace(/[^a-zA-Z0-9-]/g, '');
    
    // Generowanie podglądu etykiet
    var labels = [
        'traefik.enable=true',
        `traefik.http.routers.${cleanSubdomain}.rule=Host(\`${cleanSubdomain}.tail.moniamilki.ovh\`)`,
        `traefik.http.routers.${cleanSubdomain}.entrypoints=websecure`,
        `traefik.http.routers.${cleanSubdomain}.tls=true`,
        `traefik.http.routers.${cleanSubdomain}.tls.certresolver=letsencrypt`,
        `traefik.http.services.${cleanSubdomain}.loadbalancer.server.url=http://${serviceUrl}`
    ];
    
    var previewHtml = '<div class="labels-list">';
    labels.forEach(function(label) {
        previewHtml += `<div class="label-item">${escapeHtml(label)}</div>`;
    });
    previewHtml += '</div>';
    
    preview.html(previewHtml);
}

// Funkcja dodająca etykiety do kontenera
function addLabelsToContainer() {
    var formData = $('#labelForm').serialize();
    
    // Wyświetl komunikat ładowania
    showStatus('Dodawanie etykiet...', 'info');
    
    $.ajax({
        url: '/plugins/traefik-labels-manager/scripts/add_labels.php',
        type: 'POST',
        data: formData,
        dataType: 'json',
        success: function(response) {
            if (response.status === 'success') {
                showStatus(response.message, 'success');
                
                // Opcjonalnie: odświeź stronę Docker po chwili
                setTimeout(function() {
                    if (parent.location.pathname.includes('/Docker')) {
                        parent.location.reload();
                    }
                }, 2000);
                
            } else {
                showStatus('Błąd: ' + response.message, 'error');
            }
        },
        error: function() {
            showStatus('Błąd połączenia z serwerem', 'error');
        }
    });
}

// Funkcja wyświetlająca komunikaty statusu
function showStatus(message, type) {
    // Usuń poprzednie komunikaty
    $('.status-message').remove();
    
    var statusClass = 'status-' + type;
    var statusHtml = `<div class="status-message ${statusClass}">${escapeHtml(message)}</div>`;
    
    $('body').prepend(statusHtml);
    
    // Automatycznie ukryj komunikat po 5 sekundach
    setTimeout(function() {
        $('.status-message').fadeOut();
    }, 5000);
}

// Funkcja zabezpieczająca przed XSS
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Integracja z zakładką Docker - dodanie przycisku
if (parent.location.pathname.includes('/Docker')) {
    $(parent.document).ready(function() {
        // Znajdź kontener z przyciskami w zakładce Docker
        var dockerButtons = parent.$('.docker_buttons, .tabs_buttons, [style*="float:right"]');
        
        if (dockerButtons.length > 0) {
            // Dodaj przycisk "Dodaj etykietę"
            var addLabelButton = $('<input type="button" value="Dodaj etykietę" onclick="openLabelManager()" style="margin-left: 5px;">');
            dockerButtons.first().append(addLabelButton);
        }
    });
}

// Funkcja otwierająca manager etykiet w popup
function openLabelManager() {
    parent.$.fancybox({
        href: '/plugins/traefik-labels-manager/TraefikLabelsManager.php',
        type: 'iframe',
        width: 800,
        height: 600,
        title: 'Traefik Labels Manager',
        modal: true,
        helpers: {
            overlay: {
                css: {
                    'background': 'rgba(0, 0, 0, 0.8)'
                }
            }
        }
    });
}
