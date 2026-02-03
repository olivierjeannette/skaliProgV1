/**
 * ═══════════════════════════════════════════════════════════════
 * BASE DE DONNÉES DE 100+ REPAS RÉELS
 * Repas français, méditerranéens, asiatiques, végétariens, etc.
 * ═══════════════════════════════════════════════════════════════
 */

const NutritionMealsDatabase = {
    /**
     * PETIT-DÉJEUNERS (20 options)
     */
    breakfasts: [
        // Classiques français
        {
            name: 'Tartines beurre-confiture et yaourt',
            baseCalories: 420,
            baseProtein: 15,
            baseCarbs: 65,
            baseFats: 12,
            ingredients: [
                { name: 'Pain complet', quantity: 80, unit: 'g' },
                { name: 'Beurre demi-sel', quantity: 10, unit: 'g' },
                { name: 'Confiture allégée', quantity: 25, unit: 'g' },
                { name: 'Yaourt nature', quantity: 125, unit: 'g' },
                { name: "Jus d'orange", quantity: 150, unit: 'ml' }
            ],
            dessert: { name: 'Kiwi', quantity: 1, unit: 'unité', cal: 45, p: 1, c: 10, f: 0 }
        },
        {
            name: 'Croissant et chocolat chaud',
            baseCalories: 480,
            baseProtein: 14,
            baseCarbs: 58,
            baseFats: 22,
            ingredients: [
                { name: 'Croissant au beurre', quantity: 60, unit: 'g' },
                { name: 'Chocolat chaud', quantity: 250, unit: 'ml' },
                { name: 'Pain au chocolat', quantity: 50, unit: 'g' }
            ],
            dessert: {
                name: 'Orange pressée',
                quantity: 150,
                unit: 'ml',
                cal: 60,
                p: 1,
                c: 14,
                f: 0
            }
        },

        // Healthy / Sport
        {
            name: "Bowl d'avoine aux fruits",
            baseCalories: 520,
            baseProtein: 22,
            baseCarbs: 72,
            baseFats: 14,
            ingredients: [
                { name: "Flocons d'avoine", quantity: 80, unit: 'g' },
                { name: 'Lait demi-écrémé', quantity: 250, unit: 'ml' },
                { name: 'Banane', quantity: 1, unit: 'unité' },
                { name: 'Miel', quantity: 10, unit: 'g' },
                { name: 'Amandes concassées', quantity: 15, unit: 'g' }
            ],
            dessert: {
                name: 'Yaourt nature 0%',
                quantity: 125,
                unit: 'g',
                cal: 50,
                p: 8,
                c: 5,
                f: 0
            }
        },
        {
            name: 'Tartines complètes oeuf-avocat',
            baseCalories: 550,
            baseProtein: 24,
            baseCarbs: 50,
            baseFats: 24,
            ingredients: [
                { name: 'Pain complet', quantity: 80, unit: 'g' },
                { name: 'Avocat écrasé', quantity: 50, unit: 'g' },
                { name: 'Oeufs pochés', quantity: 2, unit: 'unités' },
                { name: 'Tomates cerises', quantity: 80, unit: 'g' },
                { name: "Jus d'orange frais", quantity: 150, unit: 'ml' }
            ],
            dessert: { name: 'Pomme', quantity: 1, unit: 'unité', cal: 75, p: 0, c: 18, f: 0 }
        },
        {
            name: 'Omelette jambon-fromage',
            baseCalories: 500,
            baseProtein: 32,
            baseCarbs: 38,
            baseFats: 22,
            ingredients: [
                { name: 'Oeufs entiers', quantity: 3, unit: 'unités' },
                { name: 'Jambon blanc', quantity: 40, unit: 'g' },
                { name: 'Emmental râpé', quantity: 20, unit: 'g' },
                { name: 'Pain complet', quantity: 60, unit: 'g' },
                { name: 'Beurre', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Compote sans sucre',
                quantity: 100,
                unit: 'g',
                cal: 50,
                p: 0,
                c: 12,
                f: 0
            }
        },
        {
            name: 'Pancakes protéinés',
            baseCalories: 530,
            baseProtein: 28,
            baseCarbs: 60,
            baseFats: 16,
            ingredients: [
                { name: 'Farine complète', quantity: 80, unit: 'g' },
                { name: 'Oeufs', quantity: 2, unit: 'unités' },
                { name: 'Lait', quantity: 150, unit: 'ml' },
                { name: "Sirop d'érable", quantity: 20, unit: 'g' },
                { name: 'Myrtilles fraîches', quantity: 80, unit: 'g' }
            ],
            dessert: {
                name: 'Fromage blanc 0%',
                quantity: 100,
                unit: 'g',
                cal: 45,
                p: 8,
                c: 4,
                f: 0
            }
        },
        {
            name: 'Granola maison yaourt grec',
            baseCalories: 510,
            baseProtein: 26,
            baseCarbs: 62,
            baseFats: 18,
            ingredients: [
                { name: 'Yaourt grec 0%', quantity: 200, unit: 'g' },
                { name: 'Granola', quantity: 60, unit: 'g' },
                { name: 'Fruits rouges', quantity: 100, unit: 'g' },
                { name: 'Miel', quantity: 15, unit: 'g' },
                { name: 'Noix de cajou', quantity: 15, unit: 'g' }
            ],
            dessert: { name: 'Orange', quantity: 1, unit: 'unité', cal: 60, p: 1, c: 14, f: 0 }
        },
        {
            name: 'Smoothie bowl énergétique',
            baseCalories: 490,
            baseProtein: 20,
            baseCarbs: 68,
            baseFats: 16,
            ingredients: [
                { name: 'Bananes congelées', quantity: 2, unit: 'unités' },
                { name: "Lait d'amande", quantity: 200, unit: 'ml' },
                { name: 'Beurre de cacahuète', quantity: 20, unit: 'g' },
                { name: "Flocons d'avoine", quantity: 30, unit: 'g' },
                { name: 'Toppings: fruits, graines', quantity: 50, unit: 'g' }
            ],
            dessert: { name: 'Skyr nature', quantity: 150, unit: 'g', cal: 90, p: 15, c: 6, f: 0 }
        },

        // Internationaux
        {
            name: 'Petit-déjeuner anglais léger',
            baseCalories: 560,
            baseProtein: 32,
            baseCarbs: 48,
            baseFats: 26,
            ingredients: [
                { name: 'Oeufs brouillés', quantity: 2, unit: 'unités' },
                { name: 'Bacon', quantity: 30, unit: 'g' },
                { name: 'Haricots blancs sauce tomate', quantity: 100, unit: 'g' },
                { name: 'Toast complet', quantity: 60, unit: 'g' },
                { name: 'Champignons sautés', quantity: 80, unit: 'g' }
            ],
            dessert: {
                name: 'Thé noir + lait',
                quantity: 250,
                unit: 'ml',
                cal: 40,
                p: 2,
                c: 6,
                f: 1
            }
        },
        {
            name: 'Bagel saumon-cream cheese',
            baseCalories: 540,
            baseProtein: 28,
            baseCarbs: 55,
            baseFats: 22,
            ingredients: [
                { name: 'Bagel complet', quantity: 90, unit: 'g' },
                { name: 'Cream cheese allégé', quantity: 30, unit: 'g' },
                { name: 'Saumon fumé', quantity: 50, unit: 'g' },
                { name: 'Câpres et oignon rouge', quantity: 20, unit: 'g' }
            ],
            dessert: {
                name: 'Salade de fruits',
                quantity: 150,
                unit: 'g',
                cal: 70,
                p: 1,
                c: 16,
                f: 0
            }
        },
        {
            name: 'Porridge écossais traditionnel',
            baseCalories: 460,
            baseProtein: 18,
            baseCarbs: 70,
            baseFats: 12,
            ingredients: [
                { name: "Flocons d'avoine", quantity: 80, unit: 'g' },
                { name: 'Lait entier', quantity: 300, unit: 'ml' },
                { name: 'Raisins secs', quantity: 30, unit: 'g' },
                { name: 'Cannelle', quantity: 2, unit: 'g' },
                { name: 'Noix', quantity: 15, unit: 'g' }
            ],
            dessert: {
                name: 'Pomme cuite au four',
                quantity: 150,
                unit: 'g',
                cal: 80,
                p: 0,
                c: 20,
                f: 0
            }
        },

        // Végétariens/Vegan
        {
            name: 'Toasts houmous-légumes',
            baseCalories: 440,
            baseProtein: 16,
            baseCarbs: 60,
            baseFats: 16,
            ingredients: [
                { name: 'Pain complet', quantity: 80, unit: 'g' },
                { name: 'Houmous', quantity: 60, unit: 'g' },
                { name: 'Tomates', quantity: 80, unit: 'g' },
                { name: 'Concombre', quantity: 50, unit: 'g' },
                { name: 'Graines de sésame', quantity: 10, unit: 'g' }
            ],
            dessert: {
                name: 'Smoothie vert',
                quantity: 200,
                unit: 'ml',
                cal: 85,
                p: 2,
                c: 18,
                f: 1
            }
        },
        {
            name: 'Chia pudding coco-mangue',
            baseCalories: 430,
            baseProtein: 14,
            baseCarbs: 55,
            baseFats: 18,
            ingredients: [
                { name: 'Graines de chia', quantity: 40, unit: 'g' },
                { name: 'Lait de coco', quantity: 200, unit: 'ml' },
                { name: 'Mangue fraîche', quantity: 100, unit: 'g' },
                { name: "Sirop d'agave", quantity: 15, unit: 'g' },
                { name: 'Noix de coco râpée', quantity: 10, unit: 'g' }
            ],
            dessert: { name: 'Banane', quantity: 1, unit: 'unité', cal: 90, p: 1, c: 22, f: 0 }
        },

        // Gourmands mais équilibrés
        {
            name: 'Crêpes complètes banane-nutella',
            baseCalories: 520,
            baseProtein: 16,
            baseCarbs: 68,
            baseFats: 20,
            ingredients: [
                { name: 'Farine complète', quantity: 60, unit: 'g' },
                { name: 'Oeuf', quantity: 1, unit: 'unité' },
                { name: 'Lait', quantity: 150, unit: 'ml' },
                { name: 'Nutella', quantity: 25, unit: 'g' },
                { name: 'Banane tranchée', quantity: 1, unit: 'unité' }
            ],
            dessert: { name: 'Yaourt nature', quantity: 125, unit: 'g', cal: 65, p: 5, c: 8, f: 2 }
        },
        {
            name: 'Pain perdu aux fruits rouges',
            baseCalories: 480,
            baseProtein: 20,
            baseCarbs: 64,
            baseFats: 16,
            ingredients: [
                { name: 'Pain brioché', quantity: 80, unit: 'g' },
                { name: 'Oeufs', quantity: 2, unit: 'unités' },
                { name: 'Lait', quantity: 100, unit: 'ml' },
                { name: 'Fruits rouges', quantity: 100, unit: 'g' },
                { name: 'Sucre glace', quantity: 10, unit: 'g' }
            ],
            dessert: {
                name: 'Fromage blanc 20%',
                quantity: 100,
                unit: 'g',
                cal: 75,
                p: 7,
                c: 5,
                f: 3
            }
        },
        {
            name: 'Gaufres complètes sirop érable',
            baseCalories: 500,
            baseProtein: 18,
            baseCarbs: 66,
            baseFats: 18,
            ingredients: [
                { name: 'Farine complète', quantity: 80, unit: 'g' },
                { name: 'Oeuf', quantity: 1, unit: 'unité' },
                { name: 'Lait', quantity: 150, unit: 'ml' },
                { name: "Sirop d'érable pur", quantity: 30, unit: 'g' },
                { name: 'Beurre de baratte', quantity: 10, unit: 'g' }
            ],
            dessert: { name: 'Poire', quantity: 1, unit: 'unité', cal: 70, p: 0, c: 17, f: 0 }
        },

        // Express/Rapides
        {
            name: 'Müesli lait et fruits',
            baseCalories: 450,
            baseProtein: 16,
            baseCarbs: 68,
            baseFats: 14,
            ingredients: [
                { name: 'Müesli complet', quantity: 70, unit: 'g' },
                { name: 'Lait demi-écrémé', quantity: 250, unit: 'ml' },
                { name: 'Banane', quantity: 1, unit: 'unité' },
                { name: 'Pomme râpée', quantity: 80, unit: 'g' }
            ],
            dessert: {
                name: 'Yaourt aux fruits 0%',
                quantity: 125,
                unit: 'g',
                cal: 70,
                p: 6,
                c: 12,
                f: 0
            }
        },
        {
            name: 'Tartine miel-ricotta',
            baseCalories: 410,
            baseProtein: 18,
            baseCarbs: 56,
            baseFats: 14,
            ingredients: [
                { name: 'Pain complet', quantity: 70, unit: 'g' },
                { name: 'Ricotta', quantity: 60, unit: 'g' },
                { name: 'Miel de lavande', quantity: 20, unit: 'g' },
                { name: 'Figues fraîches', quantity: 80, unit: 'g' }
            ],
            dessert: { name: 'Café au lait', quantity: 200, unit: 'ml', cal: 60, p: 4, c: 8, f: 2 }
        },
        {
            name: 'Bol de quinoa sucré',
            baseCalories: 470,
            baseProtein: 18,
            baseCarbs: 70,
            baseFats: 14,
            ingredients: [
                { name: 'Quinoa cuit', quantity: 120, unit: 'g' },
                { name: "Lait d'amande", quantity: 150, unit: 'ml' },
                { name: 'Raisins secs', quantity: 30, unit: 'g' },
                { name: 'Amandes effilées', quantity: 15, unit: 'g' },
                { name: 'Cannelle et miel', quantity: 15, unit: 'g' }
            ],
            dessert: { name: 'Kiwi', quantity: 2, unit: 'unités', cal: 90, p: 2, c: 20, f: 0 }
        },
        {
            name: 'Yaourt grec miel-noix',
            baseCalories: 460,
            baseProtein: 24,
            baseCarbs: 54,
            baseFats: 18,
            ingredients: [
                { name: 'Yaourt grec', quantity: 200, unit: 'g' },
                { name: 'Miel', quantity: 25, unit: 'g' },
                { name: 'Noix de Grenoble', quantity: 25, unit: 'g' },
                { name: 'Pain complet grillé', quantity: 50, unit: 'g' }
            ],
            dessert: { name: 'Pêche', quantity: 1, unit: 'unité', cal: 60, p: 1, c: 14, f: 0 }
        }
    ],

    /**
     * DÉJEUNERS (40 options)
     */
    lunches: [
        // Français traditionnels
        {
            name: 'Poulet rôti, riz basmati et ratatouille',
            baseCalories: 650,
            baseProtein: 48,
            baseCarbs: 72,
            baseFats: 14,
            ingredients: [
                { name: 'Blanc de poulet rôti', quantity: 180, unit: 'g' },
                { name: 'Riz basmati cuit', quantity: 200, unit: 'g' },
                { name: 'Ratatouille provençale', quantity: 250, unit: 'g' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' },
                { name: 'Herbes de Provence', quantity: 1, unit: 'c.à.c' }
            ],
            dessert: { name: 'Skyr nature', quantity: 150, unit: 'g', cal: 90, p: 15, c: 6, f: 0 }
        },
        {
            name: 'Boeuf bourguignon et pâtes',
            baseCalories: 720,
            baseProtein: 50,
            baseCarbs: 75,
            baseFats: 18,
            ingredients: [
                { name: 'Boeuf bourguignon', quantity: 200, unit: 'g' },
                { name: 'Pâtes complètes cuites', quantity: 220, unit: 'g' },
                { name: 'Carottes', quantity: 100, unit: 'g' },
                { name: 'Champignons', quantity: 80, unit: 'g' },
                { name: 'Vin rouge (sauce)', quantity: 30, unit: 'ml' }
            ],
            dessert: {
                name: 'Compote pomme-banane',
                quantity: 100,
                unit: 'g',
                cal: 65,
                p: 0,
                c: 15,
                f: 0
            }
        },
        {
            name: 'Blanquette de veau et riz',
            baseCalories: 620,
            baseProtein: 42,
            baseCarbs: 66,
            baseFats: 16,
            ingredients: [
                { name: 'Veau (blanquette)', quantity: 150, unit: 'g' },
                { name: 'Riz blanc cuit', quantity: 200, unit: 'g' },
                { name: 'Carottes', quantity: 100, unit: 'g' },
                { name: 'Champignons', quantity: 80, unit: 'g' },
                { name: 'Crème fraîche 15%', quantity: 30, unit: 'g' }
            ],
            dessert: {
                name: 'Crème dessert vanille 0%',
                quantity: 125,
                unit: 'g',
                cal: 65,
                p: 4,
                c: 12,
                f: 0
            }
        },
        {
            name: 'Dinde sauce champignons, purée',
            baseCalories: 670,
            baseProtein: 46,
            baseCarbs: 74,
            baseFats: 16,
            ingredients: [
                { name: 'Escalope de dinde', quantity: 170, unit: 'g' },
                { name: 'Purée de pommes de terre', quantity: 250, unit: 'g' },
                { name: 'Champignons de Paris', quantity: 150, unit: 'g' },
                { name: 'Crème fraîche 15%', quantity: 30, unit: 'g' },
                { name: 'Lait', quantity: 50, unit: 'ml' }
            ],
            dessert: {
                name: 'Salade de fruits frais',
                quantity: 150,
                unit: 'g',
                cal: 70,
                p: 1,
                c: 16,
                f: 0
            }
        },
        {
            name: 'Coq au vin et pommes vapeur',
            baseCalories: 640,
            baseProtein: 46,
            baseCarbs: 64,
            baseFats: 16,
            ingredients: [
                { name: 'Poulet (cuisses) coq au vin', quantity: 170, unit: 'g' },
                { name: 'Pommes de terre vapeur', quantity: 250, unit: 'g' },
                { name: 'Lardons', quantity: 30, unit: 'g' },
                { name: 'Oignons grelots', quantity: 80, unit: 'g' },
                { name: 'Vin rouge', quantity: 50, unit: 'ml' }
            ],
            dessert: { name: 'Yaourt nature', quantity: 125, unit: 'g', cal: 65, p: 5, c: 8, f: 2 }
        },

        // Poissons
        {
            name: 'Saumon grillé, quinoa et brocoli',
            baseCalories: 680,
            baseProtein: 46,
            baseCarbs: 62,
            baseFats: 24,
            ingredients: [
                { name: 'Pavé de saumon grillé', quantity: 150, unit: 'g' },
                { name: 'Quinoa cuit', quantity: 180, unit: 'g' },
                { name: 'Brocoli vapeur', quantity: 200, unit: 'g' },
                { name: 'Citron', quantity: 0.5, unit: 'unité' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' }
            ],
            dessert: {
                name: 'Yaourt aux fruits 0%',
                quantity: 125,
                unit: 'g',
                cal: 70,
                p: 6,
                c: 12,
                f: 0
            }
        },
        {
            name: 'Thon grillé, patate douce rôtie',
            baseCalories: 660,
            baseProtein: 52,
            baseCarbs: 68,
            baseFats: 14,
            ingredients: [
                { name: 'Steak de thon', quantity: 180, unit: 'g' },
                { name: 'Patate douce rôtie', quantity: 250, unit: 'g' },
                { name: 'Haricots verts', quantity: 200, unit: 'g' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' },
                { name: 'Ail et persil', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Mousse au chocolat 0%',
                quantity: 100,
                unit: 'g',
                cal: 60,
                p: 4,
                c: 10,
                f: 1
            }
        },
        {
            name: 'Dorade au four, légumes méditerranéens',
            baseCalories: 630,
            baseProtein: 48,
            baseCarbs: 58,
            baseFats: 18,
            ingredients: [
                { name: 'Filet de dorade', quantity: 180, unit: 'g' },
                { name: 'Riz basmati', quantity: 180, unit: 'g' },
                { name: 'Courgettes, poivrons, tomates', quantity: 250, unit: 'g' },
                { name: "Huile d'olive", quantity: 12, unit: 'ml' },
                { name: 'Thym et romarin', quantity: 2, unit: 'g' }
            ],
            dessert: { name: 'Sorbet citron', quantity: 80, unit: 'g', cal: 70, p: 0, c: 17, f: 0 }
        },
        {
            name: 'Cabillaud en papillote, fenouil braisé',
            baseCalories: 590,
            baseProtein: 48,
            baseCarbs: 60,
            baseFats: 12,
            ingredients: [
                { name: 'Cabillaud', quantity: 200, unit: 'g' },
                { name: 'Semoule cuite', quantity: 160, unit: 'g' },
                { name: 'Fenouil braisé', quantity: 200, unit: 'g' },
                { name: 'Tomates cerises', quantity: 100, unit: 'g' },
                { name: 'Herbes fraîches', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Fromage blanc 0%',
                quantity: 150,
                unit: 'g',
                cal: 65,
                p: 10,
                c: 8,
                f: 0
            }
        },
        {
            name: 'Pavé de lieu noir, purée de carottes',
            baseCalories: 610,
            baseProtein: 46,
            baseCarbs: 64,
            baseFats: 14,
            ingredients: [
                { name: 'Lieu noir', quantity: 180, unit: 'g' },
                { name: 'Purée de carottes', quantity: 200, unit: 'g' },
                { name: 'Pommes de terre vapeur', quantity: 150, unit: 'g' },
                { name: 'Beurre', quantity: 10, unit: 'g' },
                { name: 'Persil', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Compote de pommes',
                quantity: 100,
                unit: 'g',
                cal: 55,
                p: 0,
                c: 13,
                f: 0
            }
        },

        // Viandes rouges
        {
            name: 'Steak grillé, frites de patate douce',
            baseCalories: 690,
            baseProtein: 48,
            baseCarbs: 66,
            baseFats: 22,
            ingredients: [
                { name: 'Steak de boeuf', quantity: 160, unit: 'g' },
                { name: 'Frites de patate douce au four', quantity: 220, unit: 'g' },
                { name: 'Salade verte', quantity: 150, unit: 'g' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' },
                { name: 'Sauce béarnaise light', quantity: 20, unit: 'g' }
            ],
            dessert: {
                name: 'Yaourt à la grecque',
                quantity: 150,
                unit: 'g',
                cal: 95,
                p: 8,
                c: 12,
                f: 2
            }
        },
        {
            name: 'Boeuf haché, spaghetti bolognaise',
            baseCalories: 710,
            baseProtein: 46,
            baseCarbs: 78,
            baseFats: 20,
            ingredients: [
                { name: 'Boeuf haché 5%', quantity: 150, unit: 'g' },
                { name: 'Spaghetti complets', quantity: 200, unit: 'g' },
                { name: 'Sauce tomate maison', quantity: 150, unit: 'g' },
                { name: 'Parmesan', quantity: 15, unit: 'g' },
                { name: 'Basilic', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Tiramisu allégé',
                quantity: 100,
                unit: 'g',
                cal: 85,
                p: 4,
                c: 12,
                f: 3
            }
        },
        {
            name: "Bavette d'aloyau, haricots verts",
            baseCalories: 650,
            baseProtein: 50,
            baseCarbs: 60,
            baseFats: 18,
            ingredients: [
                { name: 'Bavette', quantity: 170, unit: 'g' },
                { name: 'Pommes de terre sautées', quantity: 200, unit: 'g' },
                { name: 'Haricots verts', quantity: 200, unit: 'g' },
                { name: 'Échalotes', quantity: 30, unit: 'g' },
                { name: 'Beurre', quantity: 10, unit: 'g' }
            ],
            dessert: { name: 'Île flottante', quantity: 120, unit: 'g', cal: 90, p: 5, c: 14, f: 2 }
        },

        // Plats internationaux
        {
            name: 'Tajine de poulet aux légumes',
            baseCalories: 640,
            baseProtein: 44,
            baseCarbs: 70,
            baseFats: 14,
            ingredients: [
                { name: 'Poulet (cuisses)', quantity: 150, unit: 'g' },
                { name: 'Semoule de couscous', quantity: 180, unit: 'g' },
                { name: 'Légumes variés (carotte, navet, courgette)', quantity: 200, unit: 'g' },
                { name: 'Pois chiches', quantity: 50, unit: 'g' },
                { name: 'Épices tajine', quantity: 1, unit: 'c.à.c' }
            ],
            dessert: {
                name: 'Fromage blanc 20% + miel',
                quantity: 100,
                unit: 'g',
                cal: 85,
                p: 7,
                c: 8,
                f: 3
            }
        },
        {
            name: 'Chili con carne et riz',
            baseCalories: 710,
            baseProtein: 48,
            baseCarbs: 78,
            baseFats: 18,
            ingredients: [
                { name: 'Boeuf haché 5%', quantity: 150, unit: 'g' },
                { name: 'Haricots rouges', quantity: 120, unit: 'g' },
                { name: 'Riz basmati cuit', quantity: 180, unit: 'g' },
                { name: 'Tomates concassées', quantity: 100, unit: 'g' },
                { name: 'Poivrons', quantity: 80, unit: 'g' }
            ],
            dessert: {
                name: 'Yaourt à la grecque + fruits',
                quantity: 150,
                unit: 'g',
                cal: 95,
                p: 8,
                c: 12,
                f: 2
            }
        },
        {
            name: 'Wok de poulet aux légumes asiatiques',
            baseCalories: 610,
            baseProtein: 46,
            baseCarbs: 68,
            baseFats: 14,
            ingredients: [
                { name: 'Blanc de poulet', quantity: 160, unit: 'g' },
                { name: 'Nouilles de riz', quantity: 150, unit: 'g' },
                { name: 'Légumes wok (poivrons, carottes, chou)', quantity: 200, unit: 'g' },
                { name: 'Sauce soja', quantity: 15, unit: 'ml' },
                { name: 'Huile de sésame', quantity: 5, unit: 'ml' }
            ],
            dessert: {
                name: 'Litchis au sirop léger',
                quantity: 100,
                unit: 'g',
                cal: 70,
                p: 1,
                c: 16,
                f: 0
            }
        },
        {
            name: 'Poulet tikka masala et riz basmati',
            baseCalories: 680,
            baseProtein: 46,
            baseCarbs: 74,
            baseFats: 18,
            ingredients: [
                { name: 'Poulet tikka', quantity: 170, unit: 'g' },
                { name: 'Riz basmati', quantity: 200, unit: 'g' },
                { name: 'Sauce masala (tomate, crème)', quantity: 120, unit: 'g' },
                { name: 'Épinards', quantity: 100, unit: 'g' },
                { name: 'Naan bread', quantity: 50, unit: 'g' }
            ],
            dessert: {
                name: 'Mangue fraîche',
                quantity: 150,
                unit: 'g',
                cal: 90,
                p: 1,
                c: 22,
                f: 0
            }
        },
        {
            name: 'Pad thaï au poulet',
            baseCalories: 670,
            baseProtein: 42,
            baseCarbs: 76,
            baseFats: 18,
            ingredients: [
                { name: 'Poulet émincé', quantity: 140, unit: 'g' },
                { name: 'Nouilles de riz', quantity: 160, unit: 'g' },
                { name: 'Sauce pad thaï', quantity: 40, unit: 'g' },
                { name: 'Germes de soja', quantity: 80, unit: 'g' },
                { name: 'Cacahuètes concassées', quantity: 20, unit: 'g' }
            ],
            dessert: { name: 'Ananas frais', quantity: 150, unit: 'g', cal: 75, p: 1, c: 18, f: 0 }
        },
        {
            name: 'Fajitas de boeuf et poivrons',
            baseCalories: 660,
            baseProtein: 44,
            baseCarbs: 72,
            baseFats: 18,
            ingredients: [
                { name: 'Boeuf émincé', quantity: 150, unit: 'g' },
                { name: 'Tortillas de blé', quantity: 2, unit: 'unités' },
                { name: 'Poivrons grillés', quantity: 150, unit: 'g' },
                { name: 'Guacamole', quantity: 40, unit: 'g' },
                { name: 'Crème fraîche light', quantity: 30, unit: 'g' }
            ],
            dessert: { name: 'Sorbet mangue', quantity: 80, unit: 'g', cal: 70, p: 0, c: 17, f: 0 }
        },
        {
            name: 'Burger maison poulet grillé',
            baseCalories: 650,
            baseProtein: 48,
            baseCarbs: 66,
            baseFats: 20,
            ingredients: [
                { name: 'Pain burger complet', quantity: 100, unit: 'g' },
                { name: 'Poulet grillé', quantity: 150, unit: 'g' },
                { name: 'Cheddar', quantity: 20, unit: 'g' },
                { name: 'Tomate, salade, oignon', quantity: 100, unit: 'g' },
                { name: 'Frites de patate douce', quantity: 120, unit: 'g' }
            ],
            dessert: {
                name: 'Milk-shake protéiné',
                quantity: 200,
                unit: 'ml',
                cal: 85,
                p: 12,
                c: 10,
                f: 1
            }
        },

        // Végétariens
        {
            name: 'Curry de lentilles et riz',
            baseCalories: 600,
            baseProtein: 28,
            baseCarbs: 88,
            baseFats: 12,
            ingredients: [
                { name: 'Lentilles corail', quantity: 100, unit: 'g' },
                { name: 'Riz basmati cuit', quantity: 180, unit: 'g' },
                { name: 'Lait de coco light', quantity: 100, unit: 'ml' },
                { name: 'Épinards', quantity: 150, unit: 'g' },
                { name: 'Curry en poudre', quantity: 1, unit: 'c.à.c' }
            ],
            dessert: {
                name: 'Skyr vanille',
                quantity: 150,
                unit: 'g',
                cal: 100,
                p: 14,
                c: 10,
                f: 0
            }
        },
        {
            name: 'Lasagnes végétariennes',
            baseCalories: 640,
            baseProtein: 32,
            baseCarbs: 72,
            baseFats: 20,
            ingredients: [
                { name: 'Pâtes lasagnes', quantity: 100, unit: 'g' },
                { name: 'Légumes (aubergine, courgette, tomate)', quantity: 250, unit: 'g' },
                { name: 'Ricotta', quantity: 80, unit: 'g' },
                { name: 'Mozzarella light', quantity: 40, unit: 'g' },
                { name: 'Sauce tomate', quantity: 100, unit: 'g' }
            ],
            dessert: {
                name: 'Panna cotta aux fruits rouges',
                quantity: 100,
                unit: 'g',
                cal: 85,
                p: 3,
                c: 12,
                f: 3
            }
        },
        {
            name: 'Buddha bowl quinoa-avocat',
            baseCalories: 630,
            baseProtein: 24,
            baseCarbs: 76,
            baseFats: 24,
            ingredients: [
                { name: 'Quinoa cuit', quantity: 150, unit: 'g' },
                { name: 'Avocat', quantity: 80, unit: 'g' },
                { name: 'Pois chiches rôtis', quantity: 100, unit: 'g' },
                { name: 'Patate douce rôtie', quantity: 120, unit: 'g' },
                { name: 'Tahini', quantity: 20, unit: 'g' }
            ],
            dessert: {
                name: 'Compote de fruits',
                quantity: 120,
                unit: 'g',
                cal: 70,
                p: 0,
                c: 16,
                f: 0
            }
        },
        {
            name: 'Risotto aux champignons',
            baseCalories: 620,
            baseProtein: 22,
            baseCarbs: 86,
            baseFats: 18,
            ingredients: [
                { name: 'Riz arborio', quantity: 100, unit: 'g' },
                { name: 'Champignons variés', quantity: 200, unit: 'g' },
                { name: 'Parmesan râpé', quantity: 30, unit: 'g' },
                { name: 'Bouillon de légumes', quantity: 300, unit: 'ml' },
                { name: 'Crème fraîche 15%', quantity: 30, unit: 'g' }
            ],
            dessert: {
                name: 'Tiramisu aux fruits',
                quantity: 100,
                unit: 'g',
                cal: 90,
                p: 4,
                c: 13,
                f: 3
            }
        },
        {
            name: 'Falafels, houmous et taboulé',
            baseCalories: 660,
            baseProtein: 26,
            baseCarbs: 82,
            baseFats: 22,
            ingredients: [
                { name: 'Falafels (pois chiches)', quantity: 120, unit: 'g' },
                { name: 'Houmous', quantity: 60, unit: 'g' },
                { name: 'Taboulé', quantity: 150, unit: 'g' },
                { name: 'Pain pita complet', quantity: 80, unit: 'g' },
                { name: 'Sauce tahini', quantity: 20, unit: 'g' }
            ],
            dessert: {
                name: 'Dattes fraîches',
                quantity: 40,
                unit: 'g',
                cal: 110,
                p: 1,
                c: 28,
                f: 0
            }
        },

        // Salades repas complets
        {
            name: 'Salade César au poulet grillé',
            baseCalories: 580,
            baseProtein: 46,
            baseCarbs: 48,
            baseFats: 22,
            ingredients: [
                { name: 'Poulet grillé', quantity: 160, unit: 'g' },
                { name: 'Laitue romaine', quantity: 150, unit: 'g' },
                { name: 'Croûtons', quantity: 40, unit: 'g' },
                { name: 'Parmesan', quantity: 20, unit: 'g' },
                { name: 'Sauce César allégée', quantity: 30, unit: 'g' }
            ],
            dessert: {
                name: 'Brownies protéiné',
                quantity: 50,
                unit: 'g',
                cal: 95,
                p: 8,
                c: 10,
                f: 3
            }
        },
        {
            name: 'Salade niçoise complète',
            baseCalories: 600,
            baseProtein: 42,
            baseCarbs: 52,
            baseFats: 22,
            ingredients: [
                { name: 'Thon au naturel', quantity: 150, unit: 'g' },
                { name: 'Pommes de terre', quantity: 150, unit: 'g' },
                { name: 'Haricots verts', quantity: 100, unit: 'g' },
                { name: 'Oeufs durs', quantity: 2, unit: 'unités' },
                { name: 'Olives noires', quantity: 30, unit: 'g' }
            ],
            dessert: { name: 'Flan pâtissier', quantity: 80, unit: 'g', cal: 85, p: 3, c: 14, f: 2 }
        },
        {
            name: 'Poke bowl saumon-avocat',
            baseCalories: 670,
            baseProtein: 44,
            baseCarbs: 66,
            baseFats: 24,
            ingredients: [
                { name: 'Saumon cru', quantity: 140, unit: 'g' },
                { name: 'Riz sushi', quantity: 180, unit: 'g' },
                { name: 'Avocat', quantity: 60, unit: 'g' },
                { name: 'Edamame', quantity: 80, unit: 'g' },
                { name: 'Sauce soja-sésame', quantity: 20, unit: 'ml' }
            ],
            dessert: { name: 'Mochi', quantity: 2, unit: 'unités', cal: 75, p: 1, c: 16, f: 1 }
        },

        // Plats rapides
        {
            name: 'Wrap poulet-crudités',
            baseCalories: 590,
            baseProtein: 42,
            baseCarbs: 62,
            baseFats: 16,
            ingredients: [
                { name: 'Tortilla complète', quantity: 80, unit: 'g' },
                { name: 'Poulet grillé', quantity: 140, unit: 'g' },
                { name: 'Crudités (tomate, salade, concombre)', quantity: 120, unit: 'g' },
                { name: 'Sauce yaourt', quantity: 30, unit: 'g' },
                { name: 'Fromage frais', quantity: 20, unit: 'g' }
            ],
            dessert: { name: 'Pomme', quantity: 1, unit: 'unité', cal: 75, p: 0, c: 18, f: 0 }
        },
        {
            name: 'Quiche lorraine, salade verte',
            baseCalories: 640,
            baseProtein: 32,
            baseCarbs: 54,
            baseFats: 30,
            ingredients: [
                { name: 'Part de quiche lorraine', quantity: 200, unit: 'g' },
                { name: 'Salade verte', quantity: 150, unit: 'g' },
                { name: 'Vinaigrette', quantity: 15, unit: 'ml' }
            ],
            dessert: { name: 'Yaourt nature', quantity: 125, unit: 'g', cal: 65, p: 5, c: 8, f: 2 }
        },
        {
            name: 'Croque-monsieur, salade',
            baseCalories: 620,
            baseProtein: 38,
            baseCarbs: 58,
            baseFats: 24,
            ingredients: [
                { name: 'Pain de mie complet', quantity: 80, unit: 'g' },
                { name: 'Jambon blanc', quantity: 60, unit: 'g' },
                { name: 'Emmental', quantity: 40, unit: 'g' },
                { name: 'Béchamel légère', quantity: 40, unit: 'g' },
                { name: 'Salade verte', quantity: 100, unit: 'g' }
            ],
            dessert: { name: 'Compote', quantity: 100, unit: 'g', cal: 55, p: 0, c: 13, f: 0 }
        },
        {
            name: 'Pizza margherita maison',
            baseCalories: 690,
            baseProtein: 34,
            baseCarbs: 82,
            baseFats: 24,
            ingredients: [
                { name: 'Pâte à pizza complète', quantity: 150, unit: 'g' },
                { name: 'Sauce tomate', quantity: 80, unit: 'g' },
                { name: 'Mozzarella', quantity: 80, unit: 'g' },
                { name: 'Basilic frais', quantity: 5, unit: 'g' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' }
            ],
            dessert: {
                name: 'Salade de fruits',
                quantity: 150,
                unit: 'g',
                cal: 70,
                p: 1,
                c: 16,
                f: 0
            }
        },

        // Plats d'hiver
        {
            name: 'Pot-au-feu traditionnel',
            baseCalories: 620,
            baseProtein: 46,
            baseCarbs: 64,
            baseFats: 14,
            ingredients: [
                { name: 'Boeuf à pot-au-feu', quantity: 150, unit: 'g' },
                { name: 'Légumes (carottes, navets, poireaux)', quantity: 300, unit: 'g' },
                { name: 'Pommes de terre', quantity: 150, unit: 'g' },
                { name: 'Bouillon', quantity: 200, unit: 'ml' },
                { name: 'Moutarde', quantity: 15, unit: 'g' }
            ],
            dessert: {
                name: 'Clafoutis aux cerises',
                quantity: 100,
                unit: 'g',
                cal: 90,
                p: 3,
                c: 15,
                f: 2
            }
        },
        {
            name: 'Cassoulet toulousain',
            baseCalories: 730,
            baseProtein: 48,
            baseCarbs: 76,
            baseFats: 22,
            ingredients: [
                { name: 'Haricots blancs', quantity: 200, unit: 'g' },
                { name: 'Saucisse de Toulouse', quantity: 80, unit: 'g' },
                { name: 'Confit de canard', quantity: 80, unit: 'g' },
                { name: 'Sauce tomate', quantity: 100, unit: 'g' },
                { name: 'Pain de campagne', quantity: 50, unit: 'g' }
            ],
            dessert: {
                name: 'Tarte aux pommes',
                quantity: 80,
                unit: 'g',
                cal: 95,
                p: 2,
                c: 18,
                f: 2
            }
        },
        {
            name: 'Hachis parmentier',
            baseCalories: 680,
            baseProtein: 42,
            baseCarbs: 70,
            baseFats: 22,
            ingredients: [
                { name: 'Boeuf haché', quantity: 140, unit: 'g' },
                { name: 'Purée de pommes de terre', quantity: 250, unit: 'g' },
                { name: 'Oignons', quantity: 50, unit: 'g' },
                { name: 'Emmental râpé', quantity: 30, unit: 'g' },
                { name: 'Beurre', quantity: 10, unit: 'g' }
            ],
            dessert: {
                name: 'Mousse au chocolat',
                quantity: 80,
                unit: 'g',
                cal: 85,
                p: 4,
                c: 10,
                f: 4
            }
        },

        // Plats d'été
        {
            name: 'Salade grecque et pain pita',
            baseCalories: 580,
            baseProtein: 26,
            baseCarbs: 64,
            baseFats: 24,
            ingredients: [
                { name: 'Tomates', quantity: 150, unit: 'g' },
                { name: 'Concombre', quantity: 100, unit: 'g' },
                { name: 'Feta', quantity: 80, unit: 'g' },
                { name: 'Olives', quantity: 40, unit: 'g' },
                { name: 'Pain pita', quantity: 100, unit: 'g' }
            ],
            dessert: {
                name: 'Yaourt grec miel',
                quantity: 150,
                unit: 'g',
                cal: 120,
                p: 8,
                c: 16,
                f: 3
            }
        },
        {
            name: 'Gazpacho et salade de quinoa',
            baseCalories: 540,
            baseProtein: 22,
            baseCarbs: 72,
            baseFats: 16,
            ingredients: [
                { name: 'Gazpacho', quantity: 300, unit: 'ml' },
                { name: 'Salade quinoa-légumes', quantity: 250, unit: 'g' },
                { name: 'Pain complet', quantity: 60, unit: 'g' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' }
            ],
            dessert: { name: 'Pastèque', quantity: 200, unit: 'g', cal: 60, p: 1, c: 14, f: 0 }
        },
        {
            name: 'Tartare de boeuf, frites',
            baseCalories: 700,
            baseProtein: 46,
            baseCarbs: 64,
            baseFats: 26,
            ingredients: [
                { name: 'Boeuf haché frais', quantity: 160, unit: 'g' },
                { name: 'Frites maison au four', quantity: 180, unit: 'g' },
                { name: 'Câpres, cornichons, oignon', quantity: 40, unit: 'g' },
                { name: "Jaune d'oeuf", quantity: 1, unit: 'unité' },
                { name: 'Salade verte', quantity: 100, unit: 'g' }
            ],
            dessert: {
                name: 'Sorbet framboise',
                quantity: 80,
                unit: 'g',
                cal: 70,
                p: 0,
                c: 17,
                f: 0
            }
        },

        // Plats économiques
        {
            name: 'Oeufs mimosa et taboulé',
            baseCalories: 580,
            baseProtein: 28,
            baseCarbs: 66,
            baseFats: 20,
            ingredients: [
                { name: 'Oeufs durs', quantity: 3, unit: 'unités' },
                { name: 'Taboulé', quantity: 200, unit: 'g' },
                { name: 'Mayonnaise allégée', quantity: 20, unit: 'g' },
                { name: 'Pain complet', quantity: 60, unit: 'g' }
            ],
            dessert: { name: 'Yaourt nature', quantity: 125, unit: 'g', cal: 65, p: 5, c: 8, f: 2 }
        },
        {
            name: 'Pâtes carbonara light',
            baseCalories: 660,
            baseProtein: 38,
            baseCarbs: 76,
            baseFats: 20,
            ingredients: [
                { name: 'Pâtes complètes', quantity: 200, unit: 'g' },
                { name: 'Lardons', quantity: 60, unit: 'g' },
                { name: 'Oeufs', quantity: 2, unit: 'unités' },
                { name: 'Crème fraîche 15%', quantity: 40, unit: 'g' },
                { name: 'Parmesan', quantity: 20, unit: 'g' }
            ],
            dessert: { name: 'Compote', quantity: 100, unit: 'g', cal: 55, p: 0, c: 13, f: 0 }
        },
        {
            name: 'Omelette complète et salade',
            baseCalories: 570,
            baseProtein: 36,
            baseCarbs: 48,
            baseFats: 24,
            ingredients: [
                { name: 'Oeufs', quantity: 3, unit: 'unités' },
                { name: 'Jambon', quantity: 40, unit: 'g' },
                { name: 'Fromage', quantity: 30, unit: 'g' },
                { name: 'Pain complet', quantity: 70, unit: 'g' },
                { name: 'Salade verte', quantity: 150, unit: 'g' }
            ],
            dessert: { name: 'Pomme', quantity: 1, unit: 'unité', cal: 75, p: 0, c: 18, f: 0 }
        },
        {
            name: 'Steak haché, tagliatelles et sauce tomate',
            baseCalories: 650,
            baseProtein: 44,
            baseCarbs: 72,
            baseFats: 18,
            ingredients: [
                { name: 'Steak haché 5%', quantity: 150, unit: 'g' },
                { name: 'Tagliatelles complètes', quantity: 200, unit: 'g' },
                { name: 'Sauce tomate maison', quantity: 150, unit: 'g' },
                { name: 'Parmesan râpé', quantity: 15, unit: 'g' },
                { name: 'Basilic frais', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Mousse de fruits 0%',
                quantity: 100,
                unit: 'g',
                cal: 55,
                p: 3,
                c: 10,
                f: 0
            }
        },
        {
            name: 'Gratin dauphinois et jambon',
            baseCalories: 680,
            baseProtein: 36,
            baseCarbs: 68,
            baseFats: 26,
            ingredients: [
                { name: 'Pommes de terre', quantity: 250, unit: 'g' },
                { name: 'Crème fraîche 15%', quantity: 50, unit: 'g' },
                { name: 'Lait', quantity: 100, unit: 'ml' },
                { name: 'Jambon blanc', quantity: 100, unit: 'g' },
                { name: 'Emmental', quantity: 30, unit: 'g' }
            ],
            dessert: { name: 'Flan pâtissier', quantity: 80, unit: 'g', cal: 85, p: 3, c: 14, f: 2 }
        }
    ],

    /**
     * COLLATIONS (20 options)
     */
    snacks: [
        // Protéinées
        {
            name: 'Whey protein + banane',
            baseCalories: 250,
            baseProtein: 28,
            baseCarbs: 30,
            baseFats: 2,
            ingredients: [
                { name: 'Whey protéine', quantity: 30, unit: 'g' },
                { name: 'Eau ou lait', quantity: 250, unit: 'ml' },
                { name: 'Banane', quantity: 1, unit: 'unité' }
            ],
            dessert: null
        },
        {
            name: 'Smoothie protéiné',
            baseCalories: 280,
            baseProtein: 24,
            baseCarbs: 32,
            baseFats: 6,
            ingredients: [
                { name: 'Whey protéine', quantity: 30, unit: 'g' },
                { name: 'Banane', quantity: 1, unit: 'unité' },
                { name: 'Lait', quantity: 200, unit: 'ml' },
                { name: "Flocons d'avoine", quantity: 20, unit: 'g' },
                { name: 'Beurre de cacahuète', quantity: 10, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Fromage blanc et fruits',
            baseCalories: 200,
            baseProtein: 18,
            baseCarbs: 24,
            baseFats: 2,
            ingredients: [
                { name: 'Fromage blanc 0%', quantity: 150, unit: 'g' },
                { name: 'Fruits rouges', quantity: 100, unit: 'g' },
                { name: 'Miel', quantity: 10, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Yaourt grec protéiné',
            baseCalories: 220,
            baseProtein: 22,
            baseCarbs: 20,
            baseFats: 4,
            ingredients: [
                { name: 'Yaourt grec 0%', quantity: 200, unit: 'g' },
                { name: 'Fruits', quantity: 80, unit: 'g' },
                { name: 'Granola', quantity: 20, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Oeufs durs et amandes',
            baseCalories: 260,
            baseProtein: 18,
            baseCarbs: 8,
            baseFats: 18,
            ingredients: [
                { name: 'Oeufs durs', quantity: 2, unit: 'unités' },
                { name: 'Amandes', quantity: 25, unit: 'g' }
            ],
            dessert: null
        },

        // Énergétiques
        {
            name: 'Tartine beurre de cacahuète banane',
            baseCalories: 260,
            baseProtein: 10,
            baseCarbs: 32,
            baseFats: 10,
            ingredients: [
                { name: 'Pain complet', quantity: 50, unit: 'g' },
                { name: 'Beurre de cacahuète', quantity: 15, unit: 'g' },
                { name: 'Banane', quantity: 1, unit: 'unité' }
            ],
            dessert: null
        },
        {
            name: 'Fruits secs et oléagineux',
            baseCalories: 220,
            baseProtein: 6,
            baseCarbs: 24,
            baseFats: 12,
            ingredients: [
                { name: 'Amandes', quantity: 20, unit: 'g' },
                { name: 'Abricots secs', quantity: 30, unit: 'g' },
                { name: 'Noix', quantity: 15, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Barres protéinées maison',
            baseCalories: 240,
            baseProtein: 12,
            baseCarbs: 28,
            baseFats: 8,
            ingredients: [
                { name: 'Barre protéinée', quantity: 60, unit: 'g' },
                { name: 'Pomme', quantity: 1, unit: 'unité' }
            ],
            dessert: null
        },
        {
            name: "Boules d'énergie dattes-cacao",
            baseCalories: 230,
            baseProtein: 8,
            baseCarbs: 32,
            baseFats: 10,
            ingredients: [
                { name: 'Boules énergie maison', quantity: 3, unit: 'unités' },
                { name: 'Amandes', quantity: 15, unit: 'g' }
            ],
            dessert: null
        },

        // Légères
        {
            name: 'Pomme et amandes',
            baseCalories: 180,
            baseProtein: 5,
            baseCarbs: 22,
            baseFats: 10,
            ingredients: [
                { name: 'Pomme', quantity: 1, unit: 'unité' },
                { name: 'Amandes', quantity: 20, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Carottes et houmous',
            baseCalories: 160,
            baseProtein: 6,
            baseCarbs: 20,
            baseFats: 8,
            ingredients: [
                { name: 'Carottes', quantity: 150, unit: 'g' },
                { name: 'Houmous', quantity: 50, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Concombre et fromage frais',
            baseCalories: 140,
            baseProtein: 10,
            baseCarbs: 12,
            baseFats: 6,
            ingredients: [
                { name: 'Concombre', quantity: 150, unit: 'g' },
                { name: 'Fromage frais', quantity: 50, unit: 'g' },
                { name: 'Crackers complets', quantity: 30, unit: 'g' }
            ],
            dessert: null
        },

        // Gourmandes équilibrées
        {
            name: 'Crêpe protéinée sucrée',
            baseCalories: 240,
            baseProtein: 18,
            baseCarbs: 28,
            baseFats: 6,
            ingredients: [
                { name: 'Whey protéine', quantity: 30, unit: 'g' },
                { name: 'Oeuf', quantity: 1, unit: 'unité' },
                { name: 'Banane écrasée', quantity: 1, unit: 'unité' },
                { name: 'Cannelle', quantity: 1, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Muffin protéiné myrtilles',
            baseCalories: 220,
            baseProtein: 14,
            baseCarbs: 26,
            baseFats: 6,
            ingredients: [
                { name: 'Muffin protéiné maison', quantity: 1, unit: 'unité' },
                { name: 'Myrtilles fraîches', quantity: 50, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Cookies protéinés',
            baseCalories: 230,
            baseProtein: 12,
            baseCarbs: 28,
            baseFats: 8,
            ingredients: [
                { name: 'Cookies protéinés', quantity: 2, unit: 'unités' },
                { name: 'Lait', quantity: 200, unit: 'ml' }
            ],
            dessert: null
        },

        // Créatives
        {
            name: 'Toast avocat-saumon fumé',
            baseCalories: 270,
            baseProtein: 16,
            baseCarbs: 22,
            baseFats: 14,
            ingredients: [
                { name: 'Pain complet', quantity: 40, unit: 'g' },
                { name: 'Avocat', quantity: 50, unit: 'g' },
                { name: 'Saumon fumé', quantity: 40, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Edamame et chips de légumes',
            baseCalories: 190,
            baseProtein: 12,
            baseCarbs: 22,
            baseFats: 6,
            ingredients: [
                { name: 'Edamame', quantity: 100, unit: 'g' },
                { name: 'Chips de légumes', quantity: 30, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Bol de crudités et tzatziki',
            baseCalories: 170,
            baseProtein: 8,
            baseCarbs: 20,
            baseFats: 8,
            ingredients: [
                { name: 'Crudités variées', quantity: 200, unit: 'g' },
                { name: 'Tzatziki', quantity: 60, unit: 'g' },
                { name: 'Pain pita', quantity: 30, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Chia pudding express',
            baseCalories: 210,
            baseProtein: 10,
            baseCarbs: 26,
            baseFats: 10,
            ingredients: [
                { name: 'Graines de chia', quantity: 25, unit: 'g' },
                { name: "Lait d'amande", quantity: 150, unit: 'ml' },
                { name: 'Fruits', quantity: 80, unit: 'g' },
                { name: 'Miel', quantity: 10, unit: 'g' }
            ],
            dessert: null
        },
        {
            name: 'Wrap jambon-fromage léger',
            baseCalories: 250,
            baseProtein: 20,
            baseCarbs: 28,
            baseFats: 8,
            ingredients: [
                { name: 'Tortilla complète', quantity: 50, unit: 'g' },
                { name: 'Jambon blanc', quantity: 50, unit: 'g' },
                { name: 'Fromage light', quantity: 20, unit: 'g' },
                { name: 'Salade', quantity: 30, unit: 'g' }
            ],
            dessert: null
        }
    ],

    /**
     * DÎNERS (25 options)
     */
    dinners: [
        {
            name: 'Filet de colin, semoule et légumes grillés',
            baseCalories: 580,
            baseProtein: 44,
            baseCarbs: 62,
            baseFats: 12,
            ingredients: [
                { name: 'Filet de colin', quantity: 180, unit: 'g' },
                { name: 'Semoule cuite', quantity: 150, unit: 'g' },
                { name: 'Légumes grillés (courgette, aubergine)', quantity: 200, unit: 'g' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' },
                { name: 'Citron', quantity: 0.5, unit: 'unité' }
            ],
            dessert: {
                name: 'Yaourt nature sucré',
                quantity: 125,
                unit: 'g',
                cal: 70,
                p: 5,
                c: 12,
                f: 1
            }
        },
        {
            name: 'Omelette aux légumes et salade',
            baseCalories: 520,
            baseProtein: 36,
            baseCarbs: 42,
            baseFats: 22,
            ingredients: [
                { name: 'Oeufs', quantity: 3, unit: 'unités' },
                { name: 'Tomates', quantity: 100, unit: 'g' },
                { name: 'Champignons', quantity: 80, unit: 'g' },
                { name: 'Pain complet', quantity: 60, unit: 'g' },
                { name: 'Salade verte', quantity: 150, unit: 'g' }
            ],
            dessert: {
                name: 'Compote pomme-poire',
                quantity: 100,
                unit: 'g',
                cal: 60,
                p: 0,
                c: 14,
                f: 0
            }
        },
        {
            name: 'Curry de lentilles et riz',
            baseCalories: 600,
            baseProtein: 28,
            baseCarbs: 88,
            baseFats: 12,
            ingredients: [
                { name: 'Lentilles corail', quantity: 100, unit: 'g' },
                { name: 'Riz basmati cuit', quantity: 180, unit: 'g' },
                { name: 'Lait de coco light', quantity: 100, unit: 'ml' },
                { name: 'Épinards', quantity: 150, unit: 'g' },
                { name: 'Curry en poudre', quantity: 1, unit: 'c.à.c' }
            ],
            dessert: {
                name: 'Skyr vanille',
                quantity: 150,
                unit: 'g',
                cal: 100,
                p: 14,
                c: 10,
                f: 0
            }
        },
        {
            name: 'Poisson blanc en papillote, haricots verts',
            baseCalories: 540,
            baseProtein: 48,
            baseCarbs: 52,
            baseFats: 10,
            ingredients: [
                { name: 'Cabillaud', quantity: 200, unit: 'g' },
                { name: 'Pommes de terre vapeur', quantity: 200, unit: 'g' },
                { name: 'Haricots verts', quantity: 200, unit: 'g' },
                { name: 'Tomates cerises', quantity: 100, unit: 'g' },
                { name: 'Herbes fraîches', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Fromage blanc 0% + coulis',
                quantity: 150,
                unit: 'g',
                cal: 65,
                p: 10,
                c: 8,
                f: 0
            }
        },
        {
            name: 'Wok de poulet aux légumes asiatiques',
            baseCalories: 610,
            baseProtein: 46,
            baseCarbs: 68,
            baseFats: 14,
            ingredients: [
                { name: 'Blanc de poulet', quantity: 160, unit: 'g' },
                { name: 'Nouilles de riz', quantity: 150, unit: 'g' },
                { name: 'Légumes wok (poivrons, carottes, chou)', quantity: 200, unit: 'g' },
                { name: 'Sauce soja', quantity: 15, unit: 'ml' },
                { name: 'Huile de sésame', quantity: 5, unit: 'ml' }
            ],
            dessert: {
                name: 'Litchis au sirop léger',
                quantity: 100,
                unit: 'g',
                cal: 70,
                p: 1,
                c: 16,
                f: 0
            }
        },
        {
            name: 'Steak haché, tagliatelles et sauce tomate',
            baseCalories: 650,
            baseProtein: 44,
            baseCarbs: 72,
            baseFats: 18,
            ingredients: [
                { name: 'Steak haché 5%', quantity: 150, unit: 'g' },
                { name: 'Tagliatelles complètes', quantity: 200, unit: 'g' },
                { name: 'Sauce tomate maison', quantity: 150, unit: 'g' },
                { name: 'Parmesan râpé', quantity: 15, unit: 'g' },
                { name: 'Basilic frais', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Mousse de fruits 0%',
                quantity: 100,
                unit: 'g',
                cal: 55,
                p: 3,
                c: 10,
                f: 0
            }
        },
        {
            name: 'Blanquette de veau et riz',
            baseCalories: 620,
            baseProtein: 42,
            baseCarbs: 66,
            baseFats: 16,
            ingredients: [
                { name: 'Veau (blanquette)', quantity: 150, unit: 'g' },
                { name: 'Riz blanc cuit', quantity: 200, unit: 'g' },
                { name: 'Carottes', quantity: 100, unit: 'g' },
                { name: 'Champignons', quantity: 80, unit: 'g' },
                { name: 'Crème fraîche 15%', quantity: 30, unit: 'g' }
            ],
            dessert: {
                name: 'Crème dessert vanille 0%',
                quantity: 125,
                unit: 'g',
                cal: 65,
                p: 4,
                c: 12,
                f: 0
            }
        },
        {
            name: 'Soupe de légumes et tartines fromage',
            baseCalories: 480,
            baseProtein: 26,
            baseCarbs: 60,
            baseFats: 14,
            ingredients: [
                { name: 'Soupe de légumes maison', quantity: 400, unit: 'ml' },
                { name: 'Pain complet', quantity: 80, unit: 'g' },
                { name: 'Fromage', quantity: 40, unit: 'g' },
                { name: 'Jambon blanc', quantity: 40, unit: 'g' }
            ],
            dessert: { name: 'Yaourt nature', quantity: 125, unit: 'g', cal: 65, p: 5, c: 8, f: 2 }
        },
        {
            name: 'Saumon fumé, blinis et salade',
            baseCalories: 560,
            baseProtein: 36,
            baseCarbs: 54,
            baseFats: 20,
            ingredients: [
                { name: 'Saumon fumé', quantity: 100, unit: 'g' },
                { name: 'Blinis', quantity: 6, unit: 'unités' },
                { name: 'Crème fraîche light', quantity: 40, unit: 'g' },
                { name: 'Salade verte', quantity: 150, unit: 'g' }
            ],
            dessert: {
                name: 'Mousse au citron',
                quantity: 80,
                unit: 'g',
                cal: 70,
                p: 3,
                c: 11,
                f: 2
            }
        },
        {
            name: 'Pâtes au pesto et poulet',
            baseCalories: 640,
            baseProtein: 44,
            baseCarbs: 70,
            baseFats: 18,
            ingredients: [
                { name: 'Poulet grillé', quantity: 140, unit: 'g' },
                { name: 'Pâtes complètes', quantity: 200, unit: 'g' },
                { name: 'Pesto maison', quantity: 30, unit: 'g' },
                { name: 'Tomates cerises', quantity: 100, unit: 'g' },
                { name: 'Parmesan', quantity: 15, unit: 'g' }
            ],
            dessert: {
                name: 'Salade de fruits',
                quantity: 150,
                unit: 'g',
                cal: 70,
                p: 1,
                c: 16,
                f: 0
            }
        },
        {
            name: 'Quiche saumon-épinards, salade',
            baseCalories: 610,
            baseProtein: 36,
            baseCarbs: 52,
            baseFats: 26,
            ingredients: [
                { name: 'Part de quiche', quantity: 200, unit: 'g' },
                { name: 'Salade verte', quantity: 150, unit: 'g' },
                { name: 'Vinaigrette light', quantity: 15, unit: 'ml' }
            ],
            dessert: { name: 'Compote', quantity: 100, unit: 'g', cal: 55, p: 0, c: 13, f: 0 }
        },
        {
            name: 'Tarte fine au thon et tomates',
            baseCalories: 580,
            baseProtein: 38,
            baseCarbs: 58,
            baseFats: 20,
            ingredients: [
                { name: 'Pâte feuilletée light', quantity: 100, unit: 'g' },
                { name: 'Thon au naturel', quantity: 120, unit: 'g' },
                { name: 'Tomates', quantity: 150, unit: 'g' },
                { name: 'Moutarde', quantity: 10, unit: 'g' },
                { name: 'Salade', quantity: 100, unit: 'g' }
            ],
            dessert: {
                name: 'Yaourt aux fruits',
                quantity: 125,
                unit: 'g',
                cal: 70,
                p: 6,
                c: 12,
                f: 0
            }
        },
        {
            name: 'Poulet rôti et ratatouille',
            baseCalories: 590,
            baseProtein: 46,
            baseCarbs: 56,
            baseFats: 16,
            ingredients: [
                { name: 'Poulet rôti', quantity: 160, unit: 'g' },
                { name: 'Ratatouille', quantity: 300, unit: 'g' },
                { name: 'Semoule', quantity: 120, unit: 'g' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' }
            ],
            dessert: { name: 'Skyr nature', quantity: 150, unit: 'g', cal: 90, p: 15, c: 6, f: 0 }
        },
        {
            name: 'Salade complète thon-avocat',
            baseCalories: 560,
            baseProtein: 40,
            baseCarbs: 48,
            baseFats: 22,
            ingredients: [
                { name: 'Thon au naturel', quantity: 150, unit: 'g' },
                { name: 'Avocat', quantity: 70, unit: 'g' },
                { name: 'Salade composée', quantity: 200, unit: 'g' },
                { name: 'Pain complet', quantity: 60, unit: 'g' },
                { name: 'Vinaigrette', quantity: 15, unit: 'ml' }
            ],
            dessert: { name: 'Fromage blanc', quantity: 150, unit: 'g', cal: 65, p: 10, c: 8, f: 0 }
        },
        {
            name: 'Gratin de chou-fleur et jambon',
            baseCalories: 570,
            baseProtein: 38,
            baseCarbs: 54,
            baseFats: 20,
            ingredients: [
                { name: 'Chou-fleur', quantity: 300, unit: 'g' },
                { name: 'Jambon blanc', quantity: 100, unit: 'g' },
                { name: 'Béchamel light', quantity: 80, unit: 'g' },
                { name: 'Emmental râpé', quantity: 30, unit: 'g' },
                { name: 'Pain complet', quantity: 50, unit: 'g' }
            ],
            dessert: { name: 'Compote', quantity: 100, unit: 'g', cal: 55, p: 0, c: 13, f: 0 }
        },
        {
            name: 'Poêlée de crevettes et légumes',
            baseCalories: 540,
            baseProtein: 44,
            baseCarbs: 58,
            baseFats: 12,
            ingredients: [
                { name: 'Crevettes', quantity: 180, unit: 'g' },
                { name: 'Riz basmati', quantity: 150, unit: 'g' },
                { name: 'Légumes (poivrons, courgettes)', quantity: 200, unit: 'g' },
                { name: 'Ail et persil', quantity: 5, unit: 'g' },
                { name: "Huile d'olive", quantity: 10, unit: 'ml' }
            ],
            dessert: {
                name: 'Sorbet aux fruits',
                quantity: 80,
                unit: 'g',
                cal: 70,
                p: 0,
                c: 17,
                f: 0
            }
        },
        {
            name: 'Tartare de saumon, riz sushi',
            baseCalories: 620,
            baseProtein: 40,
            baseCarbs: 66,
            baseFats: 20,
            ingredients: [
                { name: 'Saumon frais', quantity: 140, unit: 'g' },
                { name: 'Riz sushi', quantity: 180, unit: 'g' },
                { name: 'Avocat', quantity: 50, unit: 'g' },
                { name: 'Sauce soja', quantity: 15, unit: 'ml' },
                { name: 'Graines de sésame', quantity: 5, unit: 'g' }
            ],
            dessert: {
                name: 'Salade de fruits exotiques',
                quantity: 150,
                unit: 'g',
                cal: 85,
                p: 1,
                c: 20,
                f: 0
            }
        },
        {
            name: 'Burger végétarien et frites légères',
            baseCalories: 630,
            baseProtein: 28,
            baseCarbs: 78,
            baseFats: 20,
            ingredients: [
                { name: 'Pain burger complet', quantity: 100, unit: 'g' },
                { name: 'Steak végétal', quantity: 100, unit: 'g' },
                { name: 'Crudités', quantity: 100, unit: 'g' },
                { name: 'Frites au four', quantity: 150, unit: 'g' },
                { name: 'Sauce', quantity: 20, unit: 'g' }
            ],
            dessert: {
                name: 'Yaourt à la grecque',
                quantity: 150,
                unit: 'g',
                cal: 95,
                p: 8,
                c: 12,
                f: 2
            }
        },
        {
            name: 'Poulet au curry et lait de coco',
            baseCalories: 640,
            baseProtein: 44,
            baseCarbs: 64,
            baseFats: 18,
            ingredients: [
                { name: 'Poulet', quantity: 160, unit: 'g' },
                { name: 'Lait de coco light', quantity: 100, unit: 'ml' },
                { name: 'Curry', quantity: 1, unit: 'c.à.c' },
                { name: 'Riz basmati', quantity: 180, unit: 'g' },
                { name: 'Légumes', quantity: 150, unit: 'g' }
            ],
            dessert: { name: 'Mangue', quantity: 150, unit: 'g', cal: 90, p: 1, c: 22, f: 0 }
        },
        {
            name: 'Wrap thon-avocat-crudités',
            baseCalories: 570,
            baseProtein: 38,
            baseCarbs: 58,
            baseFats: 18,
            ingredients: [
                { name: 'Tortilla complète', quantity: 80, unit: 'g' },
                { name: 'Thon au naturel', quantity: 120, unit: 'g' },
                { name: 'Avocat', quantity: 50, unit: 'g' },
                { name: 'Crudités', quantity: 100, unit: 'g' },
                { name: 'Sauce yaourt', quantity: 30, unit: 'g' }
            ],
            dessert: { name: 'Pomme', quantity: 1, unit: 'unité', cal: 75, p: 0, c: 18, f: 0 }
        },
        {
            name: 'Pizza maison légère',
            baseCalories: 660,
            baseProtein: 36,
            baseCarbs: 76,
            baseFats: 22,
            ingredients: [
                { name: 'Pâte à pizza complète', quantity: 150, unit: 'g' },
                { name: 'Sauce tomate', quantity: 80, unit: 'g' },
                { name: 'Mozzarella light', quantity: 60, unit: 'g' },
                { name: 'Légumes', quantity: 100, unit: 'g' },
                { name: 'Jambon ou poulet', quantity: 50, unit: 'g' }
            ],
            dessert: {
                name: 'Salade de fruits',
                quantity: 150,
                unit: 'g',
                cal: 70,
                p: 1,
                c: 16,
                f: 0
            }
        },
        {
            name: 'Soupe miso et edamame',
            baseCalories: 520,
            baseProtein: 32,
            baseCarbs: 64,
            baseFats: 12,
            ingredients: [
                { name: 'Soupe miso', quantity: 300, unit: 'ml' },
                { name: 'Tofu', quantity: 100, unit: 'g' },
                { name: 'Edamame', quantity: 100, unit: 'g' },
                { name: 'Riz blanc', quantity: 150, unit: 'g' },
                { name: 'Algues wakame', quantity: 10, unit: 'g' }
            ],
            dessert: {
                name: 'Thé vert et mochi',
                quantity: 2,
                unit: 'unités',
                cal: 75,
                p: 1,
                c: 16,
                f: 1
            }
        },
        {
            name: 'Brochettes de poulet et tatziki',
            baseCalories: 580,
            baseProtein: 46,
            baseCarbs: 58,
            baseFats: 14,
            ingredients: [
                { name: 'Brochettes de poulet', quantity: 170, unit: 'g' },
                { name: 'Riz pilaf', quantity: 160, unit: 'g' },
                { name: 'Tatziki', quantity: 60, unit: 'g' },
                { name: 'Salade grecque', quantity: 150, unit: 'g' }
            ],
            dessert: {
                name: 'Yaourt grec miel',
                quantity: 150,
                unit: 'g',
                cal: 120,
                p: 8,
                c: 16,
                f: 3
            }
        },
        {
            name: 'Pavé de truite aux amandes',
            baseCalories: 600,
            baseProtein: 42,
            baseCarbs: 60,
            baseFats: 18,
            ingredients: [
                { name: 'Truite', quantity: 160, unit: 'g' },
                { name: 'Amandes effilées', quantity: 20, unit: 'g' },
                { name: 'Pommes de terre vapeur', quantity: 200, unit: 'g' },
                { name: 'Brocoli', quantity: 200, unit: 'g' },
                { name: 'Beurre', quantity: 10, unit: 'g' }
            ],
            dessert: {
                name: 'Compote de rhubarbe',
                quantity: 100,
                unit: 'g',
                cal: 50,
                p: 0,
                c: 12,
                f: 0
            }
        },
        {
            name: 'Chakchouka et pain pita',
            baseCalories: 550,
            baseProtein: 28,
            baseCarbs: 62,
            baseFats: 20,
            ingredients: [
                { name: 'Oeufs', quantity: 3, unit: 'unités' },
                { name: 'Sauce tomate épicée', quantity: 150, unit: 'g' },
                { name: 'Poivrons', quantity: 100, unit: 'g' },
                { name: 'Pain pita', quantity: 100, unit: 'g' },
                { name: 'Feta', quantity: 30, unit: 'g' }
            ],
            dessert: { name: 'Orange', quantity: 1, unit: 'unité', cal: 60, p: 1, c: 14, f: 0 }
        }
    ]
};

// Export global
window.NutritionMealsDatabase = NutritionMealsDatabase;
console.log('✅ Base de données de 100+ repas chargée');
