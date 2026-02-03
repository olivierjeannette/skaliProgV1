/**
 * CONFIGURATION MATÉRIEL ET ESPACE DE LA SKÀLI
 * À mettre à jour si tu changes de matériel ou d'espace
 */

const SkaliEquipment = {
    /**
     * CAPACITÉ MAXIMALE
     */
    capacity: {
        standard: 12, // Max personnes par séance classique
        hyroxLong: 16, // Max pour HYROX Long (peuvent tourner)
        note: '12 personnes max sauf HYROX Long qui peut accueillir plus'
    },

    /**
     * MATÉRIEL CARDIO
     */
    cardio: {
        rameurs: {
            quantity: 4,
            model: 'Concept2',
            note: 'Tout le monde peut ramer en même temps'
        },
        assaultBikes: {
            quantity: 4,
            model: 'Assault Bike',
            note: 'Tout le monde peut biker en même temps'
        },
        skiErg: {
            quantity: 3,
            model: 'Concept2 SkiErg',
            note: 'Tout le monde peut skier en même temps'
        },
        sleds: {
            quantity: 4,
            note: 'Si plus de 8 personnes, rotation ou EMOM',
            poids: 'Modulable avec plaques'
        },
        cordesASauter: {
            quantity: 'Illimité',
            note: 'Pas de limite'
        }
    },

    /**
     * MATÉRIEL FORCE & HALTÉROPHILIE
     */
    force: {
        barresOlympiques: {
            quantity: 12,
            note: 'Tout le monde peut avoir une barre'
        },
        bumperPlates: {
            quantity: '12 sets complets',
            disponible: '25kg, 20kg, 15kg, 10kg, 5kg, 2.5kg, 1.25kg (paires)',
            note: 'Assez pour 12 barres chargées'
        },
        kettlebells: {
            quantity: '4 de chaque poids',
            poids: '8kg, 12kg, 16kg, 20kg, 24kg',
            note: '4 personnes peuvent avoir le même poids'
        },
        dumbbells: {
            quantity: '2 à 4 paires de chaque',
            poids: '10kg à 45kg par paliers de 2.5kg',
            note: '4 à 6 personnes peuvent avoir le même poids'
        },
        sandbags: {
            quantity: 'Environ 12 de 10/20kg, heavy bag de 30 à 115kg',
            poids: '10kg, 20kg, 30kg, 40kg, 60kg, 90kg, 115kg',
            note: 'Rotation si besoin'
        }
    },

    /**
     * MATÉRIEL GYMNASTIQUE
     */
    gymnastique: {
        pullUpBars: {
            quantity: 12,
            note: 'Tout le monde peut faire pull-ups en même temps'
        },
        rings: {
            quantity: 5,
            note: 'Tout le monde peut utiliser les rings'
        },
        boxJumps: {
            quantity: 12,
            hauteurs: '50cm", 60cm", 75cm"',
            note: 'Tout le monde peut jumper en même temps'
        },
        cordesGrimpee: {
            quantity: 3,
            note: '3 personnes max en même temps, rotation nécessaire'
        },
        wallBalls: {
            quantity: 20,
            poids: '4kg, 6kg, 9kg, 12kg disponibles',
            note: 'Tout le monde peut avoir une wall ball'
        }
    },

    /**
     * DISTANCES EXTÉRIEUR (beau temps)
     */
    distancesExterieur: {
        run: {
            boucleCourte: '600m (tour parking)',
            boucleMoyenne: '800m (tour complet)',
            boucleLongue: '1200m (aller-retour rue)',
            note: 'Utilisable si beau temps uniquement',
            alternatives: 'Si pluie/froid → Rameur, Bike, SkiErg'
        },
        farmersCarry: {
            distance: '60m (parking)',
            note: 'Si beau temps, sinon inside 20m A/R'
        }
    },

    /**
     * DISTANCES INTÉRIEUR (hiver, pluie, froid)
     */
    distancesInterieur: {
        run: {
            available: false,
            alternative: 'Rameur, Assault Bike ou SkiErg à la place',
            note: 'PAS de run inside, toujours remplacer par cardio machines'
        },
        farmersCarry: {
            distance: '20m aller-retour max (longueur salle)',
            note: 'Distance limitée mais faisable'
        },
        sledPush: {
            distance: '20m aller-retour (longueur salle)',
            note: 'Possible inside, distance courte'
        },
        burpeeBroadJump: {
            distance: '20m aller-retour',
            note: 'Faisable inside avec espace'
        },
        lunges: {
            distance: '20m aller-retour',
            note: 'Faisable inside (walking lunges, sandbag lunges)'
        }
    },

    /**
     * RÈGLES D'UTILISATION POUR L'IA
     */
    aiRules: {
        capacite: 'JAMAIS dépasser 12 personnes durant la séance (sauf HYROX Long)',

        rotations: [
            'Si plus de 12 personnes sur un exo → Faire rotation ou EMOM',
            'Cordes grimper max 3 → Rotation obligatoire',
            'Sleds max 4 → Si 12 personnes, faire EMOM ou groupes'
        ],

        distances: [
            'Run extérieur: 600m, 800m, 1200m (SI BEAU TEMPS)',
            'Run intérieur: IMPOSSIBLE → Remplacer par Row/Bike/Ski',
            'Farmers inside: 20m A/R',
            'Sled inside: 20m A/R',
            'Lunges inside: 20m A/R'
        ],

        meteo: [
            'Si hiver/pluie/froid → PAS de run extérieur',
            'Alternative run → Row, Bike ou SkiErg (même calories ou distance)',
            'Exemple: 600m run → 600m row ou 35 cal bike'
        ],

        materielsLimites: [
            'Cordes grimper: 3 → EMOM ou rotation',
            'Sleds: 4 → Si 12 personnes, EMOM ou alternance'
        ],

        conversions: [
            '600m run = 600m row = 35 cal assault bike = 600m ski erg',
            '800m run = 80m row = 50 cal bike = 800m ski',
            '1200m run = 1200m row = 70 cal bike = 1200m ski'
        ]
    },

    /**
     * Obtenir le matériel disponible pour un nombre de personnes
     * @param nbPersonnes
     */
    getMaterialAvailability(nbPersonnes = 12) {
        const result = {
            canDoSimultaneous: [],
            needRotation: [],
            alternatives: []
        };

        // Peut faire en simultané
        if (nbPersonnes <= 12) {
            result.canDoSimultaneous = [
                'Rameur',
                'Assault Bike',
                'SkiErg',
                'Barres',
                'Kettlebells',
                'Dumbbells',
                'Pull-ups',
                'Rings',
                'Box Jumps',
                'Wall Balls',
                'Tapis'
            ];
        }

        // Nécessite rotation
        if (nbPersonnes > 8) {
            result.needRotation.push('Sleds (8 max) → EMOM ou rotation');
        }
        if (nbPersonnes > 4) {
            result.needRotation.push('Cordes grimper (3 max) → EMOM ou rotation');
        }

        return result;
    },

    /**
     * Obtenir les distances selon météo
     * @param indoor
     */
    getDistances(indoor = false) {
        if (indoor) {
            return {
                run: 'IMPOSSIBLE → Utiliser Row/Bike/Ski',
                farmers: '20m A/R ',
                sled: '20m A/R',
                lunges: '20m A/R',
                burpeeBroadJump: '20m A/R'
            };
        } else {
            return {
                run: '600m, 800m, 1200m (rue)',
                farmers: '60m (parking)',
                sled: '20m possible (intérieur)',
                lunges: 'Distances libres',
                burpeeBroadJump: '80m possible (HYROX standard)'
            };
        }
    }
};

// Export global
if (typeof window !== 'undefined') {
    window.SkaliEquipment = SkaliEquipment;
}

console.log('✅ Skali Equipment Config chargée');
