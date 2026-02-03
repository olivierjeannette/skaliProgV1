/**
 * AI PROMPT BUILDER
 * Construction du prompt ultra-complet pour Claude Haiku 3.5
 * Inclut TOUTES les données collectées pour génération optimale
 */

const AIProgramPromptBuilder = {
    /**
     * Construction du prompt complet
     * @param formData
     * @param athlete
     * @param exercises
     * @param methodologies
     * @param inventory
     * @param testingProtocols
     */
    async buildPrompt(formData, athlete, exercises, methodologies, inventory, testingProtocols) {
        const sections = [];

        // En-tête
        sections.push(this.buildHeader());

        // Profil athlète
        sections.push(this.buildAthleteProfile(formData, athlete));

        // Objectifs et périodisation
        sections.push(this.buildObjectives(formData));

        // Données physiologiques
        sections.push(this.buildPhysiologicalData(formData));

        // Qualités physiques prioritaires
        sections.push(this.buildPhysicalQualities(formData));

        // Volume et disponibilité
        sections.push(this.buildAvailability(formData));

        // Niveau et expérience
        sections.push(this.buildExperience(formData));

        // Récupération et lifestyle
        sections.push(this.buildRecovery(formData));

        // Contraintes et limitations
        sections.push(this.buildConstraints(formData));

        // Périodisation avancée
        sections.push(this.buildPeriodization(formData));

        // Bases de données disponibles
        sections.push(this.buildDatabases(exercises, methodologies, inventory, testingProtocols));

        // Instructions de génération
        sections.push(this.buildGenerationInstructions(formData));

        return sections.join('\n\n');
    },

    /**
     * En-tête du prompt
     */
    buildHeader() {
        return `# GÉNÉRATION PROGRAMME D'ENTRAÎNEMENT PROFESSIONNEL

Tu es un préparateur physique international certifié, spécialisé dans la création de programmes d'entraînement personnalisés de niveau olympique.

Ton objectif : Créer un programme d'entraînement ultra-personnalisé basé sur les données complètes de l'athlète ci-dessous.

## PRINCIPES FONDAMENTAUX
- Progression scientifique basée sur les données
- Individualisation maximale selon profil
- Périodisation optimale pour atteindre l'objectif
- Prévention blessures et gestion récupération
- Variété et spécificité des exercices
- Respect des contraintes et limitations`;
    },

    /**
     * Profil athlète
     * @param formData
     * @param athlete
     */
    buildAthleteProfile(formData, athlete) {
        return `## PROFIL ATHLÈTE

**Identité:**
- Nom: ${athlete.name || 'Athlète'}
- Âge: ${formData.age || athlete.age || 'NC'} ans
- Sexe: ${formData.sex === 'male' ? 'Homme' : formData.sex === 'female' ? 'Femme' : 'NC'}
- Poids: ${formData.weight_kg || athlete.weight_kg || 'NC'} kg
- Taille: ${formData.height_cm || athlete.height_cm || 'NC'} cm
- IMC: ${this.calculateBMI(formData)}
- % Masse grasse: ${formData.bodyfat_percent || 'Non mesuré'}

**Données cardiaques:**
- FCmax: ${formData.hr_max || 'Non mesuré'} bpm
- FC repos: ${formData.hr_rest || 'Non mesuré'} bpm
- Réserve FC: ${this.calculateHRReserve(formData)} bpm`;
    },

    /**
     * Objectifs
     * @param formData
     */
    buildObjectives(formData) {
        const sportName = this.getSportName(formData.sport);
        const hasCompetition = !!formData.competition_date;

        return `## OBJECTIFS & CONTEXTE

**Sport principal:** ${sportName}
**Titre du programme:** ${formData.program_title || `Programme ${sportName} personnalisé`}

**Calendrier:**
- Durée totale: ${formData.duration_weeks} semaines
- Date début: ${formData.start_date}
- Date fin estimée: ${this.calculateEndDate(formData.start_date, formData.duration_weeks)}
${hasCompetition ? `- **DATE COMPÉTITION: ${formData.competition_date}** ⚠️ PÉRIODISATION OBLIGATOIRE` : ''}

**Phase actuelle:** ${this.getPhaseName(formData.current_phase)}
**Niveau visé compétition:** ${this.getCompetitionLevelName(formData.competition_level)}`;
    },

    /**
     * Données physiologiques
     * @param formData
     */
    buildPhysiologicalData(formData) {
        const sport = formData.sport;
        let perfData = '**Performances actuelles:**\n';

        // Running/Trail
        if (['running', 'trail', 'ultratrail'].includes(sport)) {
            perfData += `- VMA: ${formData.vma || 'Non testé'} km/h\n`;
            perfData += `- VO2max: ${formData.vo2max || 'Non testé'} ml/kg/min\n`;
            perfData += `- Seuil lactique: ${formData.lactate_threshold || 'Non testé'}\n`;
            perfData += `- Économie de course: ${formData.running_economy || 'Non testé'}\n`;
        }

        // Cyclisme
        if (sport === 'cyclisme') {
            perfData += `- FTP: ${formData.ftp_watts || 'Non testé'} watts\n`;
            perfData += `- FTP/kg: ${formData.ftp_wkg || 'Non calculé'} W/kg\n`;
            perfData += `- VO2max: ${formData.vo2max || 'Non testé'} ml/kg/min\n`;
            perfData += `- Cadence préférée: ${formData.preferred_cadence || 'Non spécifié'} rpm\n`;
        }

        // Force sports
        if (['crossfit', 'hyrox', 'musculation'].includes(sport)) {
            perfData += `- Squat 1RM: ${formData.squat_1rm || 'Non testé'} kg\n`;
            perfData += `- Bench Press 1RM: ${formData.bench_1rm || 'Non testé'} kg\n`;
            perfData += `- Deadlift 1RM: ${formData.deadlift_1rm || 'Non testé'} kg\n`;
            perfData += `- Overhead Press 1RM: ${formData.press_1rm || 'Non testé'} kg\n`;
            if (formData.clean_1rm) {
                perfData += `- Clean 1RM: ${formData.clean_1rm} kg\n`;
            }
            if (formData.snatch_1rm) {
                perfData += `- Snatch 1RM: ${formData.snatch_1rm} kg\n`;
            }
        }

        // Natation
        if (sport === 'natation') {
            perfData += `- CSS: ${formData.css || 'Non testé'} m/s\n`;
            perfData += `- Temps 400m: ${formData.swim_400m || 'Non testé'}\n`;
            perfData += `- VO2max: ${formData.vo2max || 'Non testé'} ml/kg/min\n`;
        }

        // Sports collectifs
        if (['football', 'rugby', 'basketball', 'handball'].includes(sport)) {
            perfData += `- Sprint 30m: ${formData.sprint_30m || 'Non testé'} sec\n`;
            perfData += `- Détente verticale: ${formData.vertical_jump || 'Non testé'} cm\n`;
            perfData += `- Yo-Yo Test: ${formData.yoyo_level || 'Non testé'} niveau\n`;
            perfData += `- VO2max: ${formData.vo2max || 'Non testé'} ml/kg/min\n`;
        }

        perfData += `\n**⚠️ IMPORTANT:** Si données manquantes, ESTIME le niveau de l'athlète à partir de:
- Son âge, poids, sexe
- Son niveau déclaré (${formData.current_level})
- Ses années de pratique
- Son sport principal
Utilise les normes scientifiques pour établir des valeurs de référence réalistes.`;

        return `## DONNÉES PHYSIOLOGIQUES\n\n${perfData}`;
    },

    /**
     * Qualités physiques
     * @param formData
     */
    buildPhysicalQualities(formData) {
        const qualities = formData.physical_qualities ? formData.physical_qualities.split(',') : [];

        let section = '## QUALITÉS PHYSIQUES PRIORITAIRES\n\n';

        if (qualities.length === 0) {
            section +=
                '**Aucune qualité spécifique sélectionnée** → Utilise les qualités dominantes du sport choisi.\n';
        } else {
            section += `**Nombre de qualités:** ${qualities.length}\n\n`;
            section += '**Répartition dans le programme:**\n';
            qualities.forEach(quality => {
                const percent = formData[`quality_percent_${quality}`] || 0;
                section += `- ${this.getQualityFullName(quality)}: ${percent}%\n`;
            });
            section +=
                "\n**Instructions:** Respecte STRICTEMENT ces pourcentages dans la répartition du volume d'entraînement.";
        }

        // Ajouter méthodes spécifiques pour force maximale si demandée
        if (qualities.includes('force-max')) {
            section += `\n\n**MÉTHODES FORCE MAXIMALE À INTÉGRER:**
- 5x5 @ 80-85% 1RM (méthode classique)
- 3x3 @ 87-92% 1RM (force maximale intense)
- 5-3-1 progressif (semaine 1: 5x5, semaine 2: 3x3, semaine 3: 1x1+)
- Clusters: 5x(2-2-2) @ 90% avec 20s repos intra-série
- Contraste charge: 1x5 lourd + 1x10 léger explosif
- Exercices prioritaires: Squat, Deadlift, Bench Press, Overhead Press, Front Squat`;
        }

        return section;
    },

    /**
     * Disponibilité
     * @param formData
     */
    buildAvailability(formData) {
        const days = formData.available_days ? formData.available_days.split(',') : [];
        const daysNames = {
            mon: 'Lundi',
            tue: 'Mardi',
            wed: 'Mercredi',
            thu: 'Jeudi',
            fri: 'Vendredi',
            sat: 'Samedi',
            sun: 'Dimanche'
        };

        return `## VOLUME & DISPONIBILITÉ

**Fréquence:**
- Séances par semaine: ${formData.sessions_per_week}
- Durée moyenne séance: ${formData.session_duration} minutes
- **Volume hebdomadaire total: ${((formData.sessions_per_week * formData.session_duration) / 60).toFixed(1)} heures**

**Jours disponibles:**
${formData.flexible_schedule ? '- Planning FLEXIBLE (pas de contrainte de jours)' : days.map(d => `- ${daysNames[d]}`).join('\n')}

**Créneaux horaires préférés:**
${formData.time_slot_morning ? '- Matin (6h-10h)\n' : ''}${formData.time_slot_noon ? '- Midi (11h-14h)\n' : ''}${formData.time_slot_afternoon ? '- Après-midi (14h-18h)\n' : ''}${formData.time_slot_evening ? '- Soir (18h-22h)\n' : ''}

**Matériel disponible:** ${this.getEquipmentDescription(formData.equipment_access)}
${formData.home_equipment ? `**Matériel domicile:** ${formData.home_equipment}\n` : ''}**Lieu d'entraînement:** ${this.getTrainingLocationName(formData.training_location)}`;
    },

    /**
     * Expérience
     * @param formData
     */
    buildExperience(formData) {
        return `## NIVEAU & EXPÉRIENCE

**Niveau actuel:** ${this.getLevelDescription(formData.current_level)}

**Expérience:**
- Années pratique sport principal: ${formData.years_sport || 'NC'} ans
- Années préparation physique structurée: ${formData.years_training || 'NC'} ans
- Compétitions dernière année: ${formData.competitions_last_year || 'NC'}
- Meilleur résultat: ${formData.best_result || 'NC'}

**Tests récents:**
- Dernier test VMA/FTP/1RM: ${formData.last_test_date || 'Jamais'}
- Dernière éval composition corporelle: ${formData.last_body_comp_date || 'Jamais'}
- Dernier bilan médical: ${formData.last_medical_date || 'Jamais'}

**Progressions récentes (6 derniers mois):**
- Poids: ${formData.weight_change_direction || '='}${formData.weight_change_value || '0'} kg
- Squat 1RM: ${formData.squat_change_direction || '='}${formData.squat_change_value || '0'} kg
- VMA: ${formData.vma_change_direction || '='}${formData.vma_change_value || '0'} km/h
${formData.other_progressions ? `- Autres: ${formData.other_progressions}` : ''}

**Instructions:** Adapte la vitesse de progression selon:
- Débutant: +2-5%/semaine
- Intermédiaire: +1-3%/semaine
- Avancé: +0.5-2%/semaine
- Élite: +0.25-1%/semaine`;
    },

    /**
     * Récupération
     * @param formData
     */
    buildRecovery(formData) {
        return `## RÉCUPÉRATION & LIFESTYLE

**Récupération:**
- Capacité de récupération: ${this.getRecoveryCapacityDesc(formData.recovery_capacity)}
- Heures de sommeil/nuit: ${formData.sleep_hours}h
- Qualité du sommeil: ${this.getSleepQualityDesc(formData.sleep_quality)}
- Siestes: ${this.getNapsDesc(formData.naps)}

**Stress & Fatigue:**
- Niveau de stress quotidien: ${formData.stress_level}/10
- Niveau de fatigue actuel: ${formData.fatigue_level}/10
- Travail physique: ${this.getPhysicalJobDesc(formData.physical_job)}
- Trajets longs quotidiens: ${formData.long_commute === 'yes' ? 'Oui' : 'Non'}

**Nutrition:**
- Apport protéines: ${formData.protein_intake || 'NC'} g/kg/jour
- Régime alimentaire: ${formData.diet_type || 'Omnivore'}
- Hydratation: ${this.getHydrationDesc(formData.hydration)}
- Alcool: ${this.getAlcoholDesc(formData.alcohol)}

**Supplémentation:**
${formData.supp_creatine ? '- Créatine (5g/jour)\n' : ''}${formData.supp_protein ? '- Protéines\n' : ''}${formData.supp_vitamins ? '- Vitamines/Minéraux\n' : ''}${formData.supp_omega3 ? '- Oméga-3\n' : ''}${formData.supp_caffeine ? '- Caféine pré-workout\n' : ''}${formData.supp_bcaa ? '- BCAA/EAA\n' : ''}${formData.other_supplements ? `- Autres: ${formData.other_supplements}\n` : ''}

**⚠️ ADAPTATION DU VOLUME:**
- Si sommeil < 7h ET volume > 10h/semaine: RÉDUIRE volume ou augmenter récupération
- Si stress ≥ 8/10: Prévoir plus de jours de récupération active
- Si récupération "lente": Espacer séances intenses de 48-72h minimum`;
    },

    /**
     * Contraintes
     * @param formData
     */
    buildConstraints(formData) {
        return `## CONTRAINTES & LIMITATIONS

**Blessures actuelles:**
${formData.current_injuries || 'Aucune blessure actuelle'}

**Historique blessures:**
- Blessures récurrentes: ${formData.recurring_injuries || 'Aucune'}
- Zones fragiles: ${formData.fragile_zones || 'Aucune'}
- Opérations passées: ${formData.past_surgeries || 'Aucune'}

**Exercices à éviter:**
${this.formatAvoidExercises(formData)}

**Douleurs chroniques:**
- Localisation: ${formData.pain_location || 'Aucune'}
- Intensité: ${formData.pain_intensity || '0'}/10
- Déclencheurs: ${formData.pain_triggers || 'N/A'}

**Limitations de mobilité:**
${formData.mobility_ankles ? '- Chevilles (dorsiflexion limitée)\n' : ''}${formData.mobility_hips ? '- Hanches (flexion/extension)\n' : ''}${formData.mobility_shoulders ? '- Épaules (rotation/élévation)\n' : ''}${formData.mobility_thoracic ? '- Colonne thoracique (rotation)\n' : ''}${formData.mobility_wrists ? '- Poignets\n' : ''}${formData.mobility_hamstrings ? '- Ischio-jambiers\n' : ''}${formData.other_mobility_limits ? `- Autres: ${formData.other_mobility_limits}\n` : ''}

**Informations médicales:**
${formData.medical_notes || 'Aucune condition médicale particulière'}

**⚠️ IMPÉRATIF:**
- EXCLURE TOTALEMENT les exercices listés ci-dessus
- ADAPTER les variations pour éviter déclencheurs de douleur
- INCLURE travail mobilité sur zones limitées
- PROGRESSIVITÉ maximale sur zones fragiles`;
    },

    /**
     * Périodisation
     * @param formData
     */
    buildPeriodization(formData) {
        const hasCompetition = !!formData.competition_date;

        let section = `## PÉRIODISATION & STRUCTURE

**Type de périodisation:** ${this.getPeriodizationDescription(formData.periodization_type)}

`;

        if (hasCompetition) {
            section += `**Structure vers compétition (OBLIGATOIRE):**
- PPG (Préparation Physique Générale): ${formData.ppg_weeks} semaines
  → Volume élevé (70-80%), Intensité basse (60-70%)
  → Développement base aérobie, force générale, mobilité

- PPO (Préparation Physique Orientée): ${formData.ppo_weeks} semaines
  → Volume modéré (60-70%), Intensité modérée (70-85%)
  → Développement qualités spécifiques au sport

- PPS (Préparation Physique Spécifique): ${formData.pps_weeks} semaines
  → Volume bas (40-60%), Intensité haute (85-95%)
  → Travail très spécifique compétition, simulations

- Tapering: ${formData.tapering_days} jours
  → Réduction progressive volume (-40 à -60%)
  → Maintien intensité
  → Optimisation fraîcheur pour compétition

`;
        }

        section += `**Tests & Évaluations:**
- Fréquence: ${formData.test_frequency == 0 ? 'Pas de tests planifiés' : `Toutes les ${formData.test_frequency} semaines`}
- Types de tests: ${this.getTestTypes(formData)}

**Deload & Récupération:**
- Fréquence deload: ${formData.deload_frequency == 0 ? 'Pas de deload' : `Toutes les ${formData.deload_frequency} semaines`}
- Type deload: ${this.getDeloadTypeDesc(formData.deload_type)}
- Semaines OFF complètes: ${formData.weeks_off || 0}

**Cycles:**
- Microcycle: 7 jours (semaine)
- Mésocycle: ${formData.deload_frequency || 4} semaines (bloc entre deloads)
- Macrocycle: ${formData.duration_weeks} semaines (durée totale)`;

        return section;
    },

    /**
     * Bases de données
     * @param exercises
     * @param methodologies
     * @param inventory
     * @param testingProtocols
     */
    buildDatabases(exercises, methodologies, inventory, testingProtocols) {
        // Ajouter formats spécifiques par sport
        let sportSpecificFormats = '';

        if (window.WorkoutFormatsDatabase) {
            sportSpecificFormats = `\n\n**FORMATS DE SÉANCES SPÉCIFIQUES PAR SPORT:**

Trail Running:
- Endurance Fondamentale: Course continue Z2 (60-180min), terrain varié
- Seuil/Tempo: 3x10min, 2x15min, 4x8min @ seuil lactique
- Fractionné Court VMA: 12x400m, 8x500m, 6x800m @ 90-100% VMA
- Côtes/Dénivelé: 10-15x montées courtes explosives, 6-8x montées moyennes
- Sortie Longue: 90-300min avec variations terrain

HYROX:
- Simulation Complète: 8x (1km Run + Station HYROX)
- Stations Isolées: SkiErg 5x500m, Sled 10x50m Push+Pull, Row 3x1000m
- MetCon HYROX: AMRAP/For Time avec mix course + stations
- Transitions: Course → Station → Course (travail transitions rapides)

CrossFit:
- MetCon Classique: Fran, Cindy, Helen, Murph, Grace (WODs célèbres)
- Force 5x5: Back Squat, Deadlift, Bench @ 80-85% 1RM
- Gymnastique: Pull-ups, Muscle-ups, HSPU, Handstand Walk
- Engine Building: 30-60min Assault Bike/Row/Ski Z2

Musculation (Build):
- Push: Bench 4x6-8 + Incline DB 3x10-12 + Lateral Raises 3x12-15
- Pull: Deadlift 4x6-8 + Lat Pulldowns 3x10-12 + Cable Rows 3x12
- Legs: Squat 4x6-8 + Bulgarian Splits 3x10 + Leg Press 3x12-15

**IMPORTANT - VARIATION OBLIGATOIRE:**
- CHAQUE semaine DOIT avoir des séances DIFFÉRENTES
- Utilise les FORMATS SPÉCIFIQUES ci-dessus pour créer variété
- Alterne les formats même pour le même type de séance
- Exemple: Semaine 1 = "3x10min seuil", Semaine 2 = "2x15min seuil", Semaine 3 = "4x8min seuil"`;
        }

        return `## BASES DE DONNÉES DISPONIBLES

**Exercices disponibles:** ${exercises ? exercises.length : 0} exercices
**Méthodologies:** ${methodologies ? Object.keys(methodologies).length : 0} catégories
**Inventaire matériel:** ${inventory ? Object.keys(inventory).length : 0} types d'équipement
**Protocoles de tests:** Disponibles
${sportSpecificFormats}

**Instructions d'utilisation:**
1. SÉLECTIONNE les exercices appropriés selon:
   - Sport principal
   - Qualités à développer
   - Matériel disponible
   - Limitations/blessures (EXCLURE exercices interdits)

2. APPLIQUE les méthodologies scientifiques:
   - Choisis la méthode selon la qualité ciblée
   - Respecte les paramètres (reps, séries, intensité, repos)
   - Varie les méthodes pour éviter plateaux

3. UTILISE l'inventaire pour:
   - Vérifier disponibilité matériel
   - Proposer alternatives si matériel manquant
   - Optimiser utilisation équipement disponible`;
    },

    /**
     * Instructions de génération
     * @param formData
     */
    buildGenerationInstructions(formData) {
        return `## INSTRUCTIONS DE GÉNÉRATION

**Format de sortie attendu:**

\`\`\`json
{
  "program_title": "Titre du programme",
  "athlete_summary": "Résumé profil athlète en 2-3 phrases",
  "objectives": ["Objectif 1", "Objectif 2", "Objectif 3"],
  "weeks": [
    {
      "week_number": 1,
      "phase": "PPG/PPO/PPS ou phase correspondante",
      "focus": "Focus principal de la semaine",
      "total_volume_minutes": 360,
      "sessions": [
        {
          "day": "Monday",
          "title": "Titre séance",
          "duration_minutes": 60,
          "type": "Force/Endurance/Mobilité/Mixte",
          "objectives": ["Objectif séance"],
          "warmup": {
            "duration_minutes": 10,
            "exercises": [
              {
                "name": "Nom exercice",
                "sets": 2,
                "reps": "10",
                "rest_seconds": 0,
                "notes": "Instructions"
              }
            ]
          },
          "main_work": {
            "duration_minutes": 40,
            "methodology": "Nom de la méthodologie utilisée",
            "exercises": [
              {
                "name": "Nom exercice",
                "sets": 4,
                "reps": "8-10",
                "intensity": "75% 1RM",
                "rest_seconds": 120,
                "tempo": "3-0-1-0",
                "notes": "Instructions techniques"
              }
            ]
          },
          "cooldown": {
            "duration_minutes": 10,
            "exercises": [
              {
                "name": "Nom exercice",
                "duration": "5 minutes",
                "notes": "Instructions"
              }
            ]
          },
          "rpe_target": "7-8/10",
          "technical_notes": "Notes techniques importantes"
        }
      ],
      "weekly_notes": "Notes importantes pour la semaine",
      "recovery_recommendations": "Recommandations récupération"
    }
  ],
  "progression_strategy": "Explication stratégie de progression sur toute la durée",
  "testing_schedule": "Planning des tests",
  "nutrition_recommendations": "Recommandations nutrition générales",
  "key_success_factors": ["Facteur 1", "Facteur 2", "Facteur 3"]
}
\`\`\`

**RÈGLES IMPÉRATIVES:**

1. **Personnalisation maximale**
   - Utilise TOUTES les données fournies
   - Adapte CHAQUE séance au profil
   - Respecte ABSOLUMENT les contraintes

2. **Progression scientifique**
   - Applique les principes de surcharge progressive
   - Respecte les taux de progression selon niveau
   - Intègre variété ET cohérence

3. **Sécurité**
   - JAMAIS d'exercice de la liste "à éviter"
   - Progressivité sur zones fragiles
   - Travail mobilité sur limitations

4. **Périodisation**
   ${formData.competition_date ? '- RESPECTE STRICTEMENT PPG → PPO → PPS → Tapering' : '- Applique la périodisation choisie'}
   - Intègre deloads planifiés
   - Varie intensité et volume

5. **Volume et intensité**
   - Respecte durée séances (${formData.session_duration} min)
   - Respecte fréquence (${formData.sessions_per_week} séances/semaine)
   - Équilibre travail/récupération selon profil

6. **Qualités physiques**
   - Respecte les pourcentages de répartition
   - Intègre les méthodologies appropriées
   - Varie les stimuli

7. **VARIATION DES SÉANCES - CRITIQUE**
   - CHAQUE semaine DOIT être DIFFÉRENTE des autres
   - Ne JAMAIS copier-coller la même séance plusieurs semaines
   - Pour le trail: alterner formats (3x10min, 2x15min, 4x8min, etc.)
   - Pour la muscu: changer exercices assistance, angles, méthodes
   - Pour HYROX: varier stations ciblées et formats
   - Progression: volume semaine 1-2, intensité semaine 3-4, spécificité semaine 5+

8. **DÉTAIL DES EXERCICES - OBLIGATION**
   - Liste TOUS les exercices dans main_work (minimum 3-6 par séance)
   - Spécifie TOUJOURS: name, sets, reps, rest_seconds, intensity
   - Ajoute notes techniques sur chaque exercice
   - Warmup: 2-3 exercices mobilité + activation
   - Main work: exercices CONCRETS (pas "exercice composé" mais "Back Squat")
   - Cooldown: étirements spécifiques + retour calme

9. **FORMATS SPÉCIFIQUES PAR SPORT**
   Trail: Utilise formats ITRA (EF, Seuil, VMA, Côtes, Technique)
   HYROX: Simulations + Stations isolées + MetCons spécifiques
   CrossFit: Intègre WODs célèbres + Force 5x5 + Gymnastic skills
   Musculation: Push/Pull/Legs avec 1 exercice composé + 3-4 assistances

10. **PROGRESSION ET VARIATION SUR ${formData.duration_weeks} SEMAINES**
    EXEMPLE PROGRESSION TRAIL (4 semaines):
    Semaine 1: EF 60min plat, Seuil 3x10min, VMA 12x400m, Côtes courtes 10x1min
    Semaine 2: EF 75min vallonné, Seuil 2x15min, VMA 8x500m, Côtes moyennes 6x3min
    Semaine 3: EF 90min mixte, Seuil 4x8min, VMA 6x800m, Côtes longues 3x8min
    Semaine 4: EF 60min récup, Seuil 20min continu, VMA pyramide, Technique descentes

    EXEMPLE PROGRESSION MUSCU (4 semaines):
    Semaine 1 Push: Bench 4x8 @ 75%, Incline DB 3x10, Flyes 3x12, Triceps 3x15
    Semaine 2 Push: Bench 5x5 @ 82%, Incline Barbell 4x8, Dips 3x10, Overhead Triceps 3x12
    Semaine 3 Push: Bench 3x3 @ 90%, Close-Grip Bench 4x6, Cable Flyes 3x15, Diamond Push-ups 3xAMRAP
    Semaine 4 Push: Bench 4x6 @ 80%, Landmine Press 3x10, Pec Deck 3x12, Rope Pushdowns 3x20

    → Change TOUJOURS: durée, format, intensité, exercices, méthode

**GÉNÈRE MAINTENANT le programme complet pour ${formData.duration_weeks} semaines.**

IMPORTANT: Ce programme sera utilisé pour une compétition le ${formData.competition_date || 'date non spécifiée'}.
Chaque semaine DOIT progresser vers cet objectif avec des séances UNIQUES et VARIÉES.

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire avant ou après.`;
    },

    /**
     * Helpers
     * @param formData
     */
    calculateBMI(formData) {
        const weight = parseFloat(formData.weight_kg);
        const height = parseFloat(formData.height_cm) / 100;
        if (!weight || !height) {
            return 'NC';
        }
        return (weight / (height * height)).toFixed(1);
    },

    calculateHRReserve(formData) {
        const hrMax = parseInt(formData.hr_max);
        const hrRest = parseInt(formData.hr_rest);
        if (!hrMax || !hrRest) {
            return 'NC';
        }
        return hrMax - hrRest;
    },

    calculateEndDate(startDate, weeks) {
        if (!startDate || !weeks) {
            return 'NC';
        }
        const start = new Date(startDate);
        start.setDate(start.getDate() + weeks * 7);
        return start.toISOString().split('T')[0];
    },

    getSportName(sportId) {
        const names = {
            running: 'Course à pied',
            trail: 'Trail running',
            ultratrail: 'Ultra-trail',
            cyclisme: 'Cyclisme',
            crossfit: 'CrossFit',
            hyrox: 'HYROX',
            musculation: 'Musculation',
            natation: 'Natation',
            football: 'Football',
            rugby: 'Rugby',
            basketball: 'Basketball',
            handball: 'Handball'
        };
        return names[sportId] || sportId;
    },

    getPhaseName(phase) {
        const names = {
            'off-season': 'Hors-saison / Repos actif',
            'general-prep': 'Préparation générale (PPG)',
            'specific-prep': 'Préparation spécifique (PPS)',
            competition: 'Compétition / Maintien',
            transition: 'Transition / Récupération'
        };
        return names[phase] || phase;
    },

    getCompetitionLevelName(level) {
        const names = {
            loisir: 'Loisir / Découverte',
            regional: 'Régional',
            national: 'National',
            international: 'International / Élite'
        };
        return names[level] || 'Non applicable';
    },

    getQualityFullName(quality) {
        const names = {
            'force-max': 'Force Maximale',
            puissance: 'Puissance',
            explosivite: 'Explosivité / Détente',
            vitesse: 'Vitesse / Vivacité',
            'endurance-aerobie': 'Endurance Aérobie',
            'endurance-anaerobie': 'Endurance Anaérobie',
            'force-endurance': 'Force-Endurance',
            hypertrophie: 'Hypertrophie',
            mobilite: 'Mobilité / Souplesse'
        };
        return names[quality] || quality;
    },

    getEquipmentDescription(equipment) {
        const desc = {
            'full-gym': "Salle complète (référence L'Askali)",
            'basic-gym': 'Salle basique (barres, haltères, bancs)',
            minimal: 'Minimaliste (haltères, bandes, poids du corps)',
            bodyweight: 'Poids du corps uniquement',
            'home-custom': 'Domicile avec matériel personnalisé'
        };
        return desc[equipment] || equipment;
    },

    getTrainingLocationName(location) {
        const names = {
            gym: 'Salle de sport',
            home: 'Domicile',
            outdoor: 'Extérieur',
            mixed: 'Mixte'
        };
        return names[location] || location;
    },

    getLevelDescription(level) {
        const desc = {
            beginner: 'Débutant (< 1 an)',
            intermediate: 'Intermédiaire (1-3 ans)',
            advanced: 'Avancé (3-5 ans)',
            elite: 'Élite (> 5 ans, niveau national+)'
        };
        return desc[level] || level;
    },

    getRecoveryCapacityDesc(capacity) {
        const desc = {
            slow: 'Lente (courbatures 48-72h)',
            normal: 'Normale (24-48h)',
            fast: 'Rapide (12-24h)',
            excellent: 'Excellente (< 12h)'
        };
        return desc[capacity] || capacity;
    },

    getSleepQualityDesc(quality) {
        const desc = {
            poor: 'Mauvaise',
            average: 'Moyenne',
            good: 'Bonne',
            excellent: 'Excellente'
        };
        return desc[quality] || quality;
    },

    getNapsDesc(naps) {
        const desc = {
            no: 'Non',
            occasional: 'Occasionnelles',
            regular: 'Régulières',
            daily: 'Quotidiennes'
        };
        return desc[naps] || 'Non';
    },

    getPhysicalJobDesc(job) {
        const desc = {
            no: 'Non (bureau)',
            light: 'Léger',
            moderate: 'Modéré',
            heavy: 'Intense'
        };
        return desc[job] || 'Non';
    },

    getHydrationDesc(hydration) {
        const desc = {
            low: '< 1L',
            medium: '1-2L',
            good: '2-3L',
            high: '3L+'
        };
        return desc[hydration] || hydration;
    },

    getAlcoholDesc(alcohol) {
        const desc = {
            never: 'Jamais',
            rare: 'Rare',
            moderate: 'Modérée',
            regular: 'Régulière'
        };
        return desc[alcohol] || 'Jamais';
    },

    formatAvoidExercises(formData) {
        // Récupérer tous les avoid_exercise_name_X
        const avoidList = [];
        for (let key in formData) {
            if (key.startsWith('avoid_exercise_name_')) {
                const index = key.split('_').pop();
                const name = formData[key];
                const reason = formData[`avoid_exercise_reason_${index}`] || '';
                if (name) {
                    avoidList.push(`- ${name}${reason ? ` (${reason})` : ''}`);
                }
            }
        }
        return avoidList.length > 0 ? avoidList.join('\n') : 'Aucun exercice à éviter';
    },

    getPeriodizationDescription(type) {
        const desc = {
            linear: 'Linéaire (progression continue charge)',
            dup: 'Ondulatoire Journalière (DUP - variation intensité chaque séance)',
            wup: 'Ondulatoire Hebdomadaire (WUP - variation intensité chaque semaine)',
            block: 'Par Blocs (accumulation → intensification)',
            conjugate: 'Conjuguée (Westside - max effort + dynamic effort)',
            autoregulated: 'Auto-Régulée (ajustement selon état de forme)'
        };
        return desc[type] || type;
    },

    getTestTypes(formData) {
        const types = [];
        if (formData.test_1rm) {
            types.push('1RM');
        }
        if (formData.test_vma) {
            types.push('VMA');
        }
        if (formData.test_ftp) {
            types.push('FTP');
        }
        if (formData.test_bodycomp) {
            types.push('Composition corporelle');
        }
        if (formData.test_mobility) {
            types.push('Mobilité');
        }
        return types.length > 0 ? types.join(', ') : 'Aucun test planifié';
    },

    getDeloadTypeDesc(type) {
        const desc = {
            volume: 'Volume réduit 40%',
            intensity: 'Intensité réduite',
            complete: 'Récupération complète',
            active: 'Récupération active'
        };
        return desc[type] || 'Volume réduit 40%';
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIProgramPromptBuilder;
} else {
    window.AIProgramPromptBuilder = AIProgramPromptBuilder;
}
