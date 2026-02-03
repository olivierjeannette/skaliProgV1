# BRAINSTORM - Skali Admin Migration

> Date: 2026-02-03
> Agent: @ANALYST (Mary)
> Sujet: Migration Skali Prog vers Next.js

---

## Techniques Utilisées

1. Vision Idéale
2. Reverse Brainstorm
3. Six Thinking Hats
4. Pre-Mortem
5. Opportunity Cost

---

## 1. Vision Idéale (2028)

- 100% migré en Next.js, zéro Vanilla JS
- Lighthouse 95+, temps chargement < 1s
- Tous les admins/coachs utilisent quotidiennement
- Code TypeScript strict, tests automatisés
- Mobile-first responsive

---

## 2. Reverse Brainstorm - Comment Échouer

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Migrer trop vite sans tests | Haute | Critique | MVP serré, tests |
| Perdre des fonctionnalités | Moyenne | Haute | Checklist features |
| UI incohérente | Moyenne | Moyenne | Design system |
| Over-engineering | Haute | Moyenne | KISS, YAGNI |
| Env dev non configuré | Actuel | Bloquant | Installer Node.js |

---

## 3. Six Thinking Hats

| Hat | Analyse |
|-----|---------|
| ⚪ Faits | 121 fichiers JS → ~40 fichiers à migrer (après exclusions) |
| ❤️ Émotions | Excitation code moderne, frustration legacy |
| ⚫ Risques | Temps, complexité coexistence |
| 💛 Bénéfices | Maintenabilité, TypeScript, DX |
| 💚 Créativité | Utiliser member-portal-next comme référence |
| 🔵 Process | BMAD complet avec checkpoints |

---

## 4. Pre-Mortem - Causes d'Échec

1. Migration jamais terminée → MVP clair
2. Ancien code plus stable → Tests
3. Coachs préfèrent l'ancien → Feedback early
4. Feature perdue → Documentation
5. Code incompréhensible → TypeScript strict

---

## 5. Opportunity Cost

| On gagne | On sacrifie |
|----------|-------------|
| TypeScript | Temps initial |
| shadcn/ui | Gorilla Glass design |
| Maintenabilité | Familiarité |
| Next.js App Router | Simplicité Vanilla |

**Trade-off accepté ✅**

---

## Décisions Clés

### Modules EXCLUS de la migration (supprimés)
- ❌ Programming Pro (génération programmes IA)
- ❌ Nutrition (plans nutritionnels)
- ❌ Cardio (cardiomon, cardiotv)
- ❌ Reports (rapports, allures)

### Modules INCLUS dans la migration
- ✅ Admin (Discord, Inventory, Settings, API Keys) - **PRIORITÉ MVP**
- ✅ Members (gestion membres)
- ✅ Calendar (sessions)
- ✅ Performance (tracking, pokemon cards)
- ✅ Teams (team builder)
- ✅ CRM (analytics)
- ✅ TV Mode (affichage salle)

### Utilisateurs Cibles
- 1-3 admins (toi + coachs seniors)

### Stack Confirmé
- Next.js 14+ (App Router)
- TypeScript
- shadcn/ui + Tailwind CSS
- Zustand + TanStack Query
- Supabase (existant)

---

## Open Questions Résolues

| Question | Réponse |
|----------|---------|
| Combien d'utilisateurs ? | 1-3 admins |
| Modules à supprimer ? | Prog Pro, Nutrition, Cardio, Reports |
| Design system ? | shadcn/ui (nouveau) |
| Auth strategy ? | Custom (3 rôles existants) |

---

*Brainstorming validé - Prêt pour Project Brief*
