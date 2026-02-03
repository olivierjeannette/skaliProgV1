/**
 * NUTRITION PDF GENERATOR
 * Génération de PDFs professionnels pour les plans nutritionnels
 * Format paysage (landscape) pour une meilleure visibilité
 */

const NutritionPDF = {
    /**
     * Générer le PDF complet du plan nutritionnel
     * @param mealPlan
     * @param macros
     * @param planData
     * @param member
     * @param days
     * @param onProgress
     */
    async generatePDF(mealPlan, macros, planData, member, days, onProgress = null) {
        console.log('📄 Génération PDF professionnel...');

        // Vérifier que jsPDF est chargé
        if (typeof jspdf === 'undefined') {
            throw new Error('jsPDF n\'est pas chargé. Ajoutez la bibliothèque jsPDF.');
        }

        const { jsPDF } = jspdf;
        const doc = new jsPDF({
            orientation: 'landscape', // Format paysage
            unit: 'mm',
            format: 'a4'
        });

        // Dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        let currentY = margin;

        // 1. Préparation
        if (onProgress) {await onProgress(10, 'Préparation des données...', 'step1');}
        await new Promise(resolve => setTimeout(resolve, 200));

        // 2. Page de couverture
        if (onProgress) {await onProgress(20, 'Création de la page de couverture...', 'step2');}
        await this.addCoverPage(doc, member, macros, planData, days);
        await new Promise(resolve => setTimeout(resolve, 200));

        // 3. Page de conseils personnalisés
        if (onProgress) {await onProgress(40, 'Ajout des conseils personnalisés...', 'step2');}
        doc.addPage();
        this.addTipsPage(doc, member, macros, planData);
        await new Promise(resolve => setTimeout(resolve, 200));

        // 4. Pages de repas (une page par jour ou semaine selon le nombre)
        if (onProgress) {await onProgress(60, 'Génération des repas...', 'step3');}
        const shoppingList = NutritionAIGenerator.generateShoppingList(mealPlan);

        if (days <= 7) {
            // Affichage détaillé jour par jour
            for (let i = 0; i < mealPlan.days.length; i++) {
                doc.addPage();
                await this.addDayDetailPage(doc, mealPlan.days[i], i + 1, macros, member);
            }
        } else {
            // Affichage condensé par semaine
            for (let week = 0; week < Math.ceil(days / 7); week++) {
                const weekDays = mealPlan.days.slice(week * 7, (week + 1) * 7);
                doc.addPage();
                await this.addWeekSummaryPage(doc, weekDays, week + 1, macros);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 200));

        // 5. Page liste de courses
        if (onProgress) {await onProgress(80, 'Ajout de la liste de courses...', 'step4');}
        doc.addPage();
        this.addShoppingListPage(doc, shoppingList, days);
        await new Promise(resolve => setTimeout(resolve, 200));

        // 6. Footer sur toutes les pages
        if (onProgress) {await onProgress(90, 'Finalisation du document...', 'step5');}
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            this.addFooter(doc, i, totalPages);
        }
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log('✅ PDF généré avec succès');
        return doc;
    },

    /**
     * Page de couverture
     * @param doc
     * @param member
     * @param macros
     * @param planData
     * @param days
     */
    async addCoverPage(doc, member, macros, planData, days) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const centerX = pageWidth / 2;

        // Fond dégradé (simulé avec des rectangles)
        doc.setFillColor(17, 24, 39); // Gris foncé
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Logo (si disponible)
        try {
            const logoPath = 'js/img/logo.png';
            // En production, charger l'image en base64
            // doc.addImage(logoData, 'PNG', centerX - 30, 20, 60, 60);
        } catch (error) {
            console.log('Logo non chargé');
        }

        // Titre principal
        doc.setFontSize(36);
        doc.setTextColor(34, 197, 94); // Vert
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN NUTRITIONNEL', centerX, 60, { align: 'center' });

        // Sous-titre
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text(NutritionPro.OBJECTIVES[planData.objective].name, centerX, 75, { align: 'center' });

        // Informations membre (plus grand)
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(member.name, centerX, 95, { align: 'center' });

        // Ligne décorative
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(2);
        doc.line(centerX - 60, 102, centerX + 60, 102);

        // Informations du plan (centrées et espacées)
        doc.setFontSize(12);
        doc.setTextColor(209, 213, 219);
        doc.setFont('helvetica', 'normal');

        const infoY = 120;

        // Afficher la durée selon le nombre de jours
        let durationText;
        if (days === 1) {
            durationText = '1 jour';
        } else if (days === 7) {
            durationText = '1 semaine';
        } else if (days === 30) {
            durationText = '1 mois (4 semaines)';
        } else {
            const weeks = Math.floor(days / 7);
            durationText = `${weeks} semaine${weeks > 1 ? 's' : ''} (${days} jours)`;
        }

        // Informations centrées
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text(`Durée: ${durationText}`, centerX, infoY, { align: 'center' });

        doc.setFontSize(11);
        doc.setTextColor(156, 163, 175);
        doc.setFont('helvetica', 'normal');
        doc.text(`Repas par jour: ${planData.mealsPerDay || 4}`, centerX, infoY + 12, { align: 'center' });
        doc.text(`Début: ${new Date().toLocaleDateString('fr-FR')}`, centerX, infoY + 22, { align: 'center' });

        // Restrictions (si présentes)
        let currentY = infoY + 35;
        if (planData.allergies?.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(239, 68, 68);
            doc.setFont('helvetica', 'bold');
            doc.text('Allergies:', centerX, currentY, { align: 'center' });

            doc.setTextColor(209, 213, 219);
            doc.setFont('helvetica', 'normal');
            const allergiesText = planData.allergies.join(', ');
            const allergiesLines = doc.splitTextToSize(allergiesText, pageWidth - 80);
            doc.text(allergiesLines, centerX, currentY + 6, { align: 'center' });
            currentY += 6 + (allergiesLines.length * 5);
        }

        if (planData.regimes?.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text('Régimes:', centerX, currentY, { align: 'center' });

            doc.setTextColor(209, 213, 219);
            doc.setFont('helvetica', 'normal');
            const regimesText = planData.regimes.join(', ');
            const regimesLines = doc.splitTextToSize(regimesText, pageWidth - 80);
            doc.text(regimesLines, centerX, currentY + 6, { align: 'center' });
        }

        // Pas de footer sur la page de couverture (sera ajouté par addFooter)
    },

    /**
     * Page de conseils personnalisés
     * @param doc
     * @param member
     * @param macros
     * @param planData
     */
    addTipsPage(doc, member, macros, planData) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // Header
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 25, 'F');

        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('CONSEILS PERSONNALISÉS', pageWidth / 2, 16, { align: 'center' });

        let currentY = 35;

        // Générer les conseils personnalisés
        const tips = this.generatePersonalizedTips(member, macros, planData);

        // Colonne unique pour les tips
        const colWidth = pageWidth - (2 * margin);
        const maxTextWidth = colWidth - 10;

        tips.forEach((tip, index) => {
            // Vérifier si on dépasse la page
            if (currentY > pageHeight - 60) {
                doc.addPage();
                // Ré-ajouter header
                doc.setFillColor(34, 197, 94);
                doc.rect(0, 0, pageWidth, 20, 'F');
                doc.setFontSize(18);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text('CONSEILS PERSONNALISÉS (suite)', pageWidth / 2, 13, { align: 'center' });
                currentY = 30;
            }

            // Carte du conseil
            const cardHeight = this.estimateTipHeight(doc, tip, maxTextWidth);

            // Fond de carte
            doc.setFillColor(31, 41, 55);
            doc.roundedRect(margin, currentY, colWidth, cardHeight, 3, 3, 'F');

            // Titre seulement (pas d'emoji pour éviter problèmes encodage)
            doc.setFontSize(12);
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text(tip.title, margin + 5, currentY + 8);

            // Description
            doc.setFontSize(9);
            doc.setTextColor(209, 213, 219);
            doc.setFont('helvetica', 'normal');
            const descLines = doc.splitTextToSize(tip.description, maxTextWidth - 10);
            doc.text(descLines, margin + 5, currentY + 16);

            currentY += cardHeight + 5;
        });

        // Plus de phrases motivationnelles
    },

    /**
     * Estimer la hauteur d'une carte de conseil
     * @param doc
     * @param tip
     * @param maxWidth
     */
    estimateTipHeight(doc, tip, maxWidth) {
        const descLines = doc.splitTextToSize(tip.description, maxWidth - 10);
        return 16 + (descLines.length * 4) + 5;
    },

    /**
     * Générer des conseils personnalisés selon profil
     * @param member
     * @param macros
     * @param planData
     */
    generatePersonalizedTips(member, macros, planData) {
        const tips = [];
        const age = NutritionCalculator.calculateAge(member.birthdate);
        const objective = planData.objective;
        const hydration = NutritionCalculator.calculateHydration(member.weight);

        // Conseil hydratation (toujours présent)
        tips.push({
            icon: '💧',
            title: 'Hydratation optimale',
            description: `Buvez au minimum ${hydration.liters}L d'eau par jour (environ ${hydration.glasses} verres). Augmentez cette quantité les jours d'entraînement. L'eau améliore la performance, la récupération et aide à contrôler l'appétit.`
        });

        // Conseils selon objectif
        if (objective === 'mass_gain') {
            tips.push({
                icon: '🏋️',
                title: 'Prise de masse : Surplus calorique contrôlé',
                description: `Votre objectif nécessite ${macros.targetCalories} kcal/jour. Mangez toutes les 3-4h pour maintenir un apport constant. Privilégiez les glucides complexes (riz, pâtes, patates douces) autour de l'entraînement.`
            });

            tips.push({
                icon: '🥩',
                title: 'Protéines : La clé de la construction musculaire',
                description: `Consommez ${macros.macros.protein.grams}g de protéines par jour, réparties sur ${planData.mealsPerDay || 4} repas. Visez 20-40g par repas. Sources : viandes maigres, poissons, œufs, légumineuses, produits laitiers.`
            });

            tips.push({
                icon: '⏰',
                title: 'Timing nutritionnel',
                description: 'Prenez un repas riche en protéines et glucides dans les 2h suivant votre entraînement. Votre fenêtre anabolique est optimale pour la construction musculaire durant cette période.'
            });

        } else if (objective === 'weight_loss') {
            tips.push({
                icon: '🔥',
                title: 'Perte de poids : Déficit calorique durable',
                description: `Votre plan est calibré à ${macros.targetCalories} kcal/jour pour une perte progressive et saine. Évitez les déficits trop agressifs qui ralentissent le métabolisme et causent de la fatigue.`
            });

            tips.push({
                icon: '🚫',
                title: 'Évitez les pièges caloriques',
                description: 'Limitez les sucres rapides (sodas, pâtisseries, bonbons) et les produits ultra-transformés riches en graisses cachées. Privilégiez les aliments à faible densité calorique et haute densité nutritionnelle (légumes, protéines maigres).'
            });

            tips.push({
                icon: '🥗',
                title: 'Satiété optimale',
                description: 'Remplissez la moitié de votre assiette de légumes à chaque repas. Les fibres augmentent la satiété et ralentissent l\'absorption des glucides. Commencez vos repas par les légumes et protéines.'
            });

            tips.push({
                icon: '😴',
                title: 'Sommeil et gestion du stress',
                description: 'Dormez 7-9h par nuit. Le manque de sommeil augmente la ghréline (hormone de la faim) et réduit la leptine (satiété). Le stress chronique élève le cortisol, favorisant le stockage abdominal.'
            });

        } else if (objective === 'maintenance') {
            tips.push({
                icon: '⚖️',
                title: 'Équilibre et stabilité',
                description: `Votre plan maintient votre poids actuel à ${macros.targetCalories} kcal/jour. Pesez-vous chaque semaine et ajustez légèrement (+/- 100-200 kcal) si vous prenez ou perdez du poids involontairement.`
            });

            tips.push({
                icon: '🍽️',
                title: 'Flexibilité alimentaire',
                description: 'Suivez le plan 80-90% du temps, autorisez-vous 10-20% de flexibilité pour vos repas sociaux. La cohérence long-terme prime sur la perfection court-terme.'
            });

        } else if (objective === 'performance') {
            tips.push({
                icon: '⚡',
                title: 'Performance : Carburant de qualité',
                description: `Vos ${macros.targetCalories} kcal soutiennent vos performances. Augmentez légèrement les glucides (+50-100g) les jours d'entraînements intenses ou compétitions. Réduisez-les les jours de repos.`
            });

            tips.push({
                icon: '🍌',
                title: 'Nutrition pré-entraînement',
                description: '2-3h avant : repas complet (glucides + protéines). 30-60min avant : collation légère (banane, compote, toast). Évitez les graisses et fibres excessives qui ralentissent la digestion.'
            });

            tips.push({
                icon: '🥤',
                title: 'Récupération post-effort',
                description: 'Dans les 30min après l\'effort : glucides rapides + protéines (ratio 3:1). Exemples : shake whey + banane, yaourt grec + miel + fruits. Reconstituez vos réserves de glycogène rapidement.'
            });
        }

        // Conseils selon âge
        if (age >= 40) {
            tips.push({
                icon: '🦴',
                title: `Conseils pour ${age} ans : Santé osseuse et articulaire`,
                description: 'Assurez-vous d\'un apport suffisant en calcium (1000-1200mg/jour) et vitamine D. Privilégiez les oméga-3 (poissons gras) pour réduire l\'inflammation articulaire. La protéine devient encore plus importante pour préserver la masse musculaire.'
            });
        }

        if (age < 25 && objective === 'mass_gain') {
            tips.push({
                icon: '💪',
                title: 'Jeune athlète : Maximisez votre potentiel',
                description: 'Votre taux de testostérone naturel est optimal. Profitez-en pour construire une base solide. Ne négligez pas les micronutriments (zinc, magnésium, vitamines B) essentiels à la croissance.'
            });
        }

        // Conseils selon genre
        if (member.gender === 'female') {
            tips.push({
                icon: '🌸',
                title: 'Nutrition au féminin',
                description: 'Assurez un apport suffisant en fer (18mg/jour) surtout durant les menstruations. Le calcium et la vitamine D sont essentiels pour la santé osseuse. Les variations hormonales peuvent affecter l\'appétit et la rétention d\'eau : ne vous fiez pas uniquement au poids.'
            });
        }

        // Conseil général sur les produits transformés
        tips.push({
            icon: '🥦',
            title: 'Privilégiez le fait maison',
            description: '80% de vos repas devraient être composés d\'aliments bruts et peu transformés. Cuisinez vos repas à l\'avance (meal prep) pour contrôler la qualité et éviter les tentations. Les produits ultra-transformés sont riches en additifs, sodium et sucres cachés.'
        });

        // Conseil supplémentation (si nécessaire)
        if (macros.macros.protein.grams >= 150) {
            tips.push({
                icon: '💊',
                title: 'Supplémentation intelligente',
                description: `Avec ${macros.macros.protein.grams}g de protéines/jour, une whey peut faciliter l'atteinte de vos objectifs. Considérez aussi : créatine (5g/jour), vitamine D3, oméga-3, magnésium selon vos besoins et budget.`
            });
        }

        // Conseil tracking
        tips.push({
            icon: '📊',
            title: 'Suivez vos progrès',
            description: 'Prenez vos mesures (poids, tour de taille, photos) chaque semaine au même moment. Le poids fluctue naturellement (+/- 1-2kg). Analysez la tendance sur 2-4 semaines, pas au jour le jour. La cohérence bat la perfection.'
        });

        return tips;
    },

    /**
     * Citation motivationnelle selon objectif
     * @param objective
     */
    getMotivationalQuote(objective) {
        const quotes = {
            'mass_gain': 'La construction musculaire est un marathon, pas un sprint.\nPatience et régularité. 💪',
            'weight_loss': 'La transformation ne se fait pas en un jour,\nmais chaque jour compte. 🔥',
            'lean_mass': 'Construire du muscle tout en restant affûté,\nc\'est l\'art de la discipline et de la précision. ⚡',
            'maintenance': 'L\'équilibre n\'est pas quelque chose qu\'on trouve,\nc\'est quelque chose qu\'on crée. ⚖️',
            'performance': 'L\'excellence n\'est pas une destination,\nc\'est un voyage continu. 🚀',
            'strength': 'La force ne vient pas du corps,\nelle vient de la volonté. 💪',
            'endurance': 'L\'endurance, c\'est tenir bon\nquand tout le monde abandonne. 🏃',
            'recomp': 'Transformer son corps demande de la patience,\nchaque petit progrès compte. 🔄'
        };
        return quotes[objective] || 'Votre corps peut tout accomplir.\nC\'est votre esprit qu\'il faut convaincre. 🎯';
    },

    /**
     * Page détaillée d'un jour
     * @param doc
     * @param day
     * @param dayNumber
     * @param macros
     * @param member
     */
    async addDayDetailPage(doc, day, dayNumber, macros, member) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let currentY = margin;

        // Header du jour avec couleur selon le type
        let headerColor = [34, 197, 94]; // Vert par défaut
        let profileLabel = '';

        if (day.profileType === 'rest') {
            headerColor = [30, 64, 175]; // Bleu repos
            profileLabel = 'REPOS';
        } else if (day.profileType === 'cardio') {
            headerColor = [185, 28, 28]; // Rouge cardio
            profileLabel = 'CARDIO';
        } else if (day.profileType === 'training') {
            headerColor = [180, 83, 9]; // Orange renfo
            profileLabel = 'RENFORCEMENT';
        }

        doc.setFillColor(...headerColor);
        doc.rect(0, 0, pageWidth, 25, 'F');

        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`JOUR ${dayNumber} - ${day.dayName || 'Jour ' + dayNumber}`, margin, 16);

        // Badge du profil
        if (profileLabel) {
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 200);
            doc.text(`[${profileLabel}]`, margin, 22);
        }

        // Macros du jour
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(`${day.totalMacros.calories} kcal | P: ${day.totalMacros.protein}g | G: ${day.totalMacros.carbs}g | L: ${day.totalMacros.fats}g`, pageWidth - margin, 16, { align: 'right' });

        currentY = 35;

        // Déterminer la disposition selon le nombre de repas
        const numMeals = day.meals.length;
        let mealsPerRow, numRows;

        if (numMeals <= 3) {
            // 3 repas : 3 colonnes sur 1 ligne
            mealsPerRow = 3;
            numRows = 1;
        } else if (numMeals === 4) {
            // 4 repas : 2x2
            mealsPerRow = 2;
            numRows = 2;
        } else if (numMeals === 5) {
            // 5 repas : 3 en haut, 2 en bas
            mealsPerRow = 3;
            numRows = 2;
        } else {
            // 6 repas : 3x2
            mealsPerRow = 3;
            numRows = 2;
        }

        const mealWidth = (pageWidth - ((mealsPerRow + 1) * margin)) / mealsPerRow;
        const mealHeight = 70;

        for (let i = 0; i < day.meals.length; i++) {
            const meal = day.meals[i];

            // Calcul de la position
            let col, row;
            if (numMeals === 5) {
                // Disposition spéciale pour 5 repas : 3-2
                if (i < 3) {
                    col = i;
                    row = 0;
                } else {
                    col = i - 3;
                    row = 1;
                    // Centrer les 2 derniers
                    const offset = mealWidth / 2 + margin / 2;
                    col = i - 3;
                    const x = margin + offset + (col * (mealWidth + margin));
                    const y = currentY + (row * (mealHeight + 10));

                    this.drawMealCard(doc, meal, x, y, mealWidth, mealHeight);
                    continue;
                }
            } else {
                col = i % mealsPerRow;
                row = Math.floor(i / mealsPerRow);
            }

            const x = margin + (col * (mealWidth + margin));
            const y = currentY + (row * (mealHeight + 10));

            this.drawMealCard(doc, meal, x, y, mealWidth, mealHeight);
        }
    },

    /**
     * Convertir les quantités >1000g en kg
     * @param quantity
     * @param unit
     */
    formatQuantity(quantity, unit) {
        if (unit === 'g' && quantity >= 1000) {
            return `${(quantity / 1000).toFixed(1)}kg`;
        }
        return `${Math.round(quantity)}${unit}`;
    },

    /**
     * Dessiner une carte de repas
     * @param doc
     * @param meal
     * @param x
     * @param y
     * @param width
     * @param height
     */
    drawMealCard(doc, meal, x, y, width, height) {
        // Carte du repas
        doc.setFillColor(31, 41, 55);
        doc.roundedRect(x, y, width, height, 3, 3, 'F');

        const padding = 7;
        const maxWidth = width - (2 * padding);

        let currentY = y + 9;

        // Type de repas avec horaire
        doc.setFontSize(11);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        const mealHeader = meal.time ? `${meal.type.toUpperCase()} - ${meal.time}` : meal.type.toUpperCase();
        doc.text(mealHeader, x + padding, currentY);
        currentY += 7;

        // Nom du repas (affichage complet sur plusieurs lignes si nécessaire)
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        const nameLines = doc.splitTextToSize(meal.name, maxWidth);
        // Limiter à 2 lignes maximum pour le titre
        const displayNameLines = nameLines.slice(0, 2);
        displayNameLines.forEach(line => {
            doc.text(line, x + padding, currentY);
            currentY += 5;
        });

        currentY += 2; // Espace avant macros

        // Macros (taille augmentée)
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.setFont('helvetica', 'normal');
        const macrosText = `${meal.macros.calories}kcal | P:${meal.macros.protein}g G:${meal.macros.carbs}g L:${meal.macros.fats}g`;
        doc.text(macrosText, x + padding, currentY);
        currentY += 5; // IMPORTANT : incrémenter currentY après les macros

        // Séparer les ingrédients principaux des desserts
        const mainIngredients = [];
        const dessertIngredients = [];
        const supplementsList = [];

        meal.ingredients.forEach(ing => {
            const name = ing.name.toLowerCase();
            if (name.includes('dessert') || name.includes('yaourt') || name.includes('fromage blanc') ||
                name.includes('fruit') || name.includes('compote') || name.includes('sorbet') ||
                name.includes('glace')) {
                dessertIngredients.push(ing);
            } else {
                mainIngredients.push(ing);
            }
        });

        // Ajouter les compléments alimentaires s'il y en a
        if (meal.supplements && meal.supplements.length > 0) {
            meal.supplements.forEach(supp => {
                supplementsList.push(supp);
            });
        }

        // Ingrédients principaux (taille augmentée)
        doc.setFontSize(8);
        doc.setTextColor(209, 213, 219);
        doc.setFont('helvetica', 'normal');
        const maxIngredY = y + height - 4; // Limite basse
        let displayedIngredients = 0;

        for (let i = 0; i < mainIngredients.length; i++) {
            if (currentY >= maxIngredY) {break;}

            const ing = mainIngredients[i];
            const formattedQty = this.formatQuantity(ing.quantity, ing.unit);
            const text = `• ${ing.name}: ${formattedQty}`;
            const lines = doc.splitTextToSize(text, maxWidth);

            // Afficher seulement si ça rentre (espacement augmenté)
            if (currentY + (lines.length * 4.5) <= maxIngredY) {
                // Afficher toutes les lignes de l'ingrédient
                lines.forEach(line => {
                    doc.text(line, x + padding, currentY);
                    currentY += 4.5; // Espacement augmenté
                });
                displayedIngredients++;
            } else {
                break;
            }
        }

        // Séparation visuelle si desserts présents
        if (dessertIngredients.length > 0 && currentY + 8 <= maxIngredY) {
            currentY += 2;
            // Ligne de séparation
            doc.setDrawColor(75, 85, 99); // Gris
            doc.setLineWidth(0.3);
            doc.line(x + padding, currentY, x + width - padding, currentY);
            currentY += 4;

            // Label "Dessert"
            doc.setFontSize(7);
            doc.setTextColor(156, 163, 175);
            doc.setFont('helvetica', 'italic');
            doc.text('Dessert', x + padding, currentY);
            currentY += 4;

            // Afficher les desserts
            doc.setFontSize(8);
            doc.setTextColor(209, 213, 219);
            doc.setFont('helvetica', 'normal');

            for (let i = 0; i < dessertIngredients.length; i++) {
                if (currentY >= maxIngredY) {break;}

                const ing = dessertIngredients[i];
                const formattedQty = this.formatQuantity(ing.quantity, ing.unit);
                const text = `• ${ing.name}: ${formattedQty}`;
                const lines = doc.splitTextToSize(text, maxWidth);

                if (currentY + (lines.length * 4.5) <= maxIngredY) {
                    lines.forEach(line => {
                        doc.text(line, x + padding, currentY);
                        currentY += 4.5;
                    });
                    displayedIngredients++;
                } else {
                    break;
                }
            }
        }

        // Séparation visuelle si compléments présents
        if (supplementsList.length > 0 && currentY + 8 <= maxIngredY) {
            currentY += 2;
            // Ligne de séparation
            doc.setDrawColor(34, 197, 94); // Vert
            doc.setLineWidth(0.3);
            doc.line(x + padding, currentY, x + width - padding, currentY);
            currentY += 4;

            // Label "Compléments"
            doc.setFontSize(7);
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text('COMPLEMENTS', x + padding, currentY);
            currentY += 4;

            // Afficher les compléments
            doc.setFontSize(7);
            doc.setTextColor(156, 163, 175);
            doc.setFont('helvetica', 'normal');

            for (let i = 0; i < supplementsList.length; i++) {
                if (currentY >= maxIngredY) {break;}

                const supp = supplementsList[i];
                const text = `💊 ${supp.name}: ${supp.amount}`;
                const lines = doc.splitTextToSize(text, maxWidth);

                if (currentY + (lines.length * 4) <= maxIngredY) {
                    lines.forEach(line => {
                        doc.text(line, x + padding, currentY);
                        currentY += 4;
                    });
                }
            }
        }

        // Indicateur d'ingrédients restants
        const totalIngredients = mainIngredients.length + dessertIngredients.length;
        if (displayedIngredients < totalIngredients) {
            if (currentY + 4 <= maxIngredY) {
                doc.setTextColor(107, 114, 128);
                doc.setFontSize(7);
                doc.text(`+${totalIngredients - displayedIngredients} autre(s)`, x + padding, currentY);
            }
        }
    },

    /**
     * Page résumé semaine
     * @param doc
     * @param weekDays
     * @param weekNumber
     * @param macros
     */
    async addWeekSummaryPage(doc, weekDays, weekNumber, macros) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;

        // Header
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 20, 'F');

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`SEMAINE ${weekNumber}`, pageWidth / 2, 13, { align: 'center' });

        // Tableau des jours
        const startY = 30;
        const rowHeight = 8;
        const colWidths = [15, 70, 25, 25, 25, 25];

        // En-tête tableau
        doc.setFillColor(31, 41, 55);
        doc.rect(margin, startY, pageWidth - (2 * margin), rowHeight, 'F');

        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');

        let x = margin + 2;
        ['Jour', 'Repas', 'Calories', 'Protéines', 'Glucides', 'Lipides'].forEach((header, i) => {
            doc.text(header, x, startY + 5);
            x += colWidths[i];
        });

        // Lignes des jours
        let y = startY + rowHeight;
        weekDays.forEach((day, dayIndex) => {
            day.meals.forEach((meal, mealIndex) => {
                if (y > 180) {
                    doc.addPage();
                    y = margin;
                }

                // Alternance de couleur
                if ((dayIndex + mealIndex) % 2 === 0) {
                    doc.setFillColor(249, 250, 251);
                } else {
                    doc.setFillColor(255, 255, 255);
                }
                doc.rect(margin, y, pageWidth - (2 * margin), rowHeight, 'F');

                doc.setFontSize(8);
                doc.setTextColor(0, 0, 0);
                doc.setFont('helvetica', 'normal');

                x = margin + 2;

                // Jour (seulement sur le premier repas)
                if (mealIndex === 0) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${dayIndex + 1}`, x, y + 5);
                    doc.setFont('helvetica', 'normal');
                }
                x += colWidths[0];

                // Nom du repas
                const mealName = `${meal.type}: ${meal.name}`;
                doc.text(mealName.substring(0, 40), x, y + 5);
                x += colWidths[1];

                // Macros
                doc.text(`${meal.macros.calories}`, x, y + 5);
                x += colWidths[2];
                doc.text(`${meal.macros.protein}g`, x, y + 5);
                x += colWidths[3];
                doc.text(`${meal.macros.carbs}g`, x, y + 5);
                x += colWidths[4];
                doc.text(`${meal.macros.fats}g`, x, y + 5);

                y += rowHeight;
            });

            // Ligne de total du jour
            doc.setFillColor(34, 197, 94, 50);
            doc.rect(margin, y, pageWidth - (2 * margin), rowHeight, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);

            x = margin + 2;
            doc.text('TOTAL', x + colWidths[0], y + 5);

            x = margin + 2 + colWidths[0] + colWidths[1];
            doc.text(`${day.totalMacros.calories}`, x, y + 5);
            x += colWidths[2];
            doc.text(`${day.totalMacros.protein}g`, x, y + 5);
            x += colWidths[3];
            doc.text(`${day.totalMacros.carbs}g`, x, y + 5);
            x += colWidths[4];
            doc.text(`${day.totalMacros.fats}g`, x, y + 5);

            y += rowHeight + 2;
        });
    },

    /**
     * Page liste de courses AVEC PRIX
     * @param doc
     * @param shoppingList
     * @param days
     */
    addShoppingListPage(doc, shoppingList, days) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // Header
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 20, 'F');

        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('LISTE DE COURSES', pageWidth / 2, 13, { align: 'center' });

        doc.setFontSize(10);
        const totalText = shoppingList.totalCost ? `Pour ${days} jour(s) - Total estimé: ${shoppingList.totalCost}€` : `Pour ${days} jour(s)`;
        doc.text(totalText, pageWidth / 2, 18, { align: 'center' });

        let currentY = 30;
        const colWidth = (pageWidth - (3 * margin)) / 2;
        const maxTextWidth = colWidth - 6; // Largeur max pour le texte

        let currentCol = 0;

        // Récupérer les catégories (compatibilité avec ancien et nouveau format)
        const categories = shoppingList.categories || shoppingList;

        Object.entries(categories).forEach(([category, items]) => {
            // Vérifier si la catégorie + items rentrent, sinon changer de colonne/page
            const estimatedHeight = 7 + (items.length * 6) + 5;

            if (currentY + estimatedHeight > pageHeight - 40) {
                currentCol++;
                currentY = 30;

                if (currentCol >= 2) {
                    doc.addPage();
                    // Ré-ajouter le header sur la nouvelle page
                    doc.setFillColor(34, 197, 94);
                    doc.rect(0, 0, pageWidth, 20, 'F');
                    doc.setFontSize(18);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text('LISTE DE COURSES (suite)', pageWidth / 2, 13, { align: 'center' });

                    currentCol = 0;
                    currentY = 30;
                }
            }

            const x = margin + (currentCol * (colWidth + margin));

            // Catégorie (bien espacée du contenu précédent)
            doc.setFontSize(11);
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text(category, x, currentY);
            currentY += 9; // Espacement augmenté

            // Items
            doc.setFontSize(9);
            doc.setTextColor(50, 50, 50); // Gris foncé au lieu de noir pur
            doc.setFont('helvetica', 'normal');

            items.forEach(item => {
                // Vérifier si on dépasse la page
                if (currentY > pageHeight - 40) {
                    currentCol++;
                    currentY = 30;

                    if (currentCol >= 2) {
                        doc.addPage();
                        doc.setFillColor(34, 197, 94);
                        doc.rect(0, 0, pageWidth, 20, 'F');
                        doc.setFontSize(18);
                        doc.setTextColor(255, 255, 255);
                        doc.setFont('helvetica', 'bold');
                        doc.text('LISTE DE COURSES (suite)', pageWidth / 2, 13, { align: 'center' });

                        currentCol = 0;
                        currentY = 30;
                    }
                }

                const formattedQty = this.formatQuantity(item.quantity, item.unit);

                // Construire le texte avec prix si disponible
                let text = `[ ] ${item.name} - ${formattedQty}`;
                if (item.pricePerKg && item.totalPrice) {
                    text = `[ ] ${item.name} - ${formattedQty} (${item.pricePerKg}€/kg = ${item.totalPrice}€)`;
                }

                // Couper le texte si trop long
                const lines = doc.splitTextToSize(text, maxTextWidth);
                doc.setTextColor(50, 50, 50);
                doc.setFont('helvetica', 'normal');
                doc.text(lines[0], x + 3, currentY);

                // Si texte trop long, afficher sur 2 lignes
                if (lines.length > 1) {
                    currentY += 4;
                    doc.setFontSize(8);
                    doc.text(lines[1], x + 6, currentY);
                    doc.setFontSize(9);
                }

                currentY += 5.5; // Espacement légèrement augmenté
            });

            currentY += 6; // Espacement augmenté entre catégories
        });
    },

    /**
     * Footer sur chaque page
     * @param doc
     * @param pageNum
     * @param totalPages
     */
    addFooter(doc, pageNum, totalPages) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        doc.text('Skäli Prog - Nutrition Pro', margin, pageHeight - 8);
        doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    },

    /**
     * Sauvegarder ou obtenir le PDF
     * @param doc
     * @param filename
     */
    async save(doc, filename) {
        doc.save(filename);
    },

    /**
     * Obtenir le PDF en blob pour Discord
     * @param doc
     */
    async getBlob(doc) {
        return doc.output('blob');
    }
};

// Exposer globalement
window.NutritionPDF = NutritionPDF;
