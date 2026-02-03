/**
 * NUTRITION PDF ENHANCED - Générateur PDF Ultra-Complet
 * Inclut TOUTES les données avancées : morphotype, composition, cyclage, micros, suppléments
 */

const NutritionPDFEnhanced = {
    /**
     * Nettoyer les accents pour eviter caracteres bizarres
     * @param text
     */
    clean(text) {
        if (!text) {
            return '';
        }
        return String(text)
            .replace(/é/g, 'e')
            .replace(/è/g, 'e')
            .replace(/ê/g, 'e')
            .replace(/ë/g, 'e')
            .replace(/à/g, 'a')
            .replace(/â/g, 'a')
            .replace(/ä/g, 'a')
            .replace(/ù/g, 'u')
            .replace(/û/g, 'u')
            .replace(/ü/g, 'u')
            .replace(/ô/g, 'o')
            .replace(/ö/g, 'o')
            .replace(/î/g, 'i')
            .replace(/ï/g, 'i')
            .replace(/ç/g, 'c')
            .replace(/É/g, 'E')
            .replace(/È/g, 'E')
            .replace(/Ê/g, 'E')
            .replace(/À/g, 'A')
            .replace(/Â/g, 'A');
    },

    /**
     * Normaliser TOUTES les donnees pour coherence absolue
     * SOURCE DE VERITE UNIQUE: completePlan.adjustedMacros
     * @param completePlan
     * @param member
     * @param planData
     */
    normalizeData(completePlan, member, planData) {
        console.log('🔍 NORMALIZE DATA - completePlan:', completePlan);

        const adjusted = completePlan.adjustedMacros || completePlan;

        // Calculer poids et composition
        const weight = member.weight || 70;
        const bodyFat = member.bodyFat || 15;
        const fatMass = (weight * bodyFat) / 100;
        const leanMass = weight - fatMass;

        // Calculer FFMI
        const height = member.height || 175;
        const heightM = height / 100;
        const ffmi = leanMass / (heightM * heightM);

        // Extraire les calories de manière robuste
        const targetCal = adjusted.targetCalories || adjusted.calories || adjusted.target || 2500;
        const bmr = adjusted.bmr || Math.round(weight * 22);
        const tdee = adjusted.tdee || Math.round(bmr * 1.5);

        // Extraire les macros de manière robuste
        const macros = adjusted.macros || {};
        const proteinGrams = (macros.protein && macros.protein.grams) || Math.round(weight * 2);
        const carbsGrams =
            (macros.carbs && macros.carbs.grams) || Math.round((targetCal * 0.45) / 4);
        const fatsGrams = (macros.fats && macros.fats.grams) || Math.round((targetCal * 0.25) / 9);

        // Calculer les pourcentages réels
        const totalCal = proteinGrams * 4 + carbsGrams * 4 + fatsGrams * 9;
        const proteinPercent = Math.round(((proteinGrams * 4) / totalCal) * 100);
        const carbsPercent = Math.round(((carbsGrams * 4) / totalCal) * 100);
        const fatsPercent = Math.round(((fatsGrams * 9) / totalCal) * 100);

        console.log('✅ Données normalisées:', {
            targetCal,
            proteinGrams,
            carbsGrams,
            fatsGrams,
            totalCal
        });

        return {
            // CALORIES (source unique)
            calories: {
                bmr: Math.round(bmr),
                tdee: Math.round(tdee),
                target: Math.round(targetCal)
            },

            // MACROS (source unique)
            macros: {
                protein: {
                    grams: Math.round(proteinGrams),
                    perKg: Math.round((proteinGrams / weight) * 10) / 10,
                    calories: Math.round(proteinGrams * 4),
                    percent: proteinPercent
                },
                carbs: {
                    grams: Math.round(carbsGrams),
                    perKg: Math.round((carbsGrams / weight) * 10) / 10,
                    calories: Math.round(carbsGrams * 4),
                    percent: carbsPercent
                },
                fats: {
                    grams: Math.round(fatsGrams),
                    perKg: Math.round((fatsGrams / weight) * 10) / 10,
                    calories: Math.round(fatsGrams * 9),
                    percent: fatsPercent
                }
            },

            // COMPOSITION CORPORELLE
            body: {
                weight: Math.round(weight * 10) / 10,
                bodyFat: Math.round(bodyFat * 10) / 10,
                fatMass: Math.round(fatMass * 10) / 10,
                leanMass: Math.round(leanMass * 10) / 10,
                ffmi: Math.round(ffmi * 10) / 10,
                height: height
            },

            // HYDRATATION (basee sur poids reel)
            hydration: {
                daily: Math.round(((weight * 35) / 1000) * 10) / 10, // 35ml/kg
                duringTraining: Math.round(((weight * 10) / 1000) * 10) / 10 // 10ml/kg
            },

            // CYCLAGE (base sur target)
            cycling: {
                highDay: {
                    label: 'GROSSE SEANCE CARDIO',
                    burn: 1000,
                    total: Math.round(targetCal + 400) // +400 pour grosse seance
                },
                moderateDay: {
                    label: 'SEANCE MUSCU/SPORT',
                    burn: 500,
                    total: Math.round(targetCal + 150) // +150 pour muscu
                },
                lightDay: {
                    label: 'SEANCE LEGERE',
                    burn: 250,
                    total: Math.round(targetCal) // Calories normales
                },
                restDay: {
                    label: 'REPOS',
                    burn: 0,
                    total: Math.round(targetCal - 200) // -200 au repos
                }
            },

            // MORPHOTYPE (extraire le type string)
            morphotype:
                completePlan.morphotype && completePlan.morphotype.type
                    ? completePlan.morphotype.type
                    : 'mesomorphe'
        };
    },

    /**
     * Generer le PDF ultra-complet avec toutes les donnees V3
     * @param mealPlan
     * @param completePlan
     * @param planData
     * @param member
     * @param days
     * @param onProgress
     */
    async generateEnhancedPDF(mealPlan, completePlan, planData, member, days, onProgress = null) {
        console.log('📄 Génération PDF Ultra-Complet V3...');

        if (typeof jspdf === 'undefined') {
            throw new Error("jsPDF n'est pas chargé");
        }

        const { jsPDF } = jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Wrapper pour nettoyer automatiquement les accents
        const originalText = doc.text.bind(doc);
        doc.text = (text, x, y, options) => {
            const cleanedText =
                typeof text === 'string'
                    ? this.clean(text)
                    : Array.isArray(text)
                      ? text.map(t => this.clean(t))
                      : text;
            return originalText(cleanedText, x, y, options);
        };

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // NORMALISER LES DONNEES - SOURCE DE VERITE UNIQUE
        const data = this.normalizeData(completePlan, member, planData);

        // 1. Préparation
        if (onProgress) {
            await onProgress(5, 'Préparation des données...', 'step1');
        }
        await new Promise(resolve => setTimeout(resolve, 100));

        // 2. Page de couverture
        if (onProgress) {
            await onProgress(10, 'Création de la page de couverture...', 'step2');
        }
        await this.addEnhancedCoverPage(doc, member, data, planData, days);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 3. Page Composition Corporelle + Morphotype
        if (onProgress) {
            await onProgress(20, 'Ajout analyse corporelle...', 'step3');
        }
        doc.addPage();
        await this.addBodyCompositionPage(doc, data, member);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 4. Page Macronutriments détaillée
        if (onProgress) {
            await onProgress(30, 'Ajout macronutriments...', 'step4');
        }
        doc.addPage();
        await this.addMacronutrientsPage(doc, data, planData);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 5. Page Cyclage Calorique + Timing
        if (onProgress) {
            await onProgress(40, 'Ajout cyclage calorique...', 'step5');
        }
        doc.addPage();
        await this.addCalorieCyclingPage(doc, data);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 6. Page Micronutriments
        if (onProgress) {
            await onProgress(50, 'Ajout micronutriments...', 'step6');
        }
        doc.addPage();
        await this.addMicronutrientsPage(doc, completePlan.micronutrients, member);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 7. Page Supplémentation
        if (onProgress) {
            await onProgress(55, 'Ajout supplémentation...', 'step7');
        }
        doc.addPage();
        await this.addSupplementationPage(doc, completePlan.supplements, planData.objective);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 8. Page Hydratation
        if (onProgress) {
            await onProgress(60, 'Ajout hydratation...', 'step8');
        }
        doc.addPage();
        await this.addHydrationPage(doc, data, member);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 9. Page Conseils personnalisés
        if (onProgress) {
            await onProgress(65, 'Ajout conseils personnalisés...', 'step9');
        }
        doc.addPage();
        this.addTipsPage(doc, member, data, planData);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 10. Pages de repas - SKIP si pas de données de repas
        if (onProgress) {
            await onProgress(70, 'Génération des repas...', 'step10');
        }

        // Générer liste de courses basique
        const shoppingList = {
            categories: {
                Proteines: ['Poulet', 'Poisson', 'Oeufs', 'Whey'],
                Glucides: ['Riz', 'Pates', 'Patates douces', 'Avoine'],
                Lipides: ["Huile d'olive", 'Amandes', 'Avocat'],
                Legumes: ['Brocoli', 'Epinards', 'Carottes', 'Poivrons'],
                Fruits: ['Bananes', 'Pommes', 'Baies']
            }
        };

        // Skip pages de repas détaillés si pas de données
        if (mealPlan.days && mealPlan.days.length > 0) {
            if (days <= 7) {
                for (let i = 0; i < mealPlan.days.length; i++) {
                    doc.addPage();
                    await this.addDayDetailPage(doc, mealPlan.days[i], i + 1, data, member);
                    if (onProgress) {
                    {await onProgress(
                        70 + (i / mealPlan.days.length) * 15,
                        `Jour ${i + 1}/${mealPlan.days.length}...`,
                        'step10'
                    );
                    }
                }
            } else {
                for (let week = 0; week < Math.ceil(days / 7); week++) {
                    const weekDays = mealPlan.days.slice(week * 7, (week + 1) * 7);
                    doc.addPage();
                    await this.addWeekSummaryPage(doc, weekDays, week + 1, data);
                    if (onProgress) {
                    {await onProgress(
                        70 + (week / Math.ceil(days / 7)) * 15,
                        `Semaine ${week + 1}...`,
                        'step10'
                    );
                    }
                }
            }
        }
        await new Promise(resolve => setTimeout(resolve, 100));

        // 11. Page liste de courses
        if (onProgress) {
            await onProgress(90, 'Ajout liste de courses...', 'step11');
        }
        doc.addPage();
        this.addShoppingListPage(doc, shoppingList, days);
        await new Promise(resolve => setTimeout(resolve, 100));

        // 12. Footer sur toutes les pages
        if (onProgress) {
            await onProgress(95, 'Finalisation du document...', 'step12');
        }
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            this.addFooter(doc, i, totalPages);
        }
        await new Promise(resolve => setTimeout(resolve, 100));

        if (onProgress) {
            await onProgress(100, 'PDF généré avec succès !', 'done');
        }

        console.log('✅ PDF Ultra-Complet généré avec succès');
        return doc;
    },

    /**
     * Page de couverture ÉPURÉE - COHERENCE ABSOLUE
     * @param doc
     * @param member
     * @param data
     * @param planData
     * @param days
     */
    async addEnhancedCoverPage(doc, member, data, planData, days) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const centerX = pageWidth / 2;

        // Fond
        doc.setFillColor(17, 24, 39);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Titre principal
        doc.setFontSize(36);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('PLAN NUTRITIONNEL', centerX, 45, { align: 'center' });

        // Objectif + Nom
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        const objectiveConfig = (window.NutritionCore &&
            window.NutritionCore.OBJECTIVES &&
            window.NutritionCore.OBJECTIVES[planData.objective]) || { name: planData.objective };
        doc.text(`${objectiveConfig.name} - ${member.name}`, centerX, 65, { align: 'center' });

        // Badge Morphotype
        const morphoLabel = (data.morphotype || 'mesomorphe').toUpperCase();
        doc.setFillColor(88, 28, 135);
        doc.roundedRect(centerX - 40, 75, 80, 12, 3, 3, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(morphoLabel, centerX, 84, { align: 'center' });

        // Macros - 4 colonnes ÉPURÉES - SOURCE UNIQUE
        const cardY = 95;
        const macrosData = [
            {
                label: 'CALORIES',
                value: `${data.calories.target}`,
                unit: 'kcal',
                color: [239, 68, 68]
            },
            {
                label: 'PROTEINES',
                value: `${data.macros.protein.grams}g`,
                unit: `${data.macros.protein.percent}%`,
                color: [59, 130, 246]
            },
            {
                label: 'GLUCIDES',
                value: `${data.macros.carbs.grams}g`,
                unit: `${data.macros.carbs.percent}%`,
                color: [251, 191, 36]
            },
            {
                label: 'LIPIDES',
                value: `${data.macros.fats.grams}g`,
                unit: `${data.macros.fats.percent}%`,
                color: [168, 85, 247]
            }
        ];

        const colWidth = (pageWidth - 40) / 4;
        macrosData.forEach((macro, i) => {
            const x = 20 + i * colWidth;
            const boxCenterX = x + colWidth / 2;

            // Box
            doc.setFillColor(31, 41, 55);
            doc.roundedRect(x, cardY, colWidth - 3, 45, 3, 3, 'F');

            // Label
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            doc.setFont('helvetica', 'normal');
            doc.text(macro.label, boxCenterX, cardY + 10, { align: 'center' });

            // Valeur
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...macro.color);
            doc.text(macro.value, boxCenterX, cardY + 28, { align: 'center' });

            // Unité
            doc.setFontSize(7);
            doc.setTextColor(156, 163, 175);
            doc.setFont('helvetica', 'normal');
            doc.text(macro.unit, boxCenterX, cardY + 37, { align: 'center' });
        });

        // Infos essentielles SEULEMENT
        const infoY = cardY + 55;
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `${days} jours | ${planData.mealsPerDay} repas/jour | Debut: ${new Date(planData.startDate).toLocaleDateString('fr-FR')}`,
            centerX,
            infoY,
            { align: 'center' }
        );

        // PAS DE CITATION - Redondance supprimee
    },

    /**
     * Page Composition Corporelle ÉPURÉE - COHERENCE ABSOLUE
     * @param doc
     * @param data
     * @param member
     */
    async addBodyCompositionPage(doc, data, member) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // Header
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('ANALYSE CORPORELLE', pageWidth / 2, 13, { align: 'center' });

        let currentY = 30;

        // Composition - 4x2 grille épurée - SOURCE UNIQUE
        const ffmiCategories = [
            { min: 0, max: 16, label: 'Faible', color: [239, 68, 68] },
            { min: 16, max: 18, label: 'Normal', color: [251, 191, 36] },
            { min: 18, max: 20, label: 'Athletique', color: [34, 197, 94] },
            { min: 20, max: 25, label: 'Excellent', color: [59, 130, 246] },
            { min: 25, max: 100, label: 'Elite', color: [168, 85, 247] }
        ];
        const ffmiCat =
            ffmiCategories.find(c => data.body.ffmi >= c.min && data.body.ffmi < c.max) ||
            ffmiCategories[2];

        const compData = [
            { label: 'Poids', value: `${data.body.weight}kg`, color: [255, 255, 255] },
            {
                label: 'Masse grasse',
                value: `${data.body.bodyFat}%`,
                sub: `${data.body.fatMass}kg`,
                color: [239, 68, 68]
            },
            { label: 'Masse maigre', value: `${data.body.leanMass}kg`, color: [34, 197, 94] },
            {
                label: 'FFMI',
                value: String(data.body.ffmi),
                sub: ffmiCat.label,
                color: [168, 85, 247]
            }
        ];

        const boxWidth = (pageWidth - 5 * margin) / 4;
        const boxHeight = 28;
        let x = margin;

        compData.forEach((item, index) => {
            // Box
            doc.setFillColor(31, 41, 55);
            doc.roundedRect(x, currentY, boxWidth, boxHeight, 3, 3, 'F');

            // Label
            doc.setFontSize(7);
            doc.setTextColor(156, 163, 175);
            doc.setFont('helvetica', 'normal');
            doc.text(item.label, x + boxWidth / 2, currentY + 8, { align: 'center' });

            // Value
            doc.setFontSize(14);
            doc.setTextColor(...item.color);
            doc.setFont('helvetica', 'bold');
            doc.text(item.value, x + boxWidth / 2, currentY + 18, { align: 'center' });

            // Sub
            if (item.sub) {
                doc.setFontSize(6);
                doc.setTextColor(156, 163, 175);
                doc.setFont('helvetica', 'normal');
                doc.text(item.sub, x + boxWidth / 2, currentY + 24, { align: 'center' });
            }

            x += boxWidth + margin / 4;
        });

        currentY += boxHeight + 12;

        // Morphotype SIMPLIFIE - Juste le nom et description courte
        const morphoDescriptions = {
            ectomorphe:
                'Metabolisme rapide, difficulte a prendre du poids. Besoins caloriques eleves.',
            mesomorphe: "Equilibre naturel, bonne reponse a l'entrainement. Profil athletique.",
            endomorphe: 'Metabolisme lent, prise de poids facile. Attention aux glucides.'
        };

        doc.setFontSize(12);
        doc.setTextColor(168, 85, 247);
        doc.setFont('helvetica', 'bold');
        doc.text(`MORPHOTYPE: ${data.morphotype.toUpperCase()}`, margin, currentY);
        currentY += 6;

        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        const desc = doc.splitTextToSize(
            morphoDescriptions[data.morphotype] || morphoDescriptions.mesomorphe,
            pageWidth - 2 * margin
        );
        doc.text(desc, margin, currentY);
        currentY += desc.length * 4 + 6;

        // Ajustements nutritionnels COHERENTS avec les macros
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text(
            `Proteines: ${data.macros.protein.perKg}g/kg | Glucides: ${data.macros.carbs.perKg}g/kg | Lipides: ${data.macros.fats.perKg}g/kg`,
            margin,
            currentY
        );
        currentY += 8;

        // Alertes santé SEULEMENT si importantes (IMC extremes, etc)
        const bmi = data.body.weight / (data.body.height / 100) ** 2;
        const warnings = [];
        if (bmi < 18.5) {
            warnings.push('IMC faible: surveillance recommandee');
        }
        if (bmi > 30) {
            warnings.push("IMC eleve: ajustez l'objectif avec prudence");
        }
        if (data.body.bodyFat < 6 && member.gender === 'male') {
        {warnings.push('Masse grasse tres basse');}
        if (data.body.bodyFat < 14 && member.gender === 'female') {
        {warnings.push('Masse grasse tres basse');}

        if (warnings.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(239, 68, 68);
            doc.setFont('helvetica', 'bold');
            doc.text('ATTENTION', margin, currentY);
            currentY += 5;

            doc.setFontSize(8);
            doc.setTextColor(30, 30, 30);
            doc.setFont('helvetica', 'normal');

            warnings.slice(0, 2).forEach(warning => {
                const lines = doc.splitTextToSize(`${warning}`, pageWidth - 2 * margin);
                if (currentY + lines.length * 4 < pageHeight - 15) {
                    doc.text(lines, margin, currentY);
                    currentY += lines.length * 4 + 2;
                }
            });
        }
    },

    /**
     * Page Macronutriments ÉPURÉE + GLOSSAIRE - COHERENCE ABSOLUE
     * @param doc
     * @param data
     * @param planData
     */
    async addMacronutrientsPage(doc, data, planData) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // Header
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('MACRONUTRIMENTS', pageWidth / 2, 13, { align: 'center' });

        let currentY = 30;

        // Macros - 3 colonnes ÉPURÉES - SOURCE UNIQUE
        const macroBoxWidth = (pageWidth - 4 * margin) / 3;
        const macroBoxHeight = 50;

        const macrosData = [
            {
                name: 'PROTEINES',
                grams: data.macros.protein.grams,
                percentage: data.macros.protein.percent,
                perKg: data.macros.protein.perKg,
                color: [59, 130, 246]
            },
            {
                name: 'GLUCIDES',
                grams: data.macros.carbs.grams,
                percentage: data.macros.carbs.percent,
                perKg: data.macros.carbs.perKg,
                color: [251, 191, 36]
            },
            {
                name: 'LIPIDES',
                grams: data.macros.fats.grams,
                percentage: data.macros.fats.percent,
                perKg: data.macros.fats.perKg,
                color: [168, 85, 247]
            }
        ];

        let macroX = margin;
        macrosData.forEach(macro => {
            // Box
            doc.setFillColor(31, 41, 55);
            doc.roundedRect(macroX, currentY, macroBoxWidth, macroBoxHeight, 3, 3, 'F');

            // Nom
            doc.setFontSize(10);
            doc.setTextColor(...macro.color);
            doc.setFont('helvetica', 'bold');
            doc.text(macro.name, macroX + macroBoxWidth / 2, currentY + 10, { align: 'center' });

            // Grammes
            doc.setFontSize(22);
            doc.setTextColor(255, 255, 255);
            doc.text(`${macro.grams}g`, macroX + macroBoxWidth / 2, currentY + 26, {
                align: 'center'
            });

            // Pourcentage + per kg
            doc.setFontSize(7);
            doc.setTextColor(156, 163, 175);
            doc.text(
                `${macro.percentage}% | ${macro.perKg}g/kg`,
                macroX + macroBoxWidth / 2,
                currentY + 35,
                { align: 'center' }
            );

            // Calories
            const calories = macro.grams * (macro.name === 'LIPIDES' ? 9 : 4);
            doc.setFontSize(8);
            doc.setTextColor(...macro.color);
            doc.text(`${calories} kcal`, macroX + macroBoxWidth / 2, currentY + 43, {
                align: 'center'
            });

            macroX += macroBoxWidth + margin / 2;
        });

        currentY += macroBoxHeight + 12;

        // Infos métaboliques COMPACTES - SOURCE UNIQUE
        doc.setFontSize(12);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMATIONS METABOLIQUES', margin, currentY);
        currentY += 8;

        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');

        const deficit = data.calories.target - data.calories.tdee;
        const evolutionWeek = Math.abs((deficit * 7) / 7700).toFixed(2);

        const metabolicInfo = [
            `BMR: ${data.calories.bmr} kcal/jour`,
            `TDEE: ${data.calories.tdee} kcal/jour`,
            `Objectif: ${data.calories.target} kcal/jour`,
            `Evolution: ${deficit > 0 ? '+' : ''}${evolutionWeek} kg/semaine`
        ];

        const col1X = margin;
        const col2X = pageWidth / 2;

        metabolicInfo.slice(0, 2).forEach((info, i) => {
            doc.text(`• ${info}`, col1X, currentY + i * 6);
        });
        metabolicInfo.slice(2, 4).forEach((info, i) => {
            doc.text(`• ${info}`, col2X, currentY + i * 6);
        });

        currentY += 15;

        // GLOSSAIRE - Explications en bas de page
        doc.setFillColor(31, 41, 55);
        doc.roundedRect(margin, pageHeight - 35, pageWidth - 2 * margin, 22, 2, 2, 'F');

        doc.setFontSize(8);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text('GLOSSAIRE', margin + 3, pageHeight - 29);

        doc.setFontSize(7);
        doc.setTextColor(200, 200, 200);
        doc.setFont('helvetica', 'normal');

        const glossary = [
            'BMR (Metabolisme de Base): Calories brulees au repos complet, pour fonctions vitales uniquement.',
            'TDEE (Depense Totale): Calories brulees dans une journee normale avec votre activite physique.',
            'Objectif: Calories a consommer pour atteindre votre objectif (perte/prise/maintien).'
        ];

        let glossY = pageHeight - 24;
        glossary.forEach(term => {
            const lines = doc.splitTextToSize(term, pageWidth - 2 * margin - 6);
            doc.text(lines, margin + 3, glossY);
            glossY += lines.length * 2.5;
        });
    },

    /**
     * Page Cyclage Calorique - COHERENCE ABSOLUE
     * @param doc
     * @param data
     */
    async addCalorieCyclingPage(doc, data) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // Header compact
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('CYCLAGE CALORIQUE PAR TYPE DE SEANCE', pageWidth / 2, 13, { align: 'center' });

        let currentY = 28;

        // Section Cyclage avec types de séances - SOURCE UNIQUE
        doc.setFontSize(12);
        doc.setTextColor(34, 197, 94);
        doc.text('REPARTITION SELON ACTIVITE', margin, currentY);
        currentY += 8;

        // Types de séances - SOURCE UNIQUE depuis data.cycling
        const cycleTypes = [
            {
                ...data.cycling.highDay,
                color: [239, 68, 68],
                bgColor: [127, 29, 29, 40]
            },
            {
                ...data.cycling.moderateDay,
                color: [251, 191, 36],
                bgColor: [146, 64, 14, 40]
            },
            {
                ...data.cycling.lightDay,
                color: [59, 130, 246],
                bgColor: [30, 58, 138, 40]
            },
            {
                ...data.cycling.restDay,
                color: [168, 85, 247],
                bgColor: [91, 33, 182, 40]
            }
        ];

        const boxWidth = (pageWidth - 5 * margin) / 4;
        const boxHeight = 42;
        let x = margin;

        cycleTypes.forEach(type => {
            doc.setFillColor(...type.bgColor);
            doc.roundedRect(x, currentY, boxWidth, boxHeight, 3, 3, 'F');

            // Label
            doc.setFontSize(7);
            doc.setTextColor(...type.color);
            doc.setFont('helvetica', 'bold');
            const labelLines = doc.splitTextToSize(type.label, boxWidth - 4);
            doc.text(labelLines, x + boxWidth / 2, currentY + 7, { align: 'center' });

            // Dépense calorique
            doc.setFontSize(6);
            doc.setTextColor(200, 200, 200);
            doc.setFont('helvetica', 'normal');
            doc.text(`~${type.burn} kcal depensees`, x + boxWidth / 2, currentY + 13, {
                align: 'center'
            });

            // Calories à consommer
            doc.setFontSize(18);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(String(type.total), x + boxWidth / 2, currentY + 28, { align: 'center' });

            doc.setFontSize(7);
            doc.setTextColor(156, 163, 175);
            doc.text('kcal a consommer', x + boxWidth / 2, currentY + 34, { align: 'center' });

            x += boxWidth + margin / 4;
        });

        currentY += boxHeight + 10;

        // Moyenne et explication
        const avgCals = Math.round(
            (data.cycling.highDay.total +
                data.cycling.moderateDay.total +
                data.cycling.lightDay.total +
                data.cycling.restDay.total) /
                4
        );

        doc.setFillColor(21, 128, 61);
        doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 15, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(
            `MOYENNE: ${avgCals} kcal/jour (selon activite hebdomadaire)`,
            pageWidth / 2,
            currentY + 10,
            { align: 'center' }
        );

        currentY += 20;

        // Explication cyclage
        if (currentY < pageHeight - 60) {
            doc.setFillColor(31, 41, 55);
            doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 25, 3, 3, 'F');

            doc.setFontSize(8);
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text('PRINCIPE DU CYCLAGE CALORIQUE', margin + 5, currentY + 8);

            doc.setFontSize(7);
            doc.setTextColor(220, 220, 220);
            doc.setFont('helvetica', 'normal');
            const explanation =
                "Adaptez vos calories selon votre activite : plus de glucides les jours d'entrainement intense pour la performance et la recuperation, moins les jours de repos pour optimiser la composition corporelle.";
            const lines = doc.splitTextToSize(explanation, pageWidth - 2 * margin - 10);
            doc.text(lines, margin + 5, currentY + 14);

            currentY += 30;
        }

        // Distribution des repas SUPPRIMEE - redondance avec pages repas détaillées
    },

    /**
     * Page Micronutriments
     * @param doc
     * @param micronutrients
     * @param member
     */
    async addMicronutrientsPage(doc, micronutrients, member) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // Header compact
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('MICRONUTRIMENTS - SOURCES ALIMENTAIRES', pageWidth / 2, 13, { align: 'center' });

        let currentY = 30;

        // UNIQUEMENT LES SOURCES ALIMENTAIRES - Format grille 3x3 PROMINENT
        const sources = [
            {
                name: 'Vitamine D',
                foods: 'Poisson gras (saumon, maquereau)\nOeufs\nExposition au soleil',
                color: [251, 191, 36]
            },
            {
                name: 'Vitamine B12',
                foods: 'Viandes\nPoissons\nOeufs, laitages',
                color: [239, 68, 68]
            },
            {
                name: 'Vitamine C',
                foods: 'Agrumes (orange, citron)\nPoivrons, kiwi\nBrocoli',
                color: [34, 197, 94]
            },
            {
                name: 'Fer',
                foods: 'Viande rouge\nLentilles, epinards\nTofu, quinoa',
                color: [239, 68, 68]
            },
            {
                name: 'Calcium',
                foods: 'Laitages (lait, fromage, yaourt)\nSardines avec aretes\nAmandes, brocoli',
                color: [59, 130, 246]
            },
            {
                name: 'Magnesium',
                foods: 'Noix (amandes, noix de cajou)\nGraines (courge, tournesol)\nLegumes verts, bananes',
                color: [168, 85, 247]
            },
            {
                name: 'Omega-3',
                foods: 'Poissons gras (saumon, thon)\nNoix\nGraines de lin, chia',
                color: [6, 182, 212]
            },
            {
                name: 'Zinc',
                foods: 'Huitres, fruits de mer\nViande rouge\nGraines de courge',
                color: [251, 146, 60]
            },
            {
                name: 'Potassium',
                foods: 'Bananes\nPatates douces\nEpinards, haricots blancs',
                color: [234, 179, 8]
            }
        ];

        const boxWidth = (pageWidth - 4 * margin) / 3;
        const boxHeight = 38;
        let x = margin;
        let y = currentY;

        sources.forEach((source, index) => {
            if (index > 0 && index % 3 === 0) {
                y += boxHeight + 5;
                x = margin;
            }

            // Box proéminent
            doc.setFillColor(31, 41, 55);
            doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'F');

            // Bordure colorée gauche
            doc.setFillColor(...source.color);
            doc.rect(x, y, 3, boxHeight, 'F');

            // Nom nutriment GRAND
            doc.setFontSize(10);
            doc.setTextColor(...source.color);
            doc.setFont('helvetica', 'bold');
            doc.text(source.name, x + 6, y + 8);

            // Sources alimentaires
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'normal');
            const foodLines = source.foods.split('\n');
            let foodY = y + 15;
            foodLines.forEach(line => {
                doc.text(`• ${line}`, x + 6, foodY);
                foodY += 5;
            });

            x += boxWidth + margin / 2;
        });

        currentY = y + boxHeight + 10;

        // Note simple en bas
        if (currentY < pageHeight - 25) {
            doc.setFillColor(31, 41, 55);
            doc.roundedRect(margin, pageHeight - 20, pageWidth - 2 * margin, 10, 2, 2, 'F');

            doc.setFontSize(7);
            doc.setTextColor(200, 200, 200);
            doc.setFont('helvetica', 'italic');
            doc.text(
                "Variez votre alimentation pour couvrir l'ensemble de vos besoins en micronutriments.",
                pageWidth / 2,
                pageHeight - 14,
                { align: 'center' }
            );
        }
    },

    /**
     * Page Supplémentation - FORMAT GRILLE ÉPURÉ
     * @param doc
     * @param supplements
     * @param objective
     */
    async addSupplementationPage(doc, supplements, objective) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // Header compact
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('SUPPLEMENTATION', pageWidth / 2, 13, { align: 'center' });

        let currentY = 28;

        // Section Essentiels - GRILLE 2 COLONNES
        doc.setFontSize(13);
        doc.setTextColor(239, 68, 68);
        doc.setFont('helvetica', 'bold');
        doc.text('⭐ ESSENTIELS', margin, currentY);
        currentY += 8;

        if (supplements.essential && supplements.essential.length > 0) {
            const boxWidth = (pageWidth - 3 * margin) / 2;
            const boxHeight = 38;

            supplements.essential.forEach((supp, index) => {
                if (currentY + boxHeight > pageHeight - 15) {
                    return;
                } // Skip si plus de place

                const col = index % 2;
                const x = margin + col * (boxWidth + margin);

                // Nouvelle ligne tous les 2
                if (index > 0 && col === 0) {
                    currentY += boxHeight + 4;
                }

                // Box
                doc.setFillColor(127, 29, 29, 40);
                doc.roundedRect(x, currentY, boxWidth, boxHeight, 3, 3, 'F');

                // NOM
                doc.setFontSize(10);
                doc.setTextColor(239, 68, 68);
                doc.setFont('helvetica', 'bold');
                const nameLines = doc.splitTextToSize(supp.name, boxWidth - 10);
                doc.text(nameLines[0], x + 5, currentY + 8);

                // DOSAGE
                doc.setFontSize(11);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text(supp.dosage, x + 5, currentY + 18);

                // TIMING
                doc.setFontSize(7);
                doc.setTextColor(251, 191, 36);
                doc.setFont('helvetica', 'normal');
                const timingLines = doc.splitTextToSize(supp.timing, boxWidth - 10);
                doc.text(timingLines[0], x + 5, currentY + 25);

                // RAISON (courte)
                doc.setFontSize(7);
                doc.setTextColor(200, 200, 200);
                const reasonLines = doc.splitTextToSize(supp.reason, boxWidth - 10);
                doc.text(reasonLines[0], x + 5, currentY + 31);
            });

            // Aller à la ligne suivante
            currentY += boxHeight + 8;
        } else {
            doc.setFontSize(9);
            doc.setTextColor(200, 200, 200);
            doc.text('Aucun supplement essentiel', margin, currentY);
            currentY += 10;
        }

        // Section Bénéfiques - GRILLE 2 COLONNES
        if (currentY < pageHeight - 50) {
            doc.setFontSize(13);
            doc.setTextColor(59, 130, 246);
            doc.setFont('helvetica', 'bold');
            doc.text('💡 BENEFIQUES', margin, currentY);
            currentY += 8;

            if (supplements.beneficial && supplements.beneficial.length > 0) {
                const boxWidth = (pageWidth - 3 * margin) / 2;
                const boxHeight = 38;
                const topBeneficial = supplements.beneficial.slice(0, 4); // Max 4 (2x2)

                topBeneficial.forEach((supp, index) => {
                    if (currentY + boxHeight > pageHeight - 15) {
                        return;
                    }

                    const col = index % 2;
                    const x = margin + col * (boxWidth + margin);

                    if (index > 0 && col === 0) {
                        currentY += boxHeight + 4;
                    }

                    // Box
                    doc.setFillColor(30, 58, 138, 40);
                    doc.roundedRect(x, currentY, boxWidth, boxHeight, 3, 3, 'F');

                    // NOM
                    doc.setFontSize(10);
                    doc.setTextColor(59, 130, 246);
                    doc.setFont('helvetica', 'bold');
                    const nameLines = doc.splitTextToSize(supp.name, boxWidth - 10);
                    doc.text(nameLines[0], x + 5, currentY + 8);

                    // DOSAGE
                    doc.setFontSize(11);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text(supp.dosage, x + 5, currentY + 18);

                    // TIMING
                    doc.setFontSize(7);
                    doc.setTextColor(251, 191, 36);
                    doc.setFont('helvetica', 'normal');
                    const timingLines = doc.splitTextToSize(supp.timing, boxWidth - 10);
                    doc.text(timingLines[0], x + 5, currentY + 25);

                    // RAISON (courte)
                    doc.setFontSize(7);
                    doc.setTextColor(200, 200, 200);
                    const reasonLines = doc.splitTextToSize(supp.reason, boxWidth - 10);
                    doc.text(reasonLines[0], x + 5, currentY + 31);
                });

                currentY += boxHeight + 8;
            }
        }
    },

    /**
     * Page Hydratation - COHERENCE ABSOLUE (basé sur poids réel)
     * @param doc
     * @param data
     * @param member
     */
    async addHydrationPage(doc, data, member) {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // Header compact
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('HYDRATATION', pageWidth / 2, 13, { align: 'center' });

        let currentY = 28;

        // Objectif principal - SOURCE UNIQUE (calcul basé sur poids)
        doc.setFillColor(6, 182, 212);
        doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 35, 3, 3, 'F');

        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('OBJECTIF QUOTIDIEN', pageWidth / 2, currentY + 13, { align: 'center' });

        doc.setFontSize(32);
        doc.setTextColor(255, 255, 255);
        doc.text(`${data.hydration.daily}L`, pageWidth / 2, currentY + 28, { align: 'center' });

        // Calcul personnalisé
        doc.setFontSize(7);
        doc.setTextColor(200, 200, 200);
        doc.text(
            `Base: ${data.body.weight}kg x 35ml = ${data.hydration.daily}L/jour`,
            pageWidth / 2,
            currentY + 33,
            { align: 'center' }
        );

        currentY += 45;

        // Répartition simplifiée sur la journée
        if (currentY < pageHeight - 80) {
            doc.setFontSize(13);
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text('REPARTITION SUR LA JOURNEE', margin, currentY);
            currentY += 10;

            // Blocs de répartition horaire
            const hydrationSchedule = [
                { time: 'Au réveil', amount: '0.3-0.5', tip: 'Rehydratation' },
                { time: 'Matin', amount: '0.5-0.7', tip: 'Regulierement' },
                { time: 'Pre-workout', amount: '0.3-0.5', tip: 'Si entrainement' },
                { time: 'Post-workout', amount: '0.5-0.7', tip: 'Recuperation' },
                { time: 'Apres-midi', amount: '0.5-0.7', tip: 'Maintien' },
                { time: 'Soir', amount: '0.2-0.3', tip: 'Avant 20h' }
            ];

            const boxWidth = (pageWidth - 4 * margin) / 3; // 3 colonnes
            const boxHeight = 28;
            let x = margin;
            let row = 0;

            hydrationSchedule.forEach((slot, index) => {
                if (row * boxHeight + boxHeight > pageHeight - currentY - 50) {
                    return;
                } // Skip si plus de place

                const col = index % 3;
                if (index > 0 && col === 0) {
                    row++;
                }

                const y = currentY + row * (boxHeight + 3);
                x = margin + col * (boxWidth + margin / 2);

                doc.setFillColor(31, 41, 55);
                doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'F');

                // Moment
                doc.setFontSize(8);
                doc.setTextColor(6, 182, 212);
                doc.setFont('helvetica', 'bold');
                doc.text(slot.time, x + 5, y + 8);

                // Quantité
                doc.setFontSize(13);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text(`${slot.amount}L`, x + 5, y + 18);

                // Tip
                doc.setFontSize(7);
                doc.setTextColor(200, 200, 200);
                doc.setFont('helvetica', 'normal');
                doc.text(slot.tip, x + 5, y + 24);
            });

            currentY += Math.ceil(hydrationSchedule.length / 3) * (boxHeight + 3) + 10;
        }

        // Conseils essentiels
        if (currentY < pageHeight - 35) {
            doc.setFontSize(13);
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text('CONSEILS ESSENTIELS', margin, currentY);
            currentY += 8;

            const tips = [
                'Buvez regulierement tout au long de la journee',
                "Augmentez l'hydratation autour de l'entrainement",
                "Urine jaune pale = bon indicateur d'hydratation"
            ];

            doc.setFillColor(31, 41, 55);
            const tipsHeight = tips.length * 6 + 8;
            doc.roundedRect(margin, currentY, pageWidth - 2 * margin, tipsHeight, 3, 3, 'F');

            doc.setFontSize(9);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'normal');

            let tipY = currentY + 7;
            tips.forEach(tip => {
                doc.text(`• ${tip}`, margin + 5, tipY);
                tipY += 6;
            });
        }
    },

    /**
     * Formater le nom d'un nutriment pour l'affichage
     * @param nutrient
     */
    formatNutrientName(nutrient) {
        const names = {
            vitaminD: 'Vitamine D',
            vitaminB12: 'Vitamine B12',
            vitaminC: 'Vitamine C',
            vitaminE: 'Vitamine E',
            vitaminK: 'Vitamine K',
            vitaminA: 'Vitamine A',
            vitaminB6: 'Vitamine B6',
            vitaminB9: 'Vitamine B9',
            iron: 'Fer',
            calcium: 'Calcium',
            magnesium: 'Magnesium',
            zinc: 'Zinc',
            selenium: 'Selenium',
            potassium: 'Potassium',
            sodium: 'Sodium',
            phosphorus: 'Phosphore',
            iodine: 'Iode',
            copper: 'Cuivre',
            manganese: 'Manganese',
            chromium: 'Chrome'
        };
        return names[nutrient] || nutrient;
    },

    /**
     * Citations motivationnelles
     * @param objective
     */
    getMotivationalQuote(objective) {
        const quotes = {
            prise_masse: 'La construction musculaire est un marathon, pas un sprint',
            perte_poids: 'Chaque jour compte. Restez constant',
            maintien: 'L equilibre est la cle',
            seche: 'La discipline bat la motivation',
            performance_endurance: 'L endurance, c est tenir bon quand tout le monde abandonne',
            performance_force: 'La force vient de la volonte',
            performance_crossfit: 'Excellence continue',
            sante_generale: 'Votre sante est votre richesse'
        };
        return quotes[objective] || 'Chaque repas vous rapproche de votre objectif';
    },

    /**
     * Ajouter footer
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
        doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth / 2, pageHeight - 8, {
            align: 'center'
        });
        doc.text('Skali Prog - Nutrition Pro V3', margin, pageHeight - 8);
        doc.text(
            `Genere le ${new Date().toLocaleDateString('fr-FR')}`,
            pageWidth - margin,
            pageHeight - 8,
            { align: 'right' }
        );
    },

    /**
     * Sauvegarder le PDF et retourner le blob pour Discord
     * @param doc
     * @param filename
     */
    async save(doc, filename) {
        // Sauvegarder le fichier localement
        doc.save(filename);

        // Générer le blob pour l'envoi Discord
        const blob = doc.output('blob');

        return { doc, blob, filename };
    }
};

