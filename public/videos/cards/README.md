# Vidéos des Cartes Epic

Placer ici les vidéos compressées pour les cartes de héros.

## Convention de nommage

Chaque vidéo doit correspondre à l'ID du personnage dans `epic-cards.ts`:

```
phoenix-lord.webm      # Legendary - Berserker Feu
frost-emperor.webm     # Legendary - Mage Glace
storm-titan.webm       # Legendary - Warrior Foudre
void-walker.webm       # Legendary - Mystic Cosmique
blade-dancer.webm      # Epic - Assassin Ombre
light-bringer.webm     # Epic - Paladin Lumière
nature-warden.webm     # Epic - Guardian Nature
blood-hunter.webm      # Epic - Ranger Sang
iron-fist.webm         # Rare - Warrior Foudre
shadow-step.webm       # Rare - Assassin Ombre
flame-keeper.webm      # Rare - Mage Feu
frost-archer.webm      # Rare - Ranger Glace
steel-guard.webm       # Common - Guardian Lumière
wild-striker.webm      # Common - Berserker Feu
swift-blade.webm       # Common - Assassin Ombre
apprentice-mage.webm   # Common - Mage Cosmique
rookie-fighter.webm    # Starter - Warrior Lumière
trainee.webm           # Starter - Paladin Lumière
```

## Format recommandé

**WebM VP9** (priorité) - Le plus léger:
```powershell
ffmpeg -i original.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -vf "scale=720:-2" -an output.webm
```

**MP4 H.264** (fallback) - Compatibilité Safari ancien:
```powershell
ffmpeg -i original.mp4 -c:v libx264 -crf 26 -preset slow -vf "scale=720:-2" -an -movflags +faststart output.mp4
```

## Taille cible

- Original: 7-12 MB
- WebM compressé: 300-800 KB
- MP4 compressé: 500 KB - 1.2 MB

## Le navigateur choisit automatiquement

Le composant EpicCard essaie `.webm` d'abord, puis `.mp4` en fallback.
