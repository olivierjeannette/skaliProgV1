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

        // 10. Pages de repas
        if (onProgress) {
            await onProgress(70, 'Génération des repas...', 'step10');
        }
        const shoppingList = NutritionAIGenerator.generateShoppingList(mealPlan);

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
        const objectiveConfig = NutritionPro.OBJECTIVES[planData.objective];
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

// Module export
window.NutritionPDFEnhanced = NutritionPDFEnhanced;