// Page détail d'un jour
NutritionPDFEnhanced.addDayDetailPage = function (doc, day, dayNumber, data, member) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let currentY = margin;

    // Header du jour
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, pageWidth, 25, 'F');

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`JOUR ${dayNumber}`, margin, 16);

    // Macros du jour
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(
        `${day.totalMacros.calories} kcal | P: ${day.totalMacros.protein}g | G: ${day.totalMacros.carbs}g | L: ${day.totalMacros.fats}g`,
        pageWidth - margin,
        16,
        { align: 'right' }
    );

    currentY = 35;

    // Déterminer la disposition selon le nombre de repas
    const numMeals = day.meals.length;
    let mealsPerRow, numRows;

    if (numMeals <= 3) {
        mealsPerRow = 3;
        numRows = 1;
    } else if (numMeals === 4) {
        mealsPerRow = 2;
        numRows = 2;
    } else if (numMeals === 5) {
        mealsPerRow = 3;
        numRows = 2;
    } else {
        mealsPerRow = 3;
        numRows = 2;
    }

    const mealWidth = (pageWidth - (mealsPerRow + 1) * margin) / mealsPerRow;
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
                const x = margin + offset + col * (mealWidth + margin);
                const y = currentY + row * (mealHeight + 10);
                this.drawMealCard(doc, meal, x, y, mealWidth, mealHeight);
                continue;
            }
        } else {
            col = i % mealsPerRow;
            row = Math.floor(i / mealsPerRow);
        }

        const x = margin + col * (mealWidth + margin);
        const y = currentY + row * (mealHeight + 10);
        this.drawMealCard(doc, meal, x, y, mealWidth, mealHeight);
    }
};

