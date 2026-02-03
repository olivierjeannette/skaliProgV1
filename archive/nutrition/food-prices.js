/**
 * BASE DE DONNÉES DES PRIX ALIMENTAIRES MOYENS EN FRANCE (2025)
 * Prix moyens au kg/litre, sources : INSEE, Open Prices, moyennes supermarchés
 */

const FoodPrices = {
    // PROTÉINES ANIMALES
    proteins: {
        // Viandes blanches (économiques)
        'poulet': { price: 8.50, unit: 'kg', category: 'economique' },
        'dinde': { price: 9.00, unit: 'kg', category: 'economique' },
        'blanc de poulet': { price: 12.00, unit: 'kg', category: 'economique' },

        // Viandes rouges
        'boeuf haché 5%': { price: 14.00, unit: 'kg', category: 'moyen' },
        'boeuf haché 15%': { price: 11.00, unit: 'kg', category: 'economique' },
        'steak de boeuf': { price: 18.00, unit: 'kg', category: 'moyen' },
        'rôti de boeuf': { price: 16.00, unit: 'kg', category: 'moyen' },
        'porc (côtes)': { price: 10.00, unit: 'kg', category: 'economique' },
        'rôti de porc': { price: 9.00, unit: 'kg', category: 'economique' },

        // Poissons (chers)
        'saumon': { price: 28.00, unit: 'kg', category: 'cher' },
        'cabillaud': { price: 22.00, unit: 'kg', category: 'cher' },
        'colin': { price: 15.00, unit: 'kg', category: 'moyen' },
        'thon en conserve': { price: 15.00, unit: 'kg', category: 'moyen' },
        'sardines en conserve': { price: 12.00, unit: 'kg', category: 'economique' },
        'maquereau': { price: 8.00, unit: 'kg', category: 'economique' },

        // Oeufs et produits laitiers
        'oeufs': { price: 3.50, unit: '12 unités', category: 'economique' },
        'fromage blanc 0%': { price: 2.80, unit: 'kg', category: 'economique' },
        'fromage blanc 20%': { price: 3.20, unit: 'kg', category: 'economique' },
        'yaourt nature': { price: 2.50, unit: 'kg', category: 'economique' },
        'lait demi-écrémé': { price: 1.20, unit: 'L', category: 'economique' },
        'emmental': { price: 12.00, unit: 'kg', category: 'moyen' },
        'mozzarella': { price: 10.00, unit: 'kg', category: 'moyen' },

        // Protéines végétales
        'tofu nature': { price: 8.00, unit: 'kg', category: 'moyen' },
        'tofu fumé': { price: 9.00, unit: 'kg', category: 'moyen' },
        'tempeh': { price: 10.00, unit: 'kg', category: 'moyen' }
    },

    // FÉCULENTS & CÉRÉALES
    carbs: {
        // Riz (économique)
        'riz basmati': { price: 3.50, unit: 'kg', category: 'economique' },
        'riz complet': { price: 3.80, unit: 'kg', category: 'economique' },
        'riz blanc': { price: 2.50, unit: 'kg', category: 'economique' },

        // Pâtes (très économique)
        'pâtes complètes': { price: 2.80, unit: 'kg', category: 'economique' },
        'pâtes blanches': { price: 1.80, unit: 'kg', category: 'economique' },
        'spaghetti': { price: 2.00, unit: 'kg', category: 'economique' },
        'penne': { price: 2.00, unit: 'kg', category: 'economique' },

        // Pommes de terre (très économique)
        'pommes de terre': { price: 1.50, unit: 'kg', category: 'economique' },
        'patates douces': { price: 3.00, unit: 'kg', category: 'economique' },

        // Pain
        'pain complet': { price: 4.00, unit: 'kg', category: 'economique' },
        'pain blanc': { price: 3.50, unit: 'kg', category: 'economique' },
        'pain de mie complet': { price: 3.00, unit: 'kg', category: 'economique' },

        // Légumineuses (très économique et protéines)
        'lentilles vertes': { price: 4.00, unit: 'kg', category: 'economique' },
        'lentilles corail': { price: 4.50, unit: 'kg', category: 'economique' },
        'pois chiches': { price: 3.80, unit: 'kg', category: 'economique' },
        'haricots rouges': { price: 3.50, unit: 'kg', category: 'economique' },
        'haricots blancs': { price: 3.50, unit: 'kg', category: 'economique' },

        // Autres céréales
        'quinoa': { price: 8.00, unit: 'kg', category: 'moyen' },
        'boulgour': { price: 4.00, unit: 'kg', category: 'economique' },
        'semoule': { price: 2.50, unit: 'kg', category: 'economique' },
        'flocons d\'avoine': { price: 3.50, unit: 'kg', category: 'economique' }
    },

    // LÉGUMES
    vegetables: {
        // Légumes frais économiques
        'carottes': { price: 1.80, unit: 'kg', category: 'economique' },
        'oignons': { price: 2.00, unit: 'kg', category: 'economique' },
        'poireaux': { price: 3.00, unit: 'kg', category: 'economique' },
        'choux': { price: 2.50, unit: 'kg', category: 'economique' },
        'brocoli': { price: 4.00, unit: 'kg', category: 'economique' },
        'chou-fleur': { price: 3.50, unit: 'kg', category: 'economique' },
        'courgettes': { price: 3.00, unit: 'kg', category: 'economique' },
        'aubergines': { price: 3.50, unit: 'kg', category: 'economique' },
        'poivrons': { price: 4.50, unit: 'kg', category: 'economique' },
        'tomates': { price: 4.00, unit: 'kg', category: 'economique' },
        'concombres': { price: 2.50, unit: 'kg', category: 'economique' },
        'salades': { price: 8.00, unit: 'kg', category: 'moyen' },
        'épinards frais': { price: 5.00, unit: 'kg', category: 'economique' },
        'haricots verts': { price: 6.00, unit: 'kg', category: 'moyen' },
        'champignons': { price: 8.00, unit: 'kg', category: 'moyen' },

        // Légumes surgelés (économiques)
        'brocoli surgelé': { price: 3.00, unit: 'kg', category: 'economique' },
        'haricots verts surgelés': { price: 3.50, unit: 'kg', category: 'economique' },
        'épinards surgelés': { price: 3.00, unit: 'kg', category: 'economique' },
        'mélange légumes surgelés': { price: 3.50, unit: 'kg', category: 'economique' }
    },

    // FRUITS
    fruits: {
        'bananes': { price: 2.00, unit: 'kg', category: 'economique' },
        'pommes': { price: 2.50, unit: 'kg', category: 'economique' },
        'poires': { price: 3.00, unit: 'kg', category: 'economique' },
        'oranges': { price: 2.50, unit: 'kg', category: 'economique' },
        'clémentines': { price: 3.00, unit: 'kg', category: 'economique' },
        'kiwis': { price: 4.00, unit: 'kg', category: 'economique' },
        'fraises': { price: 8.00, unit: 'kg', category: 'moyen' },
        'myrtilles': { price: 12.00, unit: 'kg', category: 'cher' },
        'framboises': { price: 15.00, unit: 'kg', category: 'cher' },
        'raisin': { price: 5.00, unit: 'kg', category: 'moyen' },
        'melon': { price: 3.00, unit: 'kg', category: 'economique' },
        'pastèque': { price: 2.00, unit: 'kg', category: 'economique' },
        'fruits rouges surgelés': { price: 6.00, unit: 'kg', category: 'economique' }
    },

    // MATIÈRES GRASSES
    fats: {
        'huile d\'olive': { price: 12.00, unit: 'L', category: 'moyen' },
        'huile de colza': { price: 5.00, unit: 'L', category: 'economique' },
        'huile de tournesol': { price: 3.50, unit: 'L', category: 'economique' },
        'beurre': { price: 15.00, unit: 'kg', category: 'moyen' },
        'beurre de cacahuète': { price: 6.00, unit: 'kg', category: 'economique' },
        'amandes': { price: 18.00, unit: 'kg', category: 'cher' },
        'noix': { price: 20.00, unit: 'kg', category: 'cher' },
        'noisettes': { price: 18.00, unit: 'kg', category: 'cher' },
        'avocat': { price: 8.00, unit: 'kg', category: 'moyen' }
    },

    // ÉPICES & CONDIMENTS
    spices: {
        'sel': { price: 1.00, unit: 'kg', category: 'economique' },
        'poivre noir': { price: 20.00, unit: 'kg', category: 'moyen' },
        'curcuma': { price: 15.00, unit: 'kg', category: 'moyen' },
        'paprika': { price: 18.00, unit: 'kg', category: 'moyen' },
        'curry': { price: 15.00, unit: 'kg', category: 'moyen' },
        'herbes de provence': { price: 25.00, unit: 'kg', category: 'moyen' },
        'ail': { price: 8.00, unit: 'kg', category: 'economique' },
        'échalotes': { price: 6.00, unit: 'kg', category: 'economique' },
        'persil': { price: 30.00, unit: 'kg', category: 'moyen' },
        'coriandre': { price: 30.00, unit: 'kg', category: 'moyen' },
        'basilic': { price: 35.00, unit: 'kg', category: 'moyen' }
    },

    /**
     * Obtenir le prix d'un aliment
     * @param foodName
     */
    getPrice(foodName) {
        foodName = foodName.toLowerCase().trim();

        // Chercher dans toutes les catégories
        for (const category of Object.values(this)) {
            if (typeof category === 'object' && category[foodName]) {
                return category[foodName];
            }
        }

        // Prix par défaut si non trouvé
        return { price: 5.00, unit: 'kg', category: 'moyen' };
    },

    /**
     * Obtenir tous les aliments d'une catégorie budgétaire
     * @param budgetCategory
     */
    getFoodsByBudgetCategory(budgetCategory) {
        const foods = [];

        for (const [categoryName, category] of Object.entries(this)) {
            if (typeof category === 'object') {
                for (const [foodName, details] of Object.entries(category)) {
                    if (details.category === budgetCategory) {
                        foods.push({ name: foodName, ...details, type: categoryName });
                    }
                }
            }
        }

        return foods;
    },

    /**
     * Calculer le coût d'une quantité d'aliment
     * @param foodName
     * @param quantityInGrams
     */
    calculateCost(foodName, quantityInGrams) {
        const food = this.getPrice(foodName);
        const quantityInKg = quantityInGrams / 1000;
        return food.price * quantityInKg;
    }
};

// Exposer globalement
window.FoodPrices = FoodPrices;
