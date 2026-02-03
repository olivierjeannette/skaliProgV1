/**
 * TEMPLATES DE STRUCTURE POUR CHAQUE TYPE DE SÉANCE LA SKÀLI
 * Chaque type a sa propre structure et méthodologie spécifique
 */

const LaSkaliSessionTemplates = {
    /**
     * HYROX - Entraînement spécifique HYROX
     */
    hyrox: {
        structure: [
            {
                name: 'ÉCHAUFFEMENT',
                duration: 8,
                description: 'Échauffement cardio + mobilité articulaire',
                example:
                    '400m Row facile\n2 Rounds:\n- 10 Air Squats\n- 10 Push-ups\n- 8 Burpees\n- 100m Run'
            },
            {
                name: 'TECHNIQUE STATIONS',
                duration: 12,
                description: 'Travail technique sur les stations HYROX',
                example:
                    '2 Rounds:\n- 250m SkiErg (technique)\n- 2x25m Sled Push (charge légère)\n- 5 Burpee Broad Jumps\n- 12 Wall Balls'
            },
            {
                name: 'BLOC PRINCIPAL',
                duration: 30,
                description: 'Simulation partielle ou complète HYROX',
                example:
                    '3-4 Rounds For Time:\n- 800m Run\n- 800m Row\n- 50m Sled Push (90kg/70kg)\n- 50m Sled Pull (90kg/70kg)\nTime cap: 30 minutes'
            }
        ],
        notes: "Focus sur les transitions rapides et la gestion de l'effort. Durée totale: 50min"
    },

    /**
     * HYROX LONG - Format compétition
     */
    hyrox_long: {
        structure: [
            {
                name: 'ÉCHAUFFEMENT',
                duration: 15,
                description: 'Échauffement progressif complet',
                example:
                    '1km Run easy\n500m Row\n3 Rounds:\n- Mobilité complète\n- Activation musculaire'
            },
            {
                name: 'HYROX SIMULATION',
                duration: 75,
                description: 'Simulation complète ou half HYROX',
                example:
                    'HYROX COMPLETE:\n8x (1km Run + Station)\nStations:\n1. 1000m SkiErg\n2. 50m Sled Push\n3. 50m Sled Pull\n4. 80m Burpee Broad Jump\n5. 1000m Row\n6. 200m Farmers Carry\n7. 100m Sandbag Lunges\n8. 100 Wall Balls'
            }
        ],
        notes: 'Séance longue durée, gestion nutrition et hydratation importante'
    },

    /**
     * GYM SKILLS - Gymnastique pure
     */
    gym_skills: {
        structure: [
            {
                name: 'ÉCHAUFFEMENT SPÉCIFIQUE',
                duration: 10,
                description: 'Mobilité épaules, poignets, hanches',
                example:
                    '2 Rounds:\n- 8 Scapula Pull-ups\n- 8 Ring Rows\n- 10 Hollow Rocks\n- 10 Arch Rocks\n- 20s Handstand Hold (au mur)'
            },
            {
                name: 'SKILL WORK',
                duration: 30,
                description: 'Travail technique progressif',
                example:
                    'EMOM 16 minutes (alternance):\nMin 1: 3-5 Strict Pull-ups\nMin 2: 5-8 Ring Dips\nMin 3: 3-5 Toes to Bar\nMin 4: 15s Handstand Hold\n\nProgressions:\n- Muscle-Up (4x3 tentatives)\n- Pistol Squats (3x5 chaque jambe)'
            },
            {
                name: 'RENFORCEMENT',
                duration: 10,
                description: 'Accessoires bodyweight',
                example:
                    '2-3 Rounds:\n- 15 Hollow Rocks\n- 15 Superman\n- 20s L-Sit Hold\n- 8 Skin the Cat (slow)'
            }
        ],
        notes: 'Qualité > Quantité, focus technique avant tout. Durée totale: 50min'
    },

    /**
     * BARBELLS CLUB - Force maximale & Haltérophilie
     */
    barbell_club: {
        structure: [
            {
                name: 'ÉCHAUFFEMENT',
                duration: 8,
                description: 'Cardio léger + mobilité articulaire',
                example:
                    '3min Bike facile\nMobilité:\n- Chevilles\n- Hanches\n- Thoracique\n- Épaules\n\nActivation:\n- Good Mornings x8\n- Goblet Squats x8'
            },
            {
                name: 'MONTÉE EN CHARGE',
                duration: 12,
                description: 'Progression technique',
                example: 'Back Squat:\n- Barre vide x8\n- 40% x6\n- 60% x5\n- 70% x3\n- 80% x2'
            },
            {
                name: 'TRAVAIL PRINCIPAL',
                duration: 22,
                description: 'Force maximale ou haltérophilie',
                example:
                    'Back Squat:\n5-5-5-5 @ 80-85% 1RM\nRepos: 3 minutes\n\nOU\n\nPower Clean:\n3-3-3-3 @ 75-80% 1RM\nRepos: 2-3 minutes'
            },
            {
                name: 'ACCESSOIRES',
                duration: 8,
                description: 'Renforcement spécifique',
                example:
                    '2 Rounds:\n- 10 Romanian Deadlifts\n- 12 Barbell Rows\n- 15 Back Extensions\nRepos: 90s entre rounds'
            }
        ],
        notes: 'Respect strict des repos, focus technique parfaite. Durée totale: 50min'
    },

    /**
     * TACTICAL - Cardio fonctionnel militaire
     */
    tactical: {
        structure: [
            {
                name: 'ÉCHAUFFEMENT',
                duration: 8,
                description: 'Cardio progressif',
                example:
                    '400m Run\n2 Rounds:\n- 8 Air Squats\n- 8 Push-ups\n- 8 Sit-ups\n- 10 Jumping Jacks'
            },
            {
                name: 'METCON PRINCIPAL',
                duration: 34,
                description: 'Circuit haute intensité',
                example:
                    'AMRAP 18 minutes:\n- 400m Run\n- 15 Kettlebell Swings (24/16kg)\n- 12 Box Jump Overs (24"/20")\n- 50m Farmers Walk (2x24kg/16kg)\n- 15 Burpees\n\nOU\n\nFor Time:\n80 Wall Balls (9kg/6kg)\n60 Calorie Row\n50m Sled Push (50m segments)\n30 Sandbag Cleans\n15 Rope Climbs\nTime cap: 25 minutes'
            },
            {
                name: 'FINISHER',
                duration: 8,
                description: 'Finisher mental',
                example:
                    "Death by Burpees:\nMin 1: 1 Burpee\nMin 2: 2 Burpees\nMin 3: 3 Burpees\n... jusqu'à échec (7-8 min max)"
            }
        ],
        notes: "Intensité maximale, mental d'acier requis. Durée totale: 50min"
    },

    /**
     * BUILD - Musculation hypertrophie
     */
    build: {
        structure: [
            {
                name: 'ÉCHAUFFEMENT',
                duration: 8,
                description: 'Cardio léger + activation',
                example:
                    '3-5min Bike ou Tapis facile\n\nActivation groupe ciblé:\nSi JAMBES:\n- 12 Goblet Squats\n- 12 Leg Swings\n- 8 Glute Bridges\n\nSi HAUT DU CORPS:\n- 12 Band Pull-Aparts\n- 8 Push-ups\n- 8 Scapula Pull-ups'
            },
            {
                name: 'EXERCICE PRINCIPAL',
                duration: 18,
                description: 'Mouvement composé lourd',
                example:
                    'JAMBES:\nBack Squat ou Front Squat\n4x8-10 @ 70-75% 1RM\nRepos: 2min\n\nPECTORAUX:\nBarbell Bench Press\n4x8-10 @ 70-75% 1RM\nRepos: 2min\n\nDOS:\nDeadlift ou Barbell Rows\n4x8-10 @ 70-75% 1RM\nRepos: 2min'
            },
            {
                name: 'EXERCICES COMPLÉMENTAIRES',
                duration: 24,
                description: 'Hypertrophie ciblée',
                example:
                    'JAMBES:\nA. Bulgarian Split Squats 3x12 chaque jambe\nB. Leg Press 3x15\nC. Leg Curls 3x12\nRepos: 60s\n\nPECTORAUX/TRICEPS:\nA. Incline DB Press 3x10-12\nB. Cable Flyes 3x15\nC. Dips 3x10-12\nRepos: 60s\n\nDOS/BICEPS:\nA. Pull-ups 3x8-10\nB. DB Rows 3x12 chaque bras\nC. Barbell Curls 3x10\nRepos: 60s'
            }
        ],
        notes: 'Tempo contrôlé (3-0-1-0), connexion esprit-muscle, volume élevé. Durée totale: 50min',
        splits: {
            '4_jours': ['Chest/Triceps', 'Back/Biceps', 'Shoulders', 'Legs'],
            '5_jours': ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms'],
            '6_jours': ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs']
        }
    },

    /**
     * POWER - Explosivité et puissance
     */
    power: {
        structure: [
            {
                name: 'ÉCHAUFFEMENT DYNAMIQUE',
                duration: 10,
                description: 'Activation système nerveux',
                example:
                    '3min Bike progressif\n\nDynamic Warm-up:\n- High Knees x15m\n- Butt Kicks x15m\n- A-Skips x15m\n- B-Skips x15m\n- Lateral Shuffles x15m\n\nActivation:\n- 2x5 Box Jumps (hauteur basse)\n- 2x5 Med Ball Slams (léger)'
            },
            {
                name: 'POWER PRINCIPAL',
                duration: 25,
                description: 'Travail explosivité maximale',
                example:
                    'BLOC 1: Olympic Lifts\nPower Clean\n4x3 @ 75-80% 1RM\nRepos: 2-3min (focus qualité)\n\nBLOC 2: Pliométrie\n3 Rounds:\n- 5 Box Jumps (30"+)\n- 5 Broad Jumps\n- 8 Kettlebell Swings (lourd)\nRepos: 90s\n\nBLOC 3: Sprint\n4x40m Sprint\nRepos: 90s (marche retour)'
            },
            {
                name: 'CONDITIONING',
                duration: 15,
                description: 'Tolérance lactique',
                example:
                    'EMOM 12 minutes:\nMin 1: 10 Thrusters (43kg/30kg)\nMin 2: 12 Calorie Assault Bike (max effort)\nMin 3: 10 Burpees over bar\n\nOU\n\n2-3 Rounds For Time:\n- 21 Wall Balls (9kg/6kg)\n- 15 Power Cleans (60kg/40kg)\n- 9 Box Jump Overs (24")\nTime cap: 15 min'
            }
        ],
        notes: 'Repos COMPLETS impératifs, qualité > quantité, CNS recovery important. Durée totale: 50min'
    },

    /**
     * SPÉ RUN & BIKE - Spécialisation course et vélo
     */
    spe_run_bike: {
        structure: [
            {
                name: 'ÉCHAUFFEMENT',
                duration: 10,
                description: 'Échauffement progressif cardio',
                example:
                    'OUTDOOR:\n1km Run facile\nMobilité dynamique:\n- Leg Swings\n- Hip Circles\n- Ankle Mobility\n\nINDOOR:\n5min Bike/Treadmill facile\nMobilité dynamique:\n- Leg Swings\n- Hip Circles\n- Ankle Mobility'
            },
            {
                name: 'BLOC PRINCIPAL',
                duration: 35,
                description: 'Intervalles Run & Bike',
                example:
                    'OUTDOOR:\n5 Rounds:\n- 800m Run @ 85% effort\n- 2min Bike @ seuil\n- 90s repos actif\n\nINDOOR:\n6 Rounds:\n- 400m Treadmill @ tempo\n- 30 Cal Assault Bike\n- 15 Cal Row\n- 60s repos\n\nOU\n\nEMOM 20:\nMin 1: 200m Run (treadmill si indoor)\nMin 2: 15 Cal Bike Erg\nMin 3: 12 Cal SkiErg\nMin 4: Repos actif'
            },
            {
                name: 'FINISHER OPTIONNEL',
                duration: 5,
                description: 'Finisher léger',
                example:
                    '2-3 Rounds:\n- 20 Air Squats\n- 15 Glute Bridges\n- 10 Calf Raises\n\nÉtirements: 3-5min'
            }
        ],
        notes: 'Adapter outdoor/indoor selon météo. Focus gestion zones cardio et technique. Durée totale: 50min'
    },

    /**
     * Obtenir le template pour un type de séance
     * @param sessionType
     */
    getTemplate(sessionType) {
        return this[sessionType] || null;
    },

    /**
     * Obtenir tous les templates
     */
    getAllTemplates() {
        return {
            hyrox: this.hyrox,
            hyrox_long: this.hyrox_long,
            gym_skills: this.gym_skills,
            barbell_club: this.barbell_club,
            tactical: this.tactical,
            build: this.build,
            power: this.power,
            spe_run_bike: this.spe_run_bike
        };
    },

    /**
     * Générer un exemple de séance basé sur le template
     * @param sessionType
     */
    generateExample(sessionType) {
        const template = this.getTemplate(sessionType);
        if (!template) {
            return null;
        }

        return {
            title: `${sessionType.toUpperCase()} EXEMPLE`,
            blocks: template.structure.map(block => ({
                name: block.name,
                content: `${block.description}\n\nDurée: ${block.duration} minutes\n\n${block.example}`
            })),
            notes: template.notes
        };
    }
};

// Export global
window.LaSkaliSessionTemplates = LaSkaliSessionTemplates;

console.log('✅ La Skàli Session Templates chargé');