// Dessiner une carte de repas
NutritionPDFEnhanced.drawMealCard = function (doc, meal, x, y, width, height) {
    // Carte du repas
    doc.setFillColor(31, 41, 55);
    doc.roundedRect(x, y, width, height, 3, 3, 'F');

    const padding = 7;
    const maxWidth = width - 2 * padding;
    let currentY = y + 9;

    // Type de repas
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'bold');
    doc.text(meal.type.toUpperCase(), x + padding, currentY);
    currentY += 7;

    // Nom du repas
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    const nameLines = doc.splitTextToSize(meal.name, maxWidth);
    const displayNameLines = nameLines.slice(0, 2);
    displayNameLines.forEach(line => {
        doc.text(line, x + padding, currentY);
        currentY += 5;
    });

    currentY += 2;

    // Macros
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.setFont('helvetica', 'normal');
    doc.text(`${meal.macros.calories} kcal`, x + padding, currentY);
    currentY += 4;
    doc.text(
        `P: ${meal.macros.protein}g  G: ${meal.macros.carbs}g  L: ${meal.macros.fats}g`,
        x + padding,
        currentY
    );
    currentY += 5;

    // Ingrédients (max 4 pour tenir dans la carte)
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    const maxIngredients = meal.dessert ? 3 : 4; // Moins d'espace si dessert
    const displayIngredients = meal.ingredients.slice(0, maxIngredients);

    displayIngredients.forEach((ing, idx) => {
        const ingText = `• ${ing.name} (${Math.round(ing.quantity)}${ing.unit})`;
        const truncated = doc.splitTextToSize(ingText, maxWidth)[0];
        doc.text(truncated, x + padding, currentY);
        currentY += 3.5;
    });

    if (meal.ingredients.length > maxIngredients) {
        doc.text(`... +${meal.ingredients.length - maxIngredients} autres`, x + padding, currentY);
        currentY += 3.5;
    }

    // Dessert si présent
    if (meal.dessert) {
        doc.setFontSize(7);
        doc.setTextColor(134, 239, 172); // Vert clair
        doc.setFont('helvetica', 'bold');
        doc.text(
            `+ Dessert: ${meal.dessert.name} (${meal.dessert.quantity}${meal.dessert.unit})`,
            x + padding,
            currentY
        );
    }
};

