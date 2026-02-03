/**
 * NUTRITION DATABASE - Base de données alimentaire complète
 * Aliments avec macros, micros, IG, allergènes, qualité nutritionnelle
 */

const NutritionDatabase = {
    /**
     * Catégories d'aliments
     */
    CATEGORIES: {
        PROTEINS: 'Protéines',
        CARBS: 'Glucides',
        FATS: 'Lipides',
        VEGETABLES: 'Légumes',
        FRUITS: 'Fruits',
        DAIRY: 'Produits laitiers',
        NUTS_SEEDS: 'Noix & Graines',
        SUPPLEMENTS: 'Compléments',
        BEVERAGES: 'Boissons'
    },

    /**
     * Index glycémique
     */
    GI_LEVELS: {
        LOW: { max: 55, label: 'Bas', color: '#10b981' },
        MEDIUM: { max: 70, label: 'Moyen', color: '#f59e0b' },
        HIGH: { max: 100, label: 'Élevé', color: '#ef4444' }
    },

    /**
     * Base de données complète des aliments
     * Structure: { name, category, per100g: {macros, micros}, gi, allergens, quality }
     */
    FOODS: {
        // ==================== PROTÉINES ANIMALES ====================
        'poulet_blanc': {
            name: 'Poulet (blanc, sans peau)',
            category: 'PROTEINS',
            per100g: {
                calories: 165,
                protein: 31,
                carbs: 0,
                fats: 3.6,
                fiber: 0,
                // Micronutriments (en mg sauf précision)
                vitaminB3: 13.7,
                vitaminB6: 0.6,
                selenium: 27.6, // µg
                phosphorus: 220,
                zinc: 1.0,
                iron: 0.9
            },
            gi: 0, // Pas de glucides
            allergens: [],
            quality: 95, // Score qualité nutritionnelle 0-100
            cost: 'medium', // low, medium, high
            sustainability: 'medium',
            prepTime: 'medium' // quick, medium, long
        },

        'boeuf_maigre': {
            name: 'Bœuf maigre (5% MG)',
            category: 'PROTEINS',
            per100g: {
                calories: 155,
                protein: 26,
                carbs: 0,
                fats: 5,
                fiber: 0,
                vitaminB12: 2.6, // µg
                vitaminB6: 0.5,
                iron: 2.6,
                zinc: 4.8,
                selenium: 14.2, // µg
                phosphorus: 175
            },
            gi: 0,
            allergens: [],
            quality: 90,
            cost: 'high',
            sustainability: 'low',
            prepTime: 'medium'
        },

        'saumon': {
            name: 'Saumon (atlantique)',
            category: 'PROTEINS',
            per100g: {
                calories: 208,
                protein: 20,
                carbs: 0,
                fats: 13,
                fiber: 0,
                omega3: 2.3, // g
                vitaminD: 11, // µg
                vitaminB12: 3.2, // µg
                selenium: 36.5, // µg
                potassium: 363
            },
            gi: 0,
            allergens: ['Poisson'],
            quality: 98,
            cost: 'high',
            sustainability: 'medium',
            prepTime: 'quick'
        },

        'thon_naturel': {
            name: 'Thon (au naturel, boîte)',
            category: 'PROTEINS',
            per100g: {
                calories: 116,
                protein: 26,
                carbs: 0,
                fats: 1,
                fiber: 0,
                selenium: 108, // µg
                vitaminB12: 2.5, // µg
                vitaminB3: 18.8,
                omega3: 0.3
            },
            gi: 0,
            allergens: ['Poisson'],
            quality: 85,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'oeufs_entiers': {
            name: 'Œufs entiers',
            category: 'PROTEINS',
            per100g: {
                calories: 143,
                protein: 13,
                carbs: 0.7,
                fats: 9.5,
                fiber: 0,
                vitaminA: 540, // µg
                vitaminD: 2, // µg
                vitaminB12: 1.3, // µg
                choline: 294, // Important pour le cerveau
                selenium: 30.8 // µg
            },
            gi: 0,
            allergens: ['Œufs'],
            quality: 100, // Protéine de référence
            cost: 'low',
            sustainability: 'high',
            prepTime: 'quick'
        },

        'blancs_oeufs': {
            name: 'Blancs d\'œufs',
            category: 'PROTEINS',
            per100g: {
                calories: 52,
                protein: 11,
                carbs: 0.7,
                fats: 0.2,
                fiber: 0,
                selenium: 20, // µg
                potassium: 163
            },
            gi: 0,
            allergens: ['Œufs'],
            quality: 95,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'quick'
        },

        'dinde': {
            name: 'Dinde (escalope)',
            category: 'PROTEINS',
            per100g: {
                calories: 135,
                protein: 30,
                carbs: 0,
                fats: 1,
                fiber: 0,
                vitaminB3: 12.3,
                vitaminB6: 0.8,
                selenium: 32, // µg
                zinc: 2.0
            },
            gi: 0,
            allergens: [],
            quality: 95,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'quick'
        },

        // ==================== PROTÉINES VÉGÉTALES ====================
        'lentilles': {
            name: 'Lentilles (cuites)',
            category: 'PROTEINS',
            per100g: {
                calories: 116,
                protein: 9,
                carbs: 20,
                fats: 0.4,
                fiber: 8,
                iron: 3.3,
                folate: 181, // µg
                magnesium: 36,
                phosphorus: 180,
                potassium: 369
            },
            gi: 30, // Très bas
            allergens: [],
            quality: 92,
            cost: 'low',
            sustainability: 'very_high',
            prepTime: 'medium'
        },

        'pois_chiches': {
            name: 'Pois chiches (cuits)',
            category: 'PROTEINS',
            per100g: {
                calories: 164,
                protein: 9,
                carbs: 27,
                fats: 2.6,
                fiber: 7.6,
                iron: 2.9,
                magnesium: 48,
                folate: 172, // µg
                phosphorus: 168
            },
            gi: 35,
            allergens: [],
            quality: 90,
            cost: 'low',
            sustainability: 'very_high',
            prepTime: 'long'
        },

        'tofu_ferme': {
            name: 'Tofu ferme',
            category: 'PROTEINS',
            per100g: {
                calories: 144,
                protein: 17.3,
                carbs: 2.8,
                fats: 8.7,
                fiber: 2.3,
                calcium: 350,
                iron: 2.7,
                magnesium: 58,
                isoflavones: 25 // mg (phytoestrogènes)
            },
            gi: 15,
            allergens: ['Soja'],
            quality: 85,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'quick'
        },

        'tempeh': {
            name: 'Tempeh',
            category: 'PROTEINS',
            per100g: {
                calories: 193,
                protein: 20,
                carbs: 9,
                fats: 11,
                fiber: 9,
                calcium: 111,
                iron: 2.7,
                magnesium: 81,
                probiotics: true // Fermenté
            },
            gi: 15,
            allergens: ['Soja'],
            quality: 90,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'medium'
        },

        // ==================== GLUCIDES COMPLEXES ====================
        'riz_complet': {
            name: 'Riz complet (cuit)',
            category: 'CARBS',
            per100g: {
                calories: 123,
                protein: 2.7,
                carbs: 25.6,
                fats: 1,
                fiber: 1.8,
                magnesium: 44,
                phosphorus: 83,
                selenium: 9.8, // µg
                vitaminB3: 2.6
            },
            gi: 50,
            allergens: [],
            quality: 85,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'medium'
        },

        'riz_basmati': {
            name: 'Riz basmati (cuit)',
            category: 'CARBS',
            per100g: {
                calories: 121,
                protein: 3.5,
                carbs: 25,
                fats: 0.4,
                fiber: 0.6,
                magnesium: 19,
                phosphorus: 50
            },
            gi: 58, // Meilleur que riz blanc classique
            allergens: [],
            quality: 75,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'quick'
        },

        'patate_douce': {
            name: 'Patate douce (cuite)',
            category: 'CARBS',
            per100g: {
                calories: 90,
                protein: 2,
                carbs: 21,
                fats: 0.2,
                fiber: 3.3,
                vitaminA: 19218, // µg (énorme !)
                vitaminC: 19.6,
                potassium: 475,
                manganese: 0.5
            },
            gi: 70, // Modéré-élevé mais haute densité nutritionnelle
            allergens: [],
            quality: 95,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'medium'
        },

        'quinoa': {
            name: 'Quinoa (cuit)',
            category: 'CARBS',
            per100g: {
                calories: 120,
                protein: 4.4,
                carbs: 21,
                fats: 1.9,
                fiber: 2.8,
                iron: 1.5,
                magnesium: 64,
                phosphorus: 152,
                manganese: 0.6,
                complete_protein: true // Protéine complète (rare pour céréale)
            },
            gi: 53,
            allergens: [],
            quality: 92,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'quick'
        },

        'flocons_avoine': {
            name: 'Flocons d\'avoine',
            category: 'CARBS',
            per100g: {
                calories: 389,
                protein: 16.9,
                carbs: 66.3,
                fats: 6.9,
                fiber: 10.6,
                magnesium: 177,
                phosphorus: 523,
                iron: 4.7,
                zinc: 4,
                beta_glucan: 4 // Fibres solubles bénéfiques
            },
            gi: 55,
            allergens: ['Gluten possible'], // Contamination croisée
            quality: 95,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'quick'
        },

        'pain_complet': {
            name: 'Pain complet',
            category: 'CARBS',
            per100g: {
                calories: 247,
                protein: 9,
                carbs: 46,
                fats: 3,
                fiber: 7,
                magnesium: 75,
                phosphorus: 200,
                vitaminB3: 4.5
            },
            gi: 74,
            allergens: ['Gluten'],
            quality: 70,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        // ==================== LIPIDES ====================
        'huile_olive': {
            name: 'Huile d\'olive (extra-vierge)',
            category: 'FATS',
            per100g: {
                calories: 884,
                protein: 0,
                carbs: 0,
                fats: 100,
                fiber: 0,
                omega9: 73, // Acide oléique
                vitaminE: 14.4,
                vitaminK: 60.2, // µg
                polyphenols: 5 // mg (antioxydants puissants)
            },
            gi: 0,
            allergens: [],
            quality: 100,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'none'
        },

        'avocat': {
            name: 'Avocat',
            category: 'FATS',
            per100g: {
                calories: 160,
                protein: 2,
                carbs: 8.5,
                fats: 14.7,
                fiber: 6.7,
                potassium: 485,
                vitaminK: 21, // µg
                folate: 81, // µg
                vitaminE: 2.1,
                omega9: 9.8
            },
            gi: 15,
            allergens: [],
            quality: 95,
            cost: 'high',
            sustainability: 'low', // Impact environnemental important
            prepTime: 'none'
        },

        'amandes': {
            name: 'Amandes',
            category: 'NUTS_SEEDS',
            per100g: {
                calories: 579,
                protein: 21.2,
                carbs: 21.6,
                fats: 49.9,
                fiber: 12.5,
                vitaminE: 25.6,
                magnesium: 270,
                calcium: 269,
                phosphorus: 481
            },
            gi: 0,
            allergens: ['Fruits à coque'],
            quality: 95,
            cost: 'high',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'beurre_cacahuete': {
            name: 'Beurre de cacahuète (naturel)',
            category: 'NUTS_SEEDS',
            per100g: {
                calories: 588,
                protein: 25,
                carbs: 20,
                fats: 50,
                fiber: 6,
                vitaminE: 8.3,
                magnesium: 168,
                phosphorus: 358,
                vitaminB3: 13.4
            },
            gi: 14,
            allergens: ['Arachides'],
            quality: 80,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        // ==================== LÉGUMES ====================
        'brocoli': {
            name: 'Brocoli (cuit)',
            category: 'VEGETABLES',
            per100g: {
                calories: 35,
                protein: 2.4,
                carbs: 7,
                fats: 0.4,
                fiber: 3.3,
                vitaminC: 64.9,
                vitaminK: 141.1, // µg
                folate: 108, // µg
                potassium: 293,
                sulforaphane: 1.5 // mg (anti-cancer puissant)
            },
            gi: 10,
            allergens: [],
            quality: 100,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'quick'
        },

        'epinards': {
            name: 'Épinards (crus)',
            category: 'VEGETABLES',
            per100g: {
                calories: 23,
                protein: 2.9,
                carbs: 3.6,
                fats: 0.4,
                fiber: 2.2,
                vitaminA: 469, // µg
                vitaminC: 28.1,
                vitaminK: 482.9, // µg
                iron: 2.7,
                magnesium: 79,
                folate: 194 // µg
            },
            gi: 15,
            allergens: [],
            quality: 100,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'courgette': {
            name: 'Courgette',
            category: 'VEGETABLES',
            per100g: {
                calories: 17,
                protein: 1.2,
                carbs: 3.1,
                fats: 0.3,
                fiber: 1,
                vitaminC: 17.9,
                potassium: 261,
                manganese: 0.2
            },
            gi: 15,
            allergens: [],
            quality: 85,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'quick'
        },

        // ==================== FRUITS ====================
        'banane': {
            name: 'Banane',
            category: 'FRUITS',
            per100g: {
                calories: 89,
                protein: 1.1,
                carbs: 23,
                fats: 0.3,
                fiber: 2.6,
                potassium: 358, // Excellent pour crampes
                vitaminB6: 0.4,
                vitaminC: 8.7,
                magnesium: 27
            },
            gi: 62, // Modéré (varie selon maturité)
            allergens: [],
            quality: 85,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'pomme': {
            name: 'Pomme',
            category: 'FRUITS',
            per100g: {
                calories: 52,
                protein: 0.3,
                carbs: 14,
                fats: 0.2,
                fiber: 2.4,
                vitaminC: 4.6,
                potassium: 107,
                quercetin: 4.4 // mg (antioxydant)
            },
            gi: 38,
            allergens: [],
            quality: 90,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'myrtilles': {
            name: 'Myrtilles',
            category: 'FRUITS',
            per100g: {
                calories: 57,
                protein: 0.7,
                carbs: 14.5,
                fats: 0.3,
                fiber: 2.4,
                vitaminC: 9.7,
                vitaminK: 19.3, // µg
                anthocyanins: 163 // mg (antioxydants très puissants)
            },
            gi: 53,
            allergens: [],
            quality: 100,
            cost: 'high',
            sustainability: 'medium',
            prepTime: 'none'
        },

        // ==================== PRODUITS LAITIERS ====================
        'yaourt_grec': {
            name: 'Yaourt grec 0%',
            category: 'DAIRY',
            per100g: {
                calories: 59,
                protein: 10.2,
                carbs: 3.6,
                fats: 0.4,
                fiber: 0,
                calcium: 110,
                phosphorus: 135,
                vitaminB12: 0.8, // µg
                probiotics: true
            },
            gi: 11,
            allergens: ['Lactose'],
            quality: 92,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'fromage_blanc': {
            name: 'Fromage blanc 0%',
            category: 'DAIRY',
            per100g: {
                calories: 52,
                protein: 8,
                carbs: 4.5,
                fats: 0.2,
                fiber: 0,
                calcium: 86,
                phosphorus: 150,
                vitaminB12: 0.5 // µg
            },
            gi: 30,
            allergens: ['Lactose'],
            quality: 90,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        // ==================== COMPLÉMENTS ====================
        'whey_isolate': {
            name: 'Whey isolate',
            category: 'SUPPLEMENTS',
            per100g: {
                calories: 370,
                protein: 90,
                carbs: 2,
                fats: 1,
                fiber: 0,
                bcaa: 24, // g (acides aminés ramifiés)
                leucine: 11 // g (trigger anabolisme)
            },
            gi: 0,
            allergens: ['Lactose (traces)'],
            quality: 95,
            cost: 'medium',
            sustainability: 'low',
            prepTime: 'none'
        },

        'creatine': {
            name: 'Créatine monohydrate',
            category: 'SUPPLEMENTS',
            per100g: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fats: 0,
                fiber: 0,
                creatine: 100 // g
            },
            gi: 0,
            allergens: [],
            quality: 100, // Supplément le plus étudié
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none',
            note: '5g/jour améliore force et masse musculaire'
        },

        // ==================== PROTEINES SUPPLEMENTAIRES ====================
        'cabillaud': {
            name: 'Cabillaud',
            category: 'PROTEINS',
            per100g: {
                calories: 82,
                protein: 18,
                carbs: 0,
                fats: 0.7,
                fiber: 0
            },
            gi: 0,
            allergens: ['Poisson'],
            quality: 92,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'medium'
        },

        'colin': {
            name: 'Colin',
            category: 'PROTEINS',
            per100g: {
                calories: 86,
                protein: 17.9,
                carbs: 0,
                fats: 1.3,
                fiber: 0
            },
            gi: 0,
            allergens: ['Poisson'],
            quality: 90,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'medium'
        },

        'sardines': {
            name: 'Sardines (conserve eau)',
            category: 'PROTEINS',
            per100g: {
                calories: 135,
                protein: 20,
                carbs: 0,
                fats: 5.5,
                fiber: 0,
                omega3: 1.5
            },
            gi: 0,
            allergens: ['Poisson'],
            quality: 88,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'crevettes': {
            name: 'Crevettes',
            category: 'PROTEINS',
            per100g: {
                calories: 99,
                protein: 24,
                carbs: 0,
                fats: 0.3,
                fiber: 0
            },
            gi: 0,
            allergens: ['Crustaces'],
            quality: 85,
            cost: 'high',
            sustainability: 'low',
            prepTime: 'short'
        },

        'porc_filet': {
            name: 'Porc (filet)',
            category: 'PROTEINS',
            per100g: {
                calories: 143,
                protein: 22,
                carbs: 0,
                fats: 5,
                fiber: 0
            },
            gi: 0,
            allergens: [],
            quality: 80,
            cost: 'low',
            sustainability: 'low',
            prepTime: 'medium'
        },

        'agneau_gigot': {
            name: 'Agneau (gigot)',
            category: 'PROTEINS',
            per100g: {
                calories: 240,
                protein: 25,
                carbs: 0,
                fats: 15,
                fiber: 0
            },
            gi: 0,
            allergens: [],
            quality: 75,
            cost: 'high',
            sustainability: 'low',
            prepTime: 'long'
        },

        'tofu_ferme': {
            name: 'Tofu ferme',
            category: 'PROTEINS',
            per100g: {
                calories: 76,
                protein: 8,
                carbs: 1.9,
                fats: 4.8,
                fiber: 0.3
            },
            gi: 15,
            allergens: ['Soja'],
            quality: 82,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'short'
        },

        'tempeh': {
            name: 'Tempeh',
            category: 'PROTEINS',
            per100g: {
                calories: 193,
                protein: 19,
                carbs: 9,
                fats: 11,
                fiber: 9
            },
            gi: 15,
            allergens: ['Soja'],
            quality: 88,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'short'
        },

        'seitan': {
            name: 'Seitan',
            category: 'PROTEINS',
            per100g: {
                calories: 370,
                protein: 75,
                carbs: 14,
                fats: 1.9,
                fiber: 0.6
            },
            gi: 20,
            allergens: ['Gluten'],
            quality: 75,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'none'
        },

        // ==================== GLUCIDES SUPPLEMENTAIRES ====================
        'pates_completes': {
            name: 'Pates completes (cuites)',
            category: 'CARBS',
            per100g: {
                calories: 131,
                protein: 5,
                carbs: 25,
                fats: 1.1,
                fiber: 3.5
            },
            gi: 45,
            allergens: ['Gluten'],
            quality: 85,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'short'
        },

        'pates_blanches': {
            name: 'Pates blanches (cuites)',
            category: 'CARBS',
            per100g: {
                calories: 131,
                protein: 5,
                carbs: 25,
                fats: 0.9,
                fiber: 1.8
            },
            gi: 55,
            allergens: ['Gluten'],
            quality: 70,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'short'
        },

        'pain_complet': {
            name: 'Pain complet',
            category: 'CARBS',
            per100g: {
                calories: 247,
                protein: 9,
                carbs: 48,
                fats: 3.5,
                fiber: 7
            },
            gi: 50,
            allergens: ['Gluten'],
            quality: 78,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'pain_blanc': {
            name: 'Pain blanc',
            category: 'CARBS',
            per100g: {
                calories: 265,
                protein: 8.9,
                carbs: 55,
                fats: 1.2,
                fiber: 2.7
            },
            gi: 70,
            allergens: ['Gluten'],
            quality: 55,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'couscous_complet': {
            name: 'Couscous complet (cuit)',
            category: 'CARBS',
            per100g: {
                calories: 112,
                protein: 3.8,
                carbs: 23,
                fats: 0.2,
                fiber: 2
            },
            gi: 45,
            allergens: ['Gluten'],
            quality: 80,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'short'
        },

        'sarrasin': {
            name: 'Sarrasin (cuit)',
            category: 'CARBS',
            per100g: {
                calories: 92,
                protein: 3.4,
                carbs: 20,
                fats: 0.6,
                fiber: 2.7
            },
            gi: 54,
            allergens: [],
            quality: 88,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'medium'
        },

        'millet': {
            name: 'Millet (cuit)',
            category: 'CARBS',
            per100g: {
                calories: 119,
                protein: 3.5,
                carbs: 23,
                fats: 1,
                fiber: 1.3
            },
            gi: 71,
            allergens: [],
            quality: 75,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'medium'
        },

        'polenta': {
            name: 'Polenta (cuite)',
            category: 'CARBS',
            per100g: {
                calories: 70,
                protein: 1.7,
                carbs: 15,
                fats: 0.3,
                fiber: 0.8
            },
            gi: 68,
            allergens: [],
            quality: 68,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'short'
        },

        'riz_sauvage': {
            name: 'Riz sauvage (cuit)',
            category: 'CARBS',
            per100g: {
                calories: 101,
                protein: 4,
                carbs: 21,
                fats: 0.3,
                fiber: 1.8
            },
            gi: 35,
            allergens: [],
            quality: 90,
            cost: 'high',
            sustainability: 'high',
            prepTime: 'long'
        },

        // ==================== LEGUMES SUPPLEMENTAIRES ====================
        'haricots_verts': {
            name: 'Haricots verts',
            category: 'VEGETABLES',
            per100g: {
                calories: 31,
                protein: 1.8,
                carbs: 7,
                fats: 0.1,
                fiber: 3.4
            },
            gi: 15,
            allergens: [],
            quality: 88,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'short'
        },

        'chou_fleur': {
            name: 'Chou-fleur',
            category: 'VEGETABLES',
            per100g: {
                calories: 25,
                protein: 1.9,
                carbs: 5,
                fats: 0.3,
                fiber: 2
            },
            gi: 15,
            allergens: [],
            quality: 87,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'short'
        },

        'chou_romanesco': {
            name: 'Chou romanesco',
            category: 'VEGETABLES',
            per100g: {
                calories: 25,
                protein: 2,
                carbs: 4.7,
                fats: 0.3,
                fiber: 2.1
            },
            gi: 15,
            allergens: [],
            quality: 90,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'short'
        },

        'poivron_rouge': {
            name: 'Poivron rouge',
            category: 'VEGETABLES',
            per100g: {
                calories: 31,
                protein: 1,
                carbs: 6,
                fats: 0.3,
                fiber: 2.1
            },
            gi: 15,
            allergens: [],
            quality: 90,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'short'
        },

        'aubergine': {
            name: 'Aubergine',
            category: 'VEGETABLES',
            per100g: {
                calories: 25,
                protein: 1,
                carbs: 6,
                fats: 0.2,
                fiber: 3
            },
            gi: 15,
            allergens: [],
            quality: 82,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'medium'
        },

        'champignons': {
            name: 'Champignons de Paris',
            category: 'VEGETABLES',
            per100g: {
                calories: 22,
                protein: 3.1,
                carbs: 3.3,
                fats: 0.3,
                fiber: 1
            },
            gi: 10,
            allergens: [],
            quality: 88,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'short'
        },

        'asperges': {
            name: 'Asperges',
            category: 'VEGETABLES',
            per100g: {
                calories: 20,
                protein: 2.2,
                carbs: 3.9,
                fats: 0.1,
                fiber: 2.1
            },
            gi: 15,
            allergens: [],
            quality: 92,
            cost: 'high',
            sustainability: 'high',
            prepTime: 'medium'
        },

        'celeri': {
            name: 'Celeri branche',
            category: 'VEGETABLES',
            per100g: {
                calories: 16,
                protein: 0.7,
                carbs: 3,
                fats: 0.2,
                fiber: 1.6
            },
            gi: 15,
            allergens: [],
            quality: 85,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'fenouil': {
            name: 'Fenouil',
            category: 'VEGETABLES',
            per100g: {
                calories: 31,
                protein: 1.2,
                carbs: 7.3,
                fats: 0.2,
                fiber: 3.1
            },
            gi: 15,
            allergens: [],
            quality: 88,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'short'
        },

        // ==================== FRUITS SUPPLEMENTAIRES ====================
        'kiwi': {
            name: 'Kiwi',
            category: 'FRUITS',
            per100g: {
                calories: 61,
                protein: 1.1,
                carbs: 15,
                fats: 0.5,
                fiber: 3,
                vitaminC: 93
            },
            gi: 47,
            allergens: [],
            quality: 90,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'ananas': {
            name: 'Ananas',
            category: 'FRUITS',
            per100g: {
                calories: 50,
                protein: 0.5,
                carbs: 13,
                fats: 0.1,
                fiber: 1.4
            },
            gi: 59,
            allergens: [],
            quality: 82,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'short'
        },

        'melon': {
            name: 'Melon',
            category: 'FRUITS',
            per100g: {
                calories: 34,
                protein: 0.8,
                carbs: 8,
                fats: 0.2,
                fiber: 0.9
            },
            gi: 65,
            allergens: [],
            quality: 80,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'short'
        },

        'pasteque': {
            name: 'Pasteque',
            category: 'FRUITS',
            per100g: {
                calories: 30,
                protein: 0.6,
                carbs: 7.6,
                fats: 0.2,
                fiber: 0.4
            },
            gi: 72,
            allergens: [],
            quality: 75,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'short'
        },

        'pamplemousse': {
            name: 'Pamplemousse',
            category: 'FRUITS',
            per100g: {
                calories: 42,
                protein: 0.8,
                carbs: 11,
                fats: 0.1,
                fiber: 1.6
            },
            gi: 25,
            allergens: [],
            quality: 88,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'short'
        },

        'fraises': {
            name: 'Fraises',
            category: 'FRUITS',
            per100g: {
                calories: 33,
                protein: 0.7,
                carbs: 8,
                fats: 0.3,
                fiber: 2
            },
            gi: 40,
            allergens: [],
            quality: 90,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'framboises': {
            name: 'Framboises',
            category: 'FRUITS',
            per100g: {
                calories: 53,
                protein: 1.2,
                carbs: 12,
                fats: 0.7,
                fiber: 6.5
            },
            gi: 25,
            allergens: [],
            quality: 95,
            cost: 'high',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'cerises': {
            name: 'Cerises',
            category: 'FRUITS',
            per100g: {
                calories: 63,
                protein: 1,
                carbs: 16,
                fats: 0.2,
                fiber: 2.1
            },
            gi: 22,
            allergens: [],
            quality: 88,
            cost: 'high',
            sustainability: 'medium',
            prepTime: 'none'
        },

        // ==================== PRODUITS LAITIERS SUPPLEMENTAIRES ====================
        'fromage_blanc_0': {
            name: 'Fromage blanc 0%',
            category: 'DAIRY',
            per100g: {
                calories: 52,
                protein: 8,
                carbs: 4,
                fats: 0.2,
                fiber: 0,
                calcium: 120
            },
            gi: 30,
            allergens: ['Lactose'],
            quality: 90,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'fromage_blanc_20': {
            name: 'Fromage blanc 20%',
            category: 'DAIRY',
            per100g: {
                calories: 102,
                protein: 7.5,
                carbs: 3.5,
                fats: 3,
                fiber: 0,
                calcium: 110
            },
            gi: 30,
            allergens: ['Lactose'],
            quality: 85,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'skyr': {
            name: 'Skyr nature',
            category: 'DAIRY',
            per100g: {
                calories: 63,
                protein: 11,
                carbs: 4,
                fats: 0.2,
                fiber: 0,
                calcium: 150
            },
            gi: 30,
            allergens: ['Lactose'],
            quality: 95,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'lait_ecremer': {
            name: 'Lait ecreme',
            category: 'DAIRY',
            per100g: {
                calories: 34,
                protein: 3.4,
                carbs: 5,
                fats: 0.1,
                fiber: 0,
                calcium: 125
            },
            gi: 32,
            allergens: ['Lactose'],
            quality: 75,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'lait_demi_ecreme': {
            name: 'Lait demi-ecreme',
            category: 'DAIRY',
            per100g: {
                calories: 49,
                protein: 3.2,
                carbs: 4.8,
                fats: 1.6,
                fiber: 0,
                calcium: 120
            },
            gi: 32,
            allergens: ['Lactose'],
            quality: 78,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'parmesan': {
            name: 'Parmesan',
            category: 'DAIRY',
            per100g: {
                calories: 392,
                protein: 36,
                carbs: 3.2,
                fats: 26,
                fiber: 0,
                calcium: 1184
            },
            gi: 0,
            allergens: ['Lactose'],
            quality: 82,
            cost: 'high',
            sustainability: 'low',
            prepTime: 'none'
        },

        'mozzarella': {
            name: 'Mozzarella',
            category: 'DAIRY',
            per100g: {
                calories: 280,
                protein: 18,
                carbs: 3,
                fats: 22,
                fiber: 0,
                calcium: 505
            },
            gi: 0,
            allergens: ['Lactose'],
            quality: 75,
            cost: 'medium',
            sustainability: 'medium',
            prepTime: 'none'
        },

        // ==================== NOIX ET GRAINES SUPPLEMENTAIRES ====================
        'noix_cajou': {
            name: 'Noix de cajou',
            category: 'NUTS_SEEDS',
            per100g: {
                calories: 553,
                protein: 18,
                carbs: 30,
                fats: 44,
                fiber: 3.3
            },
            gi: 25,
            allergens: ['Fruits à coque'],
            quality: 85,
            cost: 'high',
            sustainability: 'low',
            prepTime: 'none'
        },

        'noix_pecan': {
            name: 'Noix de pecan',
            category: 'NUTS_SEEDS',
            per100g: {
                calories: 691,
                protein: 9,
                carbs: 14,
                fats: 72,
                fiber: 9.6
            },
            gi: 10,
            allergens: ['Fruits à coque'],
            quality: 88,
            cost: 'high',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'graines_lin': {
            name: 'Graines de lin',
            category: 'NUTS_SEEDS',
            per100g: {
                calories: 534,
                protein: 18,
                carbs: 29,
                fats: 42,
                fiber: 27,
                omega3: 23
            },
            gi: 35,
            allergens: [],
            quality: 95,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'graines_sesame': {
            name: 'Graines de sesame',
            category: 'NUTS_SEEDS',
            per100g: {
                calories: 573,
                protein: 18,
                carbs: 23,
                fats: 50,
                fiber: 12,
                calcium: 975
            },
            gi: 35,
            allergens: ['Sesame'],
            quality: 90,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'graines_tournesol': {
            name: 'Graines de tournesol',
            category: 'NUTS_SEEDS',
            per100g: {
                calories: 584,
                protein: 21,
                carbs: 20,
                fats: 51,
                fiber: 8.6
            },
            gi: 35,
            allergens: [],
            quality: 88,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'noix_macadamia': {
            name: 'Noix de macadamia',
            category: 'NUTS_SEEDS',
            per100g: {
                calories: 718,
                protein: 8,
                carbs: 14,
                fats: 76,
                fiber: 8.6
            },
            gi: 10,
            allergens: ['Fruits à coque'],
            quality: 85,
            cost: 'very_high',
            sustainability: 'low',
            prepTime: 'none'
        },

        // ==================== LEGUMINEUSES SUPPLEMENTAIRES ====================
        'pois_chiches': {
            name: 'Pois chiches (cuits)',
            category: 'PROTEINS',
            per100g: {
                calories: 164,
                protein: 8.9,
                carbs: 27,
                fats: 2.6,
                fiber: 7.6
            },
            gi: 28,
            allergens: [],
            quality: 90,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'long'
        },

        'haricots_rouges': {
            name: 'Haricots rouges (cuits)',
            category: 'PROTEINS',
            per100g: {
                calories: 127,
                protein: 8.7,
                carbs: 23,
                fats: 0.5,
                fiber: 6.4
            },
            gi: 29,
            allergens: [],
            quality: 92,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'long'
        },

        'haricots_blancs': {
            name: 'Haricots blancs (cuits)',
            category: 'PROTEINS',
            per100g: {
                calories: 139,
                protein: 9.7,
                carbs: 25,
                fats: 0.5,
                fiber: 6.3
            },
            gi: 35,
            allergens: [],
            quality: 90,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'long'
        },

        'pois_casses': {
            name: 'Pois casses (cuits)',
            category: 'PROTEINS',
            per100g: {
                calories: 118,
                protein: 8.3,
                carbs: 21,
                fats: 0.4,
                fiber: 8.3
            },
            gi: 25,
            allergens: [],
            quality: 92,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'medium'
        },

        'edamame': {
            name: 'Edamame (feves de soja)',
            category: 'PROTEINS',
            per100g: {
                calories: 122,
                protein: 11,
                carbs: 10,
                fats: 5,
                fiber: 5
            },
            gi: 15,
            allergens: ['Soja'],
            quality: 90,
            cost: 'medium',
            sustainability: 'high',
            prepTime: 'short'
        },

        // ==================== HUILES SUPPLEMENTAIRES ====================
        'huile_colza': {
            name: 'Huile de colza',
            category: 'FATS',
            per100g: {
                calories: 900,
                protein: 0,
                carbs: 0,
                fats: 100,
                fiber: 0,
                omega3: 9
            },
            gi: 0,
            allergens: [],
            quality: 95,
            cost: 'low',
            sustainability: 'high',
            prepTime: 'none'
        },

        'huile_lin': {
            name: 'Huile de lin',
            category: 'FATS',
            per100g: {
                calories: 900,
                protein: 0,
                carbs: 0,
                fats: 100,
                fiber: 0,
                omega3: 54
            },
            gi: 0,
            allergens: [],
            quality: 98,
            cost: 'high',
            sustainability: 'high',
            prepTime: 'none',
            note: 'Ne pas chauffer, utiliser cru'
        },

        'huile_noix': {
            name: 'Huile de noix',
            category: 'FATS',
            per100g: {
                calories: 900,
                protein: 0,
                carbs: 0,
                fats: 100,
                fiber: 0,
                omega3: 10
            },
            gi: 0,
            allergens: ['Fruits à coque'],
            quality: 90,
            cost: 'high',
            sustainability: 'high',
            prepTime: 'none'
        },

        'beurre_cacahuete': {
            name: 'Beurre de cacahuete (100%)',
            category: 'FATS',
            per100g: {
                calories: 588,
                protein: 25,
                carbs: 20,
                fats: 50,
                fiber: 8
            },
            gi: 14,
            allergens: ['Arachides'],
            quality: 85,
            cost: 'low',
            sustainability: 'medium',
            prepTime: 'none'
        },

        'beurre_amande': {
            name: 'Beurre d\'amande (100%)',
            category: 'FATS',
            per100g: {
                calories: 614,
                protein: 21,
                carbs: 19,
                fats: 55,
                fiber: 10
            },
            gi: 15,
            allergens: ['Fruits à coque'],
            quality: 92,
            cost: 'high',
            sustainability: 'medium',
            prepTime: 'none'
        }
    },

    /**
     * Obtenir un aliment par son ID
     * @param foodId
     */
    getFood(foodId) {
        return this.FOODS[foodId] || null;
    },

    /**
     * Chercher des aliments par catégorie
     * @param category
     */
    getFoodsByCategory(category) {
        return Object.entries(this.FOODS)
            .filter(([_, food]) => food.category === category)
            .map(([id, food]) => ({ id, ...food }));
    },

    /**
     * Chercher des aliments par nom
     * @param query
     */
    searchFoods(query) {
        const lowerQuery = query.toLowerCase();
        return Object.entries(this.FOODS)
            .filter(([_, food]) => food.name.toLowerCase().includes(lowerQuery))
            .map(([id, food]) => ({ id, ...food }));
    },

    /**
     * Filtrer par allergènes
     * @param excludeAllergens
     */
    filterByAllergens(excludeAllergens = []) {
        if (!excludeAllergens || excludeAllergens.length === 0) {
            return Object.entries(this.FOODS).map(([id, food]) => ({ id, ...food }));
        }

        return Object.entries(this.FOODS)
            .filter(([_, food]) => {
                return !food.allergens.some(allergen =>
                    excludeAllergens.includes(allergen)
                );
            })
            .map(([id, food]) => ({ id, ...food }));
    },

    /**
     * Calculer les macros pour une quantité
     * @param foodId
     * @param quantity
     */
    calculateForQuantity(foodId, quantity) {
        const food = this.getFood(foodId);
        if (!food) {return null;}

        const factor = quantity / 100;
        const result = {
            name: food.name,
            quantity,
            macros: {},
            micros: {}
        };

        // Macros
        const macros = food.per100g;
        result.macros = {
            calories: Math.round(macros.calories * factor),
            protein: Math.round(macros.protein * factor * 10) / 10,
            carbs: Math.round(macros.carbs * factor * 10) / 10,
            fats: Math.round(macros.fats * factor * 10) / 10,
            fiber: Math.round((macros.fiber || 0) * factor * 10) / 10
        };

        // Micros (conserver uniquement les importants)
        Object.keys(macros).forEach(key => {
            if (!['calories', 'protein', 'carbs', 'fats', 'fiber'].includes(key)) {
                result.micros[key] = Math.round(macros[key] * factor * 100) / 100;
            }
        });

        return result;
    },

    /**
     * Obtenir le niveau d'IG
     * @param gi
     */
    getGILevel(gi) {
        if (gi <= this.GI_LEVELS.LOW.max) {return 'LOW';}
        if (gi <= this.GI_LEVELS.MEDIUM.max) {return 'MEDIUM';}
        return 'HIGH';
    },

    /**
     * Recommander des aliments pour un objectif
     * @param objective
     * @param restrictions
     */
    recommendForObjective(objective, restrictions = {}) {
        const recommendations = {
            mass_gain: {
                highPriority: ['poulet_blanc', 'boeuf_maigre', 'oeufs_entiers', 'riz_complet', 'patate_douce', 'flocons_avoine', 'amandes'],
                mediumPriority: ['saumon', 'quinoa', 'avocat', 'yaourt_grec', 'banane'],
                supplements: ['whey_isolate', 'creatine']
            },
            weight_loss: {
                highPriority: ['poulet_blanc', 'dinde', 'blancs_oeufs', 'brocoli', 'epinards', 'courgette', 'yaourt_grec'],
                mediumPriority: ['thon_naturel', 'lentilles', 'quinoa', 'myrtilles', 'pomme'],
                supplements: []
            },
            performance: {
                highPriority: ['poulet_blanc', 'saumon', 'oeufs_entiers', 'patate_douce', 'riz_basmati', 'banane', 'flocons_avoine'],
                mediumPriority: ['quinoa', 'myrtilles', 'amandes', 'yaourt_grec'],
                supplements: ['creatine']
            }
        };

        const objectiveReco = recommendations[objective] || recommendations.mass_gain;

        // Filtrer selon restrictions
        const excludeAllergens = restrictions.allergies || [];
        const filtered = {
            highPriority: objectiveReco.highPriority.filter(id => {
                const food = this.getFood(id);
                return !food.allergens.some(a => excludeAllergens.includes(a));
            }),
            mediumPriority: objectiveReco.mediumPriority.filter(id => {
                const food = this.getFood(id);
                return !food.allergens.some(a => excludeAllergens.includes(a));
            }),
            supplements: objectiveReco.supplements
        };

        return filtered;
    }
};
