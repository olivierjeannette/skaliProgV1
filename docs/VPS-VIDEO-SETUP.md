# Configuration VPS Ubuntu - Hébergement Vidéos Epic Cards

## 1. Connexion SSH au VPS

```bash
ssh root@TON_IP_VPS
# ou avec clé SSH
ssh -i ~/.ssh/ta_cle root@TON_IP_VPS
```

## 2. Installation Nginx (si pas déjà installé)

```bash
# Mise à jour système
apt update && apt upgrade -y

# Installation Nginx
apt install nginx -y

# Vérifier que Nginx tourne
systemctl status nginx
systemctl enable nginx
```

## 3. Créer le dossier pour les vidéos

```bash
# Créer la structure
mkdir -p /var/www/static/cards
chmod 755 /var/www/static/cards

# Vérifier
ls -la /var/www/static/
```

## 4. Configuration Nginx pour servir les vidéos

Créer un fichier de config:

```bash
nano /etc/nginx/sites-available/static-cards
```

Coller cette configuration:

```nginx
server {
    listen 80;
    server_name static.ton-domaine.com;  # ou TON_IP_VPS

    root /var/www/static;

    # Logs
    access_log /var/log/nginx/static-cards.access.log;
    error_log /var/log/nginx/static-cards.error.log;

    # Vidéos des cartes
    location /cards/ {
        # CORS - permet à skali-prog de charger les vidéos
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range, Accept-Encoding" always;

        # Cache navigateur (1 an pour les vidéos - immutable)
        add_header Cache-Control "public, max-age=31536000, immutable" always;

        # Types MIME (WebM + MP4)
        types {
            video/mp4 mp4;
            video/webm webm;
        }

        # Compression désactivée pour vidéos (déjà compressées)
        gzip off;

        # Activer byte-range (streaming / seek)
        add_header Accept-Ranges bytes always;

        # Preflight OPTIONS (pour CORS)
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS";
            add_header Access-Control-Max-Age 86400;
            add_header Content-Length 0;
            return 204;
        }
    }
}
```

Activer la config:

```bash
# Lien symbolique
ln -s /etc/nginx/sites-available/static-cards /etc/nginx/sites-enabled/

# Tester la config
nginx -t

# Recharger Nginx
systemctl reload nginx
```

## 5. Compression des vidéos (sur ton PC Windows)

### Installer FFmpeg sur Windows

1. Télécharger: https://ffmpeg.org/download.html (build Windows)
2. Extraire dans `C:\ffmpeg`
3. Ajouter `C:\ffmpeg\bin` au PATH Windows

### Compression recommandée: WebM VP9 (MEILLEUR)

Le format WebM VP9 offre le meilleur ratio qualité/taille (~60% plus léger que H.264).

```powershell
# WebM VP9 - Qualité excellente, fichiers très légers
ffmpeg -i original.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -vf "scale=720:-2" -an output.webm

# Toutes les vidéos du dossier en WebM
Get-ChildItem -Filter *.mp4 | ForEach-Object {
    $output = $_.BaseName + ".webm"
    ffmpeg -i $_.FullName -c:v libvpx-vp9 -crf 30 -b:v 0 -vf "scale=720:-2" -an $output
}
```

**Résultat:** 7-12 MB → **300-800 KB** (qualité top!)

### Fallback MP4 H.264 (compatibilité)

Créer aussi une version MP4 pour les vieux navigateurs:

```powershell
# MP4 H.264 - Fallback compatibilité
ffmpeg -i original.mp4 -c:v libx264 -crf 26 -preset veryslow -tune film -vf "scale=720:-2" -an -movflags +faststart output.mp4

# Toutes les vidéos
Get-ChildItem -Filter *.mp4 -Exclude *_compressed* | ForEach-Object {
    $output = $_.BaseName + "_web.mp4"
    ffmpeg -i $_.FullName -c:v libx264 -crf 26 -preset veryslow -tune film -vf "scale=720:-2" -an -movflags +faststart $output
}
```

**Résultat:** 7-12 MB → **500 KB - 1.2 MB**

### Script complet (crée les 2 formats)