// Page résumé d'une semaine
NutritionPDFEnhanced.addWeekSummaryPage = function (doc, weekDays, weekNumber, data) {
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
    doc.rect(margin, startY, pageWidth - 2 * margin, rowHeight, 'F');

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
            if (y > 250) {
                doc.addPage();
                y = margin;
            }

            // Alternance de couleur
            if ((dayIndex + mealIndex) % 2 === 0) {
                doc.setFillColor(249, 250, 251);
            } else {
                doc.setFillColor(255, 255, 255);
            }
            doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');

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
        doc.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');

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
};

// Page liste de courses
NutritionPDFEnhanced.addShoppingListPage = function (doc, shoppingList, days) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Header
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`LISTE DE COURSES (${days} jours)`, pageWidth / 2, 13, { align: 'center' });

    let currentY = 30;

    // Catégories de la liste de courses
    if (shoppingList && shoppingList.categories) {
        const categories = Object.entries(shoppingList.categories);
        const boxWidth = (pageWidth - 3 * margin) / 2;

        categories.forEach((category, index) => {
            const [categoryName, items] = category;
            const col = index % 2;
            const x = margin + col * (boxWidth + margin);

            if (index > 0 && col === 0) {
                currentY += 35;
            }

            if (currentY + 35 > pageHeight - 15) {
                return;
            }

            // Box catégorie
            doc.setFillColor(31, 41, 55);
            doc.roundedRect(x, currentY, boxWidth, 30, 3, 3, 'F');

            // Nom catégorie
            doc.setFontSize(10);
            doc.setTextColor(34, 197, 94);
            doc.setFont('helvetica', 'bold');
            doc.text(categoryName, x + 5, currentY + 8);

            // Items
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'normal');

            let itemY = currentY + 15;
            items.slice(0, 3).forEach(item => {
                doc.text(`• ${item}`, x + 5, itemY);
                itemY += 5;
            });
        });
    }
};

