// Docker Page Integration for Traefik Labels Manager
// This script adds the "Dodaj etykietę" button to the Docker page

$(document).ready(function() {
    console.log('Traefik Labels Manager: Loading integration script');
    
    // Check if we're on the Docker page
    if (window.location.pathname.includes('/Docker') || 
        window.location.hash.includes('docker') ||
        $('title').text().includes('Docker')) {
        
        console.log('Traefik Labels Manager: Docker page detected');
        initializeDockerIntegration();
    }
});

function initializeDockerIntegration() {
    // Wait for the page to fully load
    setTimeout(function() {
        addTraefikButton();
    }, 2000);
    
    // Also try to add button when DOM changes (dynamic content)
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                addTraefikButton();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function addTraefikButton() {
    // Don't add if button already exists
    if ($('#traefik-add-labels-btn').length > 0) {
        return;
    }
    
    console.log('Traefik Labels Manager: Looking for button container');
    
    // Try different selectors to find the right place for the button
    var buttonContainers = [
        // Standard Unraid button containers
        $('.docker_buttons'),
        $('.tabs_buttons'),
        $('input[value="Add Container"]').parent(),
        $('input[value="Start All"]').parent(),
        $('input[onclick*="addContainer"]').parent(),
        
        // Generic containers with buttons
        $('div').filter(function() {
            return $(this).children('input[type="button"], input[type="submit"]').length > 0;
        }),
        
        // Table headers with buttons
        $('th').filter(function() {
            return $(this).find('input[type="button"], input[type="submit"]').length > 0;
        })
    ];
    
    var buttonAdded = false;
    
    for (var i = 0; i < buttonContainers.length && !buttonAdded; i++) {
        var container = buttonContainers[i];
        if (container.length > 0) {
            console.log('Traefik Labels Manager: Found button container', container);
            
            // Create the button
            var traefikButton = $('<input>', {
                type: 'button',
                id: 'traefik-add-labels-btn',
                value: 'Dodaj etykietę',
                class: 'traefik-labels-btn',
                style: 'margin-left: 10px; background-color: #e67e22; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer;',
                click: function() {
                    openTraefikLabelsManager();
                }
            });
            
            // Add hover effect
            traefikButton.hover(
                function() { $(this).css('background-color', '#d35400'); },
                function() { $(this).css('background-color', '#e67e22'); }
            );
            
            container.first().append(traefikButton);
            console.log('Traefik Labels Manager: Button added successfully');
            buttonAdded = true;
            break;
        }
    }
    
    if (!buttonAdded) {
        console.log('Traefik Labels Manager: Could not find suitable container for button');
        // As a last resort, try to add to any div containing "Add Container" or similar
        tryLastResortButtonPlacement();
    }
}

function tryLastResortButtonPlacement() {
    // Look for text containing "Add Container", "Start All", etc.
    var possibleContainers = $('*:contains("Add Container"), *:contains("Start All"), *:contains("Stop All")').filter(function() {
        return $(this).children().length < 5; // Not too complex elements
    });
    
    if (possibleContainers.length > 0) {
        var container = possibleContainers.first().parent();
        if (container.length > 0) {
            var traefikButton = $('<input>', {
                type: 'button',
                id: 'traefik-add-labels-btn',
                value: 'Dodaj etykietę',
                style: 'margin: 5px; background-color: #e67e22; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer;',
                click: function() {
                    openTraefikLabelsManager();
                }
            });
            
            container.append(traefikButton);
            console.log('Traefik Labels Manager: Button added using last resort method');
        }
    }
}

function openTraefikLabelsManager() {
    console.log('Traefik Labels Manager: Opening manager window');
    
    // Check if fancybox is available
    if (typeof $.fancybox === 'function') {
        $.fancybox({
            href: '/plugins/traefik-labels-manager/TraefikLabelsManager.php',
            type: 'iframe',
            width: 900,
            height: 700,
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
    } else {
        // Fallback: open in new window
        window.open('/plugins/traefik-labels-manager/TraefikLabelsManager.php', 
                   'TraefikLabelsManager', 
                   'width=900,height=700,scrollbars=yes,resizable=yes');
    }
}