```powershell
# Créer WebM + MP4 pour chaque vidéo
Get-ChildItem -Filter *.mp4 | ForEach-Object {
    $baseName = $_.BaseName

    # WebM VP9 (priorité navigateur)
    Write-Host "Compression WebM: $baseName"
    ffmpeg -i $_.FullName -c:v libvpx-vp9 -crf 30 -b:v 0 -vf "scale=720:-2" -an "$baseName.webm"

    # MP4 H.264 (fallback)
    Write-Host "Compression MP4: $baseName"
    ffmpeg -i $_.FullName -c:v libx264 -crf 26 -preset slow -vf "scale=720:-2" -an -movflags +faststart "$baseName-web.mp4"
}
```

**Paramètres WebM:**
- `-c:v libvpx-vp9`: Codec VP9 (moderne, efficace)
- `-crf 30`: Qualité (23=haute, 30=web optimisé, 40=basse)
- `-b:v 0`: Bitrate variable (laisse VP9 optimiser)

**Paramètres MP4:**
- `-crf 26`: Qualité (18=très haute, 26=web, 35=basse)
- `-preset veryslow`: Meilleure compression
- `-tune film`: Optimisé pour vidéos fluides
- `-movflags +faststart`: Streaming instantané

## 6. Upload des vidéos sur le VPS

### Option A: SCP (depuis PowerShell)

```powershell
# Une vidéo
scp compressed_warrior.mp4 root@TON_IP_VPS:/var/www/static/cards/

# Toutes les vidéos
scp *.mp4 root@TON_IP_VPS:/var/www/static/cards/
```

### Option B: FileZilla/WinSCP

1. Se connecter en SFTP au VPS
2. Naviguer vers `/var/www/static/cards/`
3. Drag & drop les vidéos compressées

## 7. Nommer les fichiers vidéo

Convention de nommage pour correspondre aux classes Epic Card.
**IMPORTANT:** Uploader les 2 formats (WebM + MP4) avec le même nom de base:

```
/var/www/static/cards/
├── warrior-fire.webm      # Priorité (léger, moderne)
├── warrior-fire.mp4       # Fallback (compatibilité)
├── mage-ice.webm
├── mage-ice.mp4
├── ranger-nature.webm
├── ranger-nature.mp4
├── paladin-light.webm
├── paladin-light.mp4
├── assassin-shadow.webm
├── assassin-shadow.mp4
├── berserker-blood.webm
├── berserker-blood.mp4
├── guardian-cosmic.webm
├── guardian-cosmic.mp4
├── mystic-lightning.webm
└── mystic-lightning.mp4
```

Le navigateur choisira automatiquement WebM s'il le supporte, sinon MP4.

## 8. Tester

Depuis ton navigateur:

```
http://TON_IP_VPS/cards/warrior-fire.mp4
```

La vidéo doit se lire directement.

## 9. (Optionnel) HTTPS avec Certbot

Si tu as un domaine:

```bash
# Installer Certbot
apt install certbot python3-certbot-nginx -y

# Obtenir certificat
certbot --nginx -d static.ton-domaine.com

# Auto-renouvellement
systemctl enable certbot.timer
```

## 10. Intégration dans le code

### Mettre à jour epic-cards.ts

Ajouter l'URL vidéo dans la config:

```typescript
// Dans src/config/epic-cards.ts

const VPS_VIDEO_URL = 'http://TON_IP_VPS/cards'  // ou https://static.ton-domaine.com/cards

// Dans CHARACTERS, ajouter:
export const CHARACTERS: Record<string, EpicCharacter> = {
  // Legendary
  dragonlord_kael: {
    id: 'dragonlord_kael',
    name: 'Kael the Dragonlord',
    // ... autres props
    videoUrl: `${VPS_VIDEO_URL}/warrior-fire.mp4`,  // NOUVEAU
  },
  // ... autres personnages
}
```

### Modifier EpicCard.tsx

Ajouter support vidéo en background:

```tsx
// Dans le composant EpicCard, remplacer l'image par:

{character.videoUrl ? (
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src={character.videoUrl} type="video/mp4" />
  </video>
) : (
  <Image
    src={character.image}
    alt={character.name}
    fill
    className="object-cover"
  />
)}
```

---

## Checklist

- [ ] VPS accessible en SSH
- [ ] Nginx installé et actif
- [ ] Dossier `/var/www/static/cards` créé
- [ ] Config Nginx pour static-cards
- [ ] Vidéos compressées (< 2 MB chacune)
- [ ] Vidéos uploadées sur le VPS
- [ ] Test URL vidéo OK
- [ ] (Optionnel) HTTPS configuré
- [ ] Code mis à jour pour utiliser les vidéos

---

*Guide créé pour Skali Prog - Session 18*