// Page conseils simplifiée - PAS DE REDONDANCE
NutritionPDFEnhanced.addTipsPage = function (doc, member, data, planData) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // Header
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CONSEILS PRATIQUES', pageWidth / 2, 13, { align: 'center' });

    let currentY = 30;

    // UNIQUEMENT DES TIPS PRATIQUES NON MENTIONNES AILLEURS
    const tips = [
        {
            title: 'Preparation des repas',
            text: "Preparez vos repas 2-3 jours a l'avance pour gagner du temps et rester constant."
        },
        {
            title: 'Tolerance individuelle',
            text: 'Ajustez les quantites si necessaire selon votre faim et energie. Le plan est un guide, pas une prison.'
        },
        {
            title: 'Progression',
            text: 'Pesez-vous 1x/semaine le matin a jeun. Evaluez tous les 14 jours et ajustez si besoin.'
        },
        {
            title: 'Flexibilite',
            text: "Un ecart occasionnel n'est pas un echec. Reprenez simplement le lendemain sans culpabilite."
        },
        {
            title: 'Sommeil',
            text: 'Visez 7-9h/nuit. Le manque de sommeil perturbe la faim et ralentit les resultats.'
        }
    ];

    tips.forEach(tip => {
        // Box
        doc.setFillColor(31, 41, 55);
        doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 18, 3, 3, 'F');

        // Titre
        doc.setFontSize(10);
        doc.setTextColor(34, 197, 94);
        doc.setFont('helvetica', 'bold');
        doc.text(tip.title, margin + 5, currentY + 7);

        // Texte
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(tip.text, pageWidth - 2 * margin - 10);
        doc.text(lines, margin + 5, currentY + 13);

        currentY += 22;
    });
};

