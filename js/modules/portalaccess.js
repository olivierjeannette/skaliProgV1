/**
 * PORTAL ACCESS - Gestion accès portail membres
 * Page admin pour partager le portail avec QR code et lien
 */

const PortalAccess = {
    // URLs du portail
    portalURLs: {
        live: 'https://skaliprog.netlify.app/member-portal.html',
        local: null // Sera calculée dynamiquement
    },

    currentMode: 'live', // 'live' ou 'local'

    /**
     * Obtenir l'URL du portail membres (Live - Netlify)
     */
    getPortalURL_Live() {
        return this.portalURLs.live;
    },

    /**
     * Obtenir l'URL du portail membres (Local)
     */
    getPortalURL_Local() {
        // Obtenir l'URL de base (sans le fichier index.html)
        let baseURL = window.location.href.replace(/index\.html.*$/, '');

        // En local, remplacer localhost par l'IP locale pour accès mobile
        if (baseURL.includes('localhost') || baseURL.includes('127.0.0.1')) {
            const savedIP = localStorage.getItem('localIP');
            if (savedIP) {
                baseURL = baseURL.replace(/localhost:\d+|127\.0\.0\.1:\d+/, savedIP);
            }
        }

        return `${baseURL}member-portal.html`;
    },

    /**
     * Obtenir l'URL selon le mode actif
     */
    getPortalURL() {
        return this.currentMode === 'live' ? this.getPortalURL_Live() : this.getPortalURL_Local();
    },

    /**
     * Configurer l'IP locale
     */
    async promptLocalIP() {
        const ip = prompt(
            '🔧 Configuration IP Locale\n\n' +
                "Pour que le QR code fonctionne sur smartphone, entrez l'IP locale de votre PC:\n\n" +
                'Comment trouver votre IP locale?\n' +
                '• Windows: CMD → ipconfig → "Adresse IPv4"\n' +
                '• Mac/Linux: Terminal → ifconfig\n\n' +
                'Format: 192.168.X.XXX',
            localStorage.getItem('localIP')?.split(':')[0] || '192.168.1.'
        );

        if (ip && ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
            const port = window.location.port || '8000';
            localStorage.setItem('localIP', `${ip}:${port}`);
            return true;
        } else if (ip) {
            alert('Format IP invalide. Utilisez le format: 192.168.1.100');
        }
        return false;
    },

    /**
     * Changer de mode (live/local)
     * @param mode
     */
    switchMode(mode) {
        this.currentMode = mode;
        this.showPortalAccessView();
    },

    /**
     * Afficher la vue d'accès au portail
     */
    showPortalAccessView() {
        const portalURL = this.getPortalURL();
        const isLocal = this.currentMode === 'local';
        const isLive = this.currentMode === 'live';

        const html = `
            <div class="portal-access-container" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
                <!-- Header -->
                <div class="glass-card rounded-xl p-6 mb-6" style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(82, 199, 89, 0.2);">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-3xl font-bold text-white mb-2">
                                <i class="fas fa-share-alt mr-3 text-green-400"></i>
                                Accès Portail Adhérents
                            </h2>
                            <p class="text-gray-400">
                                Partagez l'accès au portail via liens ou QR code
                            </p>
                        </div>
                    </div>

                    <!-- Sélecteur Live / Local -->
                    <div class="flex gap-3 bg-gray-800/50 p-2 rounded-lg border border-gray-700">
                        <button onclick="PortalAccess.switchMode('live')"
                                class="flex-1 px-6 py-3 rounded-lg font-bold transition-all ${isLive ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}">
                            <i class="fas fa-globe mr-2"></i>
                            Version Live (Netlify)
                        </button>
                        <button onclick="PortalAccess.switchMode('local')"
                                class="flex-1 px-6 py-3 rounded-lg font-bold transition-all ${isLocal ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}">
                            <i class="fas fa-laptop mr-2"></i>
                            Version Locale
                        </button>
                    </div>
                </div>

                <!-- Informations sur le mode -->
                ${
                    isLive
                        ? `
                    <div class="glass-card rounded-xl p-4 mb-6 bg-green-900/20 border border-green-500/50">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-green-400 text-xl"></i>
                            <div>
                                <h4 class="font-bold text-green-300 mb-1">Version Live - Hébergement Netlify</h4>
                                <p class="text-sm text-green-200">
                                    Cette version est accessible depuis n'importe où sur internet. Parfait pour partager avec des adhérents à distance.
                                </p>
                                <p class="text-xs text-green-300 mt-2">
                                    URL: <code class="bg-green-900/50 px-2 py-1 rounded">${this.getPortalURL_Live()}</code>
                                </p>
                            </div>
                        </div>
                    </div>
                `
                        : `
                    <div class="glass-card rounded-xl p-4 mb-6 bg-indigo-900/20 border border-indigo-500/50">
                        <div class="flex items-start gap-3">
                            <i class="fas fa-info-circle text-indigo-400 text-xl"></i>
                            <div>
                                <h4 class="font-bold text-indigo-300 mb-1">Version Locale - Serveur Local</h4>
                                <p class="text-sm text-indigo-200">
                                    Cette version fonctionne sur votre réseau local. Les adhérents doivent être connectés au même WiFi.
                                </p>
                                <p class="text-xs text-indigo-300 mt-2">
                                    URL: <code class="bg-indigo-900/50 px-2 py-1 rounded">${this.getPortalURL_Local()}</code>
                                </p>
                            </div>
                        </div>
                    </div>
                `
                }

                <!-- Actions rapides -->
                <div class="glass-card rounded-xl p-6 mb-6" style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(82, 199, 89, 0.2);">
                    <h3 class="text-xl font-bold text-white mb-4">
                        <i class="fas fa-bolt mr-2 text-green-400"></i>
                        Actions Rapides
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button onclick="window.open('${portalURL}', '_blank')"
                                class="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold">
                            <i class="fas fa-external-link-alt mr-2"></i>
                            Ouvrir le portail
                        </button>
                        ${
                            isLocal
                                ? `
                            <button onclick="PortalAccess.promptLocalIP().then(() => PortalAccess.showPortalAccessView())"
                                    class="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-semibold">
                                <i class="fas fa-network-wired mr-2"></i>
                                Config IP Locale
                            </button>
                        `
                                : ''
                        }
                        <button onclick="PortalAccess.copyURL()"
                                id="copyButton"
                                class="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-semibold">
                            <i class="fas fa-copy mr-2"></i>
                            Copier le lien
                        </button>
                        <button onclick="PortalAccess.downloadQRCode()"
                                class="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold">
                            <i class="fas fa-download mr-2"></i>
                            Télécharger QR
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- QR Code -->
                    <div class="glass-card rounded-xl p-6" style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(82, 199, 89, 0.2);">
                        <h3 class="text-xl font-bold text-white mb-4">
                            <i class="fas fa-qrcode mr-2 text-green-400"></i>
                            QR Code
                        </h3>
                        <p class="text-gray-400 text-sm mb-4">
                            Les adhérents peuvent scanner ce QR code avec leur smartphone pour accéder directement au portail
                        </p>

                        <!-- QR Code Canvas -->
                        <div class="bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
                            <canvas id="qrCodeCanvas"></canvas>
                        </div>

                        <div class="flex gap-2">
                            <button onclick="PortalAccess.downloadQRCode()"
                                    class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold">
                                <i class="fas fa-download mr-2"></i>
                                Télécharger PNG
                            </button>
                            <button onclick="PortalAccess.printQRCode()"
                                    class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-semibold">
                                <i class="fas fa-print mr-2"></i>
                                Imprimer
                            </button>
                        </div>
                    </div>

                    <!-- Lien copiable -->
                    <div class="glass-card rounded-xl p-6" style="background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(82, 199, 89, 0.2);">
                        <h3 class="text-xl font-bold text-white mb-4">
                            <i class="fas fa-link mr-2 text-green-400"></i>
                            Lien Direct
                        </h3>
                        <p class="text-gray-400 text-sm mb-4">
                            Copiez ce lien pour le partager sur Discord, WhatsApp, ou toute autre plateforme
                        </p>

                        <!-- URL Display -->
                        <div class="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
                            <div class="flex items-center gap-3">
                                <i class="fas fa-globe text-gray-400"></i>
                                <input type="text"
                                       id="portalURLInput"
                                       value="${portalURL}"
                                       readonly
                                       class="flex-1 bg-transparent text-green-400 outline-none text-sm"
                                       onclick="this.select()">
                            </div>
                        </div>

                        <button onclick="PortalAccess.copyURL()"
                                id="copyButton"
                                class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-semibold">
                            <i class="fas fa-copy mr-2"></i>
                            Copier le lien
                        </button>

                        <!-- Suggestions de partage -->
                        <div class="mt-6 space-y-2">
                            <p class="text-sm font-semibold text-gray-300 mb-2">Partage rapide :</p>
                            <button onclick="PortalAccess.shareToDiscord()"
                                    class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm">
                                <i class="fab fa-discord mr-2"></i>
                                Message Discord
                            </button>
                            <button onclick="PortalAccess.shareToWhatsApp()"
                                    class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all text-sm">
                                <i class="fab fa-whatsapp mr-2"></i>
                                Message WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = html;

        // Générer le QR code
        this.generateQRCode(portalURL);
    },

    /**
     * Générer le QR Code
     * @param url
     */
    generateQRCode(url) {
        const canvas = document.getElementById('qrCodeCanvas');
        if (!canvas) {
            return;
        }

        // Utiliser QRCode.js via CDN (à charger dans index.html)
        // Pour l'instant, utiliser une API externe
        const size = 300;
        const qrAPIUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

        // Créer une image et la dessiner sur le canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
            const ctx = canvas.getContext('2d');
            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(img, 0, 0);
        };
        img.src = qrAPIUrl;
    },

    /**
     * Copier l'URL du portail
     */
    async copyURL() {
        const input = document.getElementById('portalURLInput');
        const button = document.getElementById('copyButton');

        try {
            await navigator.clipboard.writeText(input.value);

            // Feedback visuel
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check mr-2"></i>Lien copié !';
            button.classList.remove('bg-green-600', 'hover:bg-green-700');
            button.classList.add('bg-green-500');

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('bg-green-500');
                button.classList.add('bg-green-600', 'hover:bg-green-700');
            }, 2000);
        } catch (err) {
            // Fallback: sélectionner le texte
            input.select();
            document.execCommand('copy');
            alert('Lien copié !');
        }
    },

    /**
     * Télécharger le QR Code en PNG
     */
    downloadQRCode() {
        const canvas = document.getElementById('qrCodeCanvas');
        if (!canvas) {
            return;
        }

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'Portail-Membres-QRCode.png';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    },

    /**
     * Imprimer le QR Code
     */
    printQRCode() {
        const canvas = document.getElementById('qrCodeCanvas');
        if (!canvas) {
            return;
        }

        const portalURL = this.getPortalURL();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - Portail Adhérents</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 40px;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 20px;
                    }
                    img {
                        border: 2px solid #333;
                        padding: 20px;
                        background: white;
                    }
                    .url {
                        margin-top: 20px;
                        font-size: 14px;
                        color: #666;
                        word-break: break-all;
                    }
                    @media print {
                        body { padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <h1>🎮 Portail Adhérents Skäli Prog</h1>
                <p>Scannez ce QR code pour accéder au portail</p>
                <img src="${canvas.toDataURL()}" alt="QR Code">
                <div class="url">${portalURL}</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    },

    /**
     * Partager sur Discord
     */
    shareToDiscord() {
        const portalURL = this.getPortalURL();
        const message = `🎮 **Portail Adhérents Skäli Prog**\n\nAccédez à vos cartes Pokemon et performances :\n${portalURL}\n\n✨ Téléchargez vos cartes en PNG et partagez-les !`;

        navigator.clipboard.writeText(message).then(() => {
            alert('Message Discord copié ! Collez-le dans votre serveur Discord.');
        });
    },

    /**
     * Partager sur WhatsApp
     */
    shareToWhatsApp() {
        const portalURL = this.getPortalURL();
        const message = `🎮 *Portail Adhérents Skäli Prog*\n\nAccédez à vos cartes Pokemon et performances :\n${portalURL}\n\n✨ Téléchargez vos cartes en PNG et partagez-les !`;

        const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    }
};

// Exposer globalement
window.PortalAccess = PortalAccess;
