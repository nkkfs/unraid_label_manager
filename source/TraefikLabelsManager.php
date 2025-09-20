<?php
/* Copyright 2025, TwojNick
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License version 2,
 * as published by the Free Software Foundation.
 *
 * Traefik Labels Manager dla Unraid
 */

$plugin = 'traefik-labels-manager';
?>

<!DOCTYPE html>
<html>
<head>
    <title>Traefik Labels Manager</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="stylesheet" type="text/css" href="/webGui/styles/default-fonts.css">
    <link rel="stylesheet" type="text/css" href="/webGui/styles/default-popup.css">
    <link rel="stylesheet" type="text/css" href="/plugins/<?=$plugin;?>/css/traefik-manager.css">
</head>
<body>

<div class="title">
    <span class="left"><img src="/plugins/<?=$plugin;?>/images/traefik-icon.png" class="icon">Traefik Labels Manager</span>
</div>

<div class="container">
    <div class="category_head" style="margin-top:0;">
        <a name="docker_settings" style="margin-top:-19px;padding-top:19px;display:block;"></a>
        Zarządzanie etykietami Traefik
    </div>

    <form id="labelForm" method="post" action="/plugins/<?=$plugin;?>/scripts/add_labels.php">
        <table class="settings">
            <tr>
                <td>Wybierz kontener:</td>
                <td>
                    <select id="containerSelect" name="container" required>
                        <option value="">-- Wybierz kontener --</option>
                    </select>
                </td>
            </tr>
            
            <tr>
                <td>Schemat etykiet:</td>
                <td>
                    <select id="schemaSelect" name="schema" required>
                        <option value="traefik">Traefik (domyślny)</option>
                        <option value="custom">Niestandardowy</option>
                    </select>
                </td>
            </tr>
            
            <tr>
                <td>Nazwa subdomeny:</td>
                <td>
                    <input type="text" id="subdomain" name="subdomain" placeholder="np. portainer" required>
                    <span class="help-text">.tail.moniamilki.ovh zostanie dodane automatycznie</span>
                </td>
            </tr>
            
            <tr>
                <td>Adres usługi:</td>
                <td>
                    <input type="text" id="serviceUrl" name="service_url" placeholder="192.168.1.79:9000" required>
                    <span class="help-text">Format: IP:PORT</span>
                </td>
            </tr>
            
            <tr>
                <td>Podgląd etykiet:</td>
                <td>
                    <div id="labelPreview" class="label-preview">
                        <em>Wybierz kontener i wypełnij pola aby zobaczyć podgląd</em>
                    </div>
                </td>
            </tr>
        </table>
        
        <div style="margin-top: 20px;">
            <input type="submit" value="Dodaj etykiety" class="btn">
            <input type="button" value="Anuluj" onclick="parent.$.fancybox.close();" class="btn">
        </div>
    </form>
</div>

<script src="/webGui/javascript/jquery-1.12.4.min.js"></script>
<script src="/plugins/<?=$plugin;?>/js/traefik-manager.js"></script>

</body>
</html>