/**
 * Télécharger le PDF localement
 * @param doc
 * @param filename
 */
NutritionPDFEnhanced.save = async function (doc, filename) {
    console.log('💾 Téléchargement du PDF:', filename);
    doc.save(filename);
    return new Promise(resolve => setTimeout(resolve, 500)); // Attendre que le téléchargement démarre
};

/**
 * Afficher dialogue de confirmation pour sauvegarder sur Supabase
 * @param doc
 * @param filename
 * @param title
 * @param member
 */
NutritionPDFEnhanced.showSaveConfirmationDialog = async function (doc, filename, title, member) {
    return new Promise(resolve => {
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-green-500">
                <div class="text-center mb-6">
                    <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                        <i class="fas fa-check-circle text-5xl text-green-400"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-white mb-2">PDF généré avec succès !</h2>
                    <p class="text-gray-400">Le PDF a été téléchargé sur votre ordinateur.</p>
                </div>

                <div class="bg-gray-900 rounded-lg p-4 mb-6 border border-green-500 border-opacity-30">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-file-pdf text-2xl text-red-400 mt-1"></i>
                        <div class="flex-1">
                            <h3 class="text-white font-semibold mb-1">${title}</h3>
                            <p class="text-gray-500 text-sm">${filename}</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <button id="savePdfBtn"
                            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                                   text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105">
                        <i class="fas fa-cloud-upload-alt mr-2"></i>
                        Enregistrer sur le profil adhérent
                    </button>
                    <button id="skipPdfBtn"
                            class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg
                                   transition-all duration-200">
                        <i class="fas fa-times mr-2"></i>
                        Passer (PDF déjà téléchargé)
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Bouton "Enregistrer"
        document.getElementById('savePdfBtn').onclick = async () => {
            try {
                // Changer le bouton en état de chargement
                const btn = document.getElementById('savePdfBtn');
                btn.innerHTML =
                    '<i class="fas fa-spinner fa-spin mr-2"></i>Enregistrement en cours...';
                btn.disabled = true;

                // Convertir le PDF en Blob pour l'upload Supabase
                console.log('☁️ Upload vers Supabase...');
                const pdfBlob = doc.output('blob');

                // Générer un chemin unique pour Supabase
                const timestamp = Date.now();
                const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = `${member.id}/${timestamp}_${sanitizedFilename}`;

                // Upload vers Supabase Storage
                const { data: uploadData, error: uploadError } =
                    await SupabaseManager.supabase.storage
                        .from('nutrition-pdfs')
                        .upload(filePath, pdfBlob, {
                            contentType: 'application/pdf',
                            cacheControl: '3600',
                            upsert: false
                        });

                if (uploadError) {
                    throw uploadError;
                }

                console.log('✅ PDF uploadé sur Supabase:', filePath);

                // Enregistrer dans la base de données
                const { data: dbData, error: dbError } = await SupabaseManager.supabase
                    .from('member_nutrition_pdfs')
                    .insert({
                        member_id: member.id,
                        title: title,
                        filename: filename,
                        file_path: filePath,
                        file_size: pdfBlob.size
                    });

                if (dbError) {
                    throw dbError;
                }

                console.log('✅ PDF enregistré en base de données');

                // Fermer le modal
                modal.remove();

                // Notification de succès
                if (window.Utils && window.Utils.showNotification) {
                    window.Utils.showNotification(
                        'Succès',
                        'PDF enregistré sur le profil adhérent !',
                        'success'
                    );
                }

                // Retourner au profil membre
                setTimeout(async () => {
                    if (window.NutritionMemberManager) {
                        await window.NutritionMemberManager.selectMember(member.id);
                    }
                }, 500);

                resolve(true);
            } catch (error) {
                console.error('❌ Erreur sauvegarde Supabase:', error);
                if (window.Utils && window.Utils.showNotification) {
                    window.Utils.showNotification(
                        'Erreur',
                        `Impossible de sauvegarder le PDF: ${error.message}`,
                        'error'
                    );
                }
                modal.remove();
                resolve(false);
            }
        };

        // Bouton "Passer"
        document.getElementById('skipPdfBtn').onclick = () => {
            console.log('⏭️ Sauvegarde Supabase ignorée');
            modal.remove();

            // Retourner au profil membre
            setTimeout(async () => {
                if (window.NutritionMemberManager) {
                    await window.NutritionMemberManager.selectMember(member.id);
                }
            }, 500);

            resolve(false);
        };
    });
};

