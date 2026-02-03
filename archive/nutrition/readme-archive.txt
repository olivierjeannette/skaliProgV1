═══════════════════════════════════════════════════════════════
                    FICHIERS ARCHIVÉS
═══════════════════════════════════════════════════════════════

Ces fichiers ont été REMPLACÉS par le nouveau système consolidé.

Date d'archivage : 2025-01-04
Raison : Consolidation du module nutrition (réduction 85.8%)

═══════════════════════════════════════════════════════════════
ANCIEN SYSTÈME
═══════════════════════════════════════════════════════════════
26 fichiers, 19,393 lignes de code

Problèmes :
- Duplication massive de code
- Difficile à maintenir
- Incohérences entre versions
- Performance impactée

═══════════════════════════════════════════════════════════════
NOUVEAU SYSTÈME (4 fichiers actifs)
═══════════════════════════════════════════════════════════════
- nutrition-core.js              (742 lignes)
- nutrition-member-manager.js    (487 lignes)  
- nutrition-planner.js           (815 lignes)
- nutrition-pdf-pro.js           (700 lignes)

Total : 2,744 lignes (-85.8%)

═══════════════════════════════════════════════════════════════
RESTAURATION
═══════════════════════════════════════════════════════════════
Si besoin de revenir en arrière temporairement :

cd js/modules/nutrition/_archive
cp *.js ../

ATTENTION : Cela écrasera les nouveaux fichiers !

═══════════════════════════════════════════════════════════════
SUPPRESSION DÉFINITIVE
═══════════════════════════════════════════════════════════════
Après 1 mois d'utilisation sans problème du nouveau système :

rm -rf js/modules/nutrition/_archive/

═══════════════════════════════════════════════════════════════