/**
 * Sauvegarder le PDF sur Supabase ET télécharger
 * @param doc
 * @param filename
 * @param title
 * @param member
 */
NutritionPDFEnhanced.saveToSupabaseAndDownload = async function (doc, filename, title, member) {
    try {
        // 1. Télécharger le PDF localement d'abord
        console.log('📥 Téléchargement local du PDF...');
        await this.save(doc, filename);

        // 2. Convertir le PDF en Blob pour l'upload Supabase
        console.log('☁️ Upload vers Supabase...');
        const pdfBlob = doc.output('blob');

        // Générer un chemin unique pour Supabase
        const timestamp = Date.now();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${member.id}/${timestamp}_${sanitizedFilename}`;

        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await SupabaseManager.supabase.storage
            .from('nutrition-pdfs')
            .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.warn('⚠️ Erreur upload Supabase:', uploadError.message);
            // Ne pas bloquer si l'upload échoue - le PDF a déjà été téléchargé
            return;
        }

        console.log('✅ PDF uploadé sur Supabase:', filePath);

        // 3. Enregistrer dans la base de données
        const { data: dbData, error: dbError } = await SupabaseManager.supabase
            .from('member_nutrition_pdfs')
            .insert({
                member_id: member.id,
                title: title,
                filename: filename,
                file_path: filePath,
                file_size: pdfBlob.size
            });

        if (dbError) {
            console.warn('⚠️ Erreur insertion DB:', dbError.message);
            // Ne pas bloquer - le PDF est uploadé
            return;
        }

        console.log('✅ PDF enregistré en base de données');
    } catch (error) {
        console.warn('⚠️ Erreur sauvegarde Supabase (PDF téléchargé quand même):', error.message);
        // Ne pas throw - le PDF a déjà été téléchargé localement
    }
};

/**
 * Générer un plan de repas de démo (sans IA)
 * @param member
 * @param macros
 * @param planData
 */
NutritionPDFEnhanced.generateDemoMealPlan = async function (member, macros, planData) {
    console.log('🎭 Génération plan repas DÉMO (sans IA)');

    const days = planData.planDays || 7;
    const mealsPerDay = planData.mealsPerDay || 4;
    const targetCalories = macros.targetCalories;

    // Base de données de VRAIS repas complets avec desserts
    const mealTemplates = {
        'Petit-déjeuner': [
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
                    { name: 'Avocat', quantity: 50, unit: 'g' },
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
                    name: 'Compote sans sucre ajouté',
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
            }
        ],
        Déjeuner: [
            {
                name: 'Poulet rôti, riz basmati et ratatouille',
                baseCalories: 650,
                baseProtein: 48,
                baseCarbs: 72,
                baseFats: 14,
                ingredients: [
                    { name: 'Blanc de poulet rôti', quantity: 180, unit: 'g' },
                    { name: 'Riz basmati cuit', quantity: 200, unit: 'g' },
                    {
                        name: 'Ratatouille (courgette, aubergine, poivron)',
                        quantity: 250,
                        unit: 'g'
                    },
                    { name: "Huile d'olive", quantity: 10, unit: 'ml' },
                    { name: 'Herbes de Provence', quantity: 1, unit: 'c.à.c' }
                ],
                dessert: {
                    name: 'Skyr nature',
                    quantity: 150,
                    unit: 'g',
                    cal: 90,
                    p: 15,
                    c: 6,
                    f: 0
                }
            },
            {
                name: 'Saumon grillé, quinoa et brocoli',
                baseCalories: 680,
                baseProtein: 46,
                baseCarbs: 62,
                baseFats: 24,
                ingredients: [
                    { name: 'Pavé de saumon', quantity: 150, unit: 'g' },
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
                name: 'Tajine de poulet aux légumes',
                baseCalories: 640,
                baseProtein: 44,
                baseCarbs: 70,
                baseFats: 14,
                ingredients: [
                    { name: 'Poulet (cuisses)', quantity: 150, unit: 'g' },
                    { name: 'Semoule de couscous', quantity: 180, unit: 'g' },
                    {
                        name: 'Légumes variés (carotte, navet, courgette)',
                        quantity: 200,
                        unit: 'g'
                    },
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
            }
        ],
        Collation: [
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
                name: 'Smoothie protéiné',
                baseCalories: 230,
                baseProtein: 20,
                baseCarbs: 26,
                baseFats: 4,
                ingredients: [
                    { name: 'Whey protéine', quantity: 30, unit: 'g' },
                    { name: 'Banane', quantity: 1, unit: 'unité' },
                    { name: 'Lait', quantity: 200, unit: 'ml' },
                    { name: "Flocons d'avoine", quantity: 20, unit: 'g' }
                ],
                dessert: null
            }
        ],
        Dîner: [
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
            }
        ]
    };

    // Répartitions caloriques selon le nombre de repas
    const distributions = {
        3: { 'Petit-déjeuner': 0.3, Déjeuner: 0.4, Dîner: 0.3 },
        4: { 'Petit-déjeuner': 0.25, Déjeuner: 0.35, Collation: 0.12, Dîner: 0.28 },
        5: {
            'Petit-déjeuner': 0.22,
            'Collation matin': 0.1,
            Déjeuner: 0.32,
            'Collation après-midi': 0.1,
            Dîner: 0.26
        },
        6: {
            'Petit-déjeuner': 0.2,
            'Collation matin': 0.08,
            Déjeuner: 0.3,
            'Collation après-midi': 0.08,
            Dîner: 0.26,
            'Collation soir': 0.08
        }
    };

    const distribution = distributions[mealsPerDay] || distributions[4];
    const mealPlan = { days: [] };

    // Générer chaque jour
    for (let day = 1; day <= days; day++) {
        const dayMeals = [];
        let totalCal = 0,
            totalProt = 0,
            totalCarbs = 0,
            totalFats = 0;

        Object.entries(distribution).forEach(([mealType, ratio]) => {
            const targetMealCal = Math.round(targetCalories * ratio);

            // Mapper les types de repas à la base de données
            let templateKey = mealType;
            let templates;

            if (mealType === 'Petit-déjeuner') {
                templates = window.NutritionMealsDatabase
                    ? window.NutritionMealsDatabase.breakfasts
                    : mealTemplates['Petit-déjeuner'];
            } else if (mealType === 'Déjeuner') {
                templates = window.NutritionMealsDatabase
                    ? window.NutritionMealsDatabase.lunches
                    : mealTemplates['Déjeuner'];
            } else if (mealType === 'Dîner') {
                templates = window.NutritionMealsDatabase
                    ? window.NutritionMealsDatabase.dinners
                    : mealTemplates['Dîner'];
            } else if (mealType.includes('Collation')) {
                // Si whey protein est sélectionnée, privilégier les snacks protéinés
                templates = window.NutritionMealsDatabase
                    ? window.NutritionMealsDatabase.snacks
                    : mealTemplates['Collation'];

                // Si whey est dans les suppléments, filtrer pour avoir des snacks protéinés
                if (
                    planData.supplements &&
                    planData.supplements.includes('whey') &&
                    templates.length > 5
                ) {
                    // Prendre les 5 premiers snacks qui sont tous protéinés (whey, smoothie protéiné, etc.)
                    templates = templates.slice(0, 5);
                }
            } else {
                templates = window.NutritionMealsDatabase
                    ? window.NutritionMealsDatabase.snacks
                    : mealTemplates['Collation'];
            }

            const template = templates[day % templates.length];

            // Ajuster les quantités pour correspondre aux macros (mais pas trop)
            const scaleFactor = Math.min(Math.max(targetMealCal / template.baseCalories, 0.7), 1.3);

            const meal = {
                type: mealType,
                name: template.name,
                ingredients: template.ingredients.map(ing => ({
                    name: ing.name,
                    quantity: Math.round(ing.quantity * scaleFactor * 10) / 10,
                    unit: ing.unit
                })),
                macros: {
                    calories: Math.round(template.baseCalories * scaleFactor),
                    protein: Math.round(template.baseProtein * scaleFactor),
                    carbs: Math.round(template.baseCarbs * scaleFactor),
                    fats: Math.round(template.baseFats * scaleFactor)
                },
                dessert: template.dessert // Inclure le dessert
            };

            // Ajouter les macros du dessert si présent
            if (meal.dessert) {
                meal.macros.calories += meal.dessert.cal;
                meal.macros.protein += meal.dessert.p;
                meal.macros.carbs += meal.dessert.c;
                meal.macros.fats += meal.dessert.f;
            }

            dayMeals.push(meal);
            totalCal += meal.macros.calories;
            totalProt += meal.macros.protein;
            totalCarbs += meal.macros.carbs;
            totalFats += meal.macros.fats;
        });

        mealPlan.days.push({
            day: day,
            meals: dayMeals,
            totalMacros: {
                calories: totalCal,
                protein: totalProt,
                carbs: totalCarbs,
                fats: totalFats
            }
        });
    }

    console.log(`✅ Plan démo généré: ${days} jours, ${mealsPerDay} repas/jour`);
    return mealPlan;
};

// Fonction init pour compatibilité avec le planner
NutritionPDFEnhanced.init = async function (member, formData, macros) {
    console.log('📄 NutritionPDFPro.init() appelé', { member, formData, macros });

    try {
        // Validation
        if (!member || !member.id) {
            throw new Error('Member data is required');
        }

        // Préparer formData avec valeurs par défaut
        const planData = {
            objective: formData.objective || 'maintien',
            morphotype: formData.morphotype || 'mesomorphe',
            mealsPerDay: formData.mealsPerDay || 4,
            planDays: formData.planDays || 7,
            startDate: formData.startDate || new Date().toISOString(),
            ...formData
        };

        // Préparer les données complètes
        const completePlan = {
            adjustedMacros: macros,
            morphotype: { type: planData.morphotype },
            micronutrients: {}, // Sera rempli par le générateur
            supplements: {
                essential: [
                    {
                        name: 'Proteines Whey',
                        dosage: '25-30g',
                        timing: 'Post-entrainement',
                        reason: 'Recuperation musculaire optimale'
                    },
                    {
                        name: 'Creatine',
                        dosage: '5g',
                        timing: 'Post-entrainement',
                        reason: 'Performance et force'
                    }
                ],
                beneficial: [
                    {
                        name: 'Omega-3',
                        dosage: '2-3g',
                        timing: 'Avec repas',
                        reason: 'Sante cardiovasculaire et recuperation'
                    },
                    {
                        name: 'Vitamine D',
                        dosage: '2000-4000 UI',
                        timing: 'Matin',
                        reason: 'Systeme immunitaire et os'
                    }
                ]
            }
        };

        // Générer le plan de repas
        console.log('🍽️ Génération du plan de repas...');
        const mealPlan = await this.generateDemoMealPlan(member, macros, planData);
        console.log(
            `✅ Plan généré: ${mealPlan.days.length} jours, ${mealPlan.days[0]?.meals?.length || 0} repas/jour`
        );

        // Générer le PDF avec progress callback
        const showProgress = (percent, message, step) => {
            console.log(`📊 ${percent}% - ${message}`);
        };

        const doc = await this.generateEnhancedPDF(
            mealPlan,
            completePlan,
            planData,
            member,
            planData.planDays,
            showProgress
        );

        // Télécharger le PDF localement
        const filename = `nutrition-${member.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        const title = `Programme Nutrition - ${formData.objective || 'Personnalisé'} - ${new Date().toLocaleDateString('fr-FR')}`;

        console.log('💾 Téléchargement du PDF...');
        await this.save(doc, filename);

        console.log('✅ PDF téléchargé avec succès');

        // Afficher fenêtre de confirmation pour sauvegarder sur Supabase
        await this.showSaveConfirmationDialog(doc, filename, title, member);
    } catch (error) {
        console.error('❌ Erreur génération PDF:', error);
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(
                'Erreur',
                `Impossible de générer le PDF: ${error.message}`,
                'error'
            );
        }
        throw error;
    }
};

// Module export - avec alias pour compatibilité
window.NutritionPDFEnhanced = NutritionPDFEnhanced;
window.NutritionPDFPro = NutritionPDFEnhanced; // Alias pour le nouveau système
console.log('✅ NutritionPDFPro chargé (générateur PDF enhanced)');
