/**
 * BODY ANALYSIS - Analyse corporelle avancée
 * Composition, métabolisme, morphotype, besoins spécifiques
 */

const BodyAnalysis = {
    /**
     * Morphotypes (classification Sheldon)
     */
    MORPHOTYPES: {
        ectomorph: {
            name: 'Ectomorphe',
            description: 'Métabolisme rapide, difficultés à prendre du poids',
            characteristics: ['Ossature fine', 'Peu de masse musculaire naturelle', 'Peu de graisse'],
            calorieAdjustment: 1.15, // +15%
            proteinMultiplier: 1.8,
            carbsRatio: 0.50, // Élevé
            fatsRatio: 0.20,
            mealFrequency: 6 // Repas fréquents
        },
        mesomorph: {
            name: 'Mésomorphe',
            description: 'Génétique favorable, gains musculaires faciles',
            characteristics: ['Ossature moyenne à large', 'Masse musculaire naturelle', 'Métabolisme équilibré'],
            calorieAdjustment: 1.0, // Standard
            proteinMultiplier: 2.0,
            carbsRatio: 0.40,
            fatsRatio: 0.25,
            mealFrequency: 4
        },
        endomorph: {
            name: 'Endomorphe',
            description: 'Métabolisme lent, stockage facilité',
            characteristics: ['Ossature large', 'Gains musculaires ET graisse faciles', 'Rétention d\'eau'],
            calorieAdjustment: 0.90, // -10%
            proteinMultiplier: 2.2,
            carbsRatio: 0.30, // Réduit
            fatsRatio: 0.30,
            mealFrequency: 4
        }
    },

    /**
     * Calcul de la composition corporelle détaillée
     * @param member
     */
    calculateBodyComposition(member) {
        const weight = member.weight;
        const bodyFat = member.body_fat_percentage || this.estimateBodyFat(member);
        const height = member.height;
        const gender = member.gender;

        // Masse grasse (kg)
        const fatMass = (weight * bodyFat) / 100;

        // Masse maigre (kg) = Poids total - Masse grasse
        const leanMass = weight - fatMass;

        // Estimation masse musculaire (environ 40-50% du poids pour athlètes)
        const muscleMass = member.muscle_mass_kg || this.estimateMuscleMass(leanMass, gender);

        // Masse osseuse (estimation selon formules)
        const boneMass = this.estimateBoneMass(weight, height, gender);

        // Eau corporelle (environ 60% du poids, varie selon MG)
        const waterPercentage = gender === 'male' ?
            (60 - (bodyFat * 0.3)) :
            (55 - (bodyFat * 0.3));
        const waterMass = (weight * waterPercentage) / 100;

        // Métabolisme de repos (plusieurs formules)
        const bmr = {
            mifflin: NutritionCalculator.calculateBMR(
                weight, height,
                NutritionCalculator.calculateAge(member.birthdate),
                gender
            ),
            katchMcardle: Math.round(370 + (21.6 * leanMass)) // Basé sur masse maigre (plus précis)
        };

        // Indice de masse musculaire
        const ffmi = this.calculateFFMI(leanMass, height);

        return {
            weight,
            bodyFat,
            fatMass: Math.round(fatMass * 10) / 10,
            leanMass: Math.round(leanMass * 10) / 10,
            muscleMass: Math.round(muscleMass * 10) / 10,
            boneMass: Math.round(boneMass * 10) / 10,
            waterMass: Math.round(waterMass * 10) / 10,
            waterPercentage: Math.round(waterPercentage * 10) / 10,
            bmr,
            ffmi: Math.round(ffmi * 10) / 10,
            ffmiCategory: this.getFFMICategory(ffmi, gender),
            healthStatus: this.assessHealthStatus(bodyFat, ffmi, gender)
        };
    },

    /**
     * Estimer le % de masse grasse si non fourni
     * Basé sur morphologie visuelle (imprécis, mais mieux que rien)
     * @param member
     */
    estimateBodyFat(member) {
        const gender = member.gender;
        const age = NutritionCalculator.calculateAge(member.birthdate);
        const bmi = member.weight / Math.pow(member.height / 100, 2);

        // Formule Deurenberg (estimation basique)
        let estimatedBF = (1.20 * bmi) + (0.23 * age) - 16.2;
        if (gender === 'female') {
            estimatedBF += 5.4;
        }

        // Clamping
        return Math.max(5, Math.min(50, Math.round(estimatedBF * 10) / 10));
    },

    /**
     * Estimer la masse musculaire
     * @param leanMass
     * @param gender
     */
    estimateMuscleMass(leanMass, gender) {
        // La masse maigre inclut muscles + os + organes + eau
        // Muscles ≈ 40-45% du poids pour athlète moyen
        const muscleRatio = gender === 'male' ? 0.42 : 0.36;
        return leanMass * muscleRatio;
    },

    /**
     * Estimer la masse osseuse
     * @param weight
     * @param height
     * @param gender
     */
    estimateBoneMass(weight, height, gender) {
        // Formules empiriques
        if (gender === 'male') {
            return 0.15 * weight + 0.01 * height - 5.5;
        } else {
            return 0.12 * weight + 0.01 * height - 4.5;
        }
    },

    /**
     * FFMI (Fat-Free Mass Index) - Indice de masse maigre
     * Permet d'évaluer le développement musculaire
     * @param leanMass
     * @param height
     */
    calculateFFMI(leanMass, height) {
        const heightInMeters = height / 100;
        const ffmi = leanMass / Math.pow(heightInMeters, 2);
        // Normalisé pour 1.80m
        const normalizedFFMI = ffmi + 6.1 * (1.8 - heightInMeters);
        return normalizedFFMI;
    },

    /**
     * Catégorie FFMI
     * @param ffmi
     * @param gender
     */
    getFFMICategory(ffmi, gender) {
        const categories = gender === 'male' ? {
            beginner: { max: 18, label: 'Débutant' },
            intermediate: { max: 20, label: 'Intermédiaire' },
            advanced: { max: 22, label: 'Avancé' },
            elite: { max: 25, label: 'Élite naturel' },
            exceptional: { max: 100, label: 'Exceptionnel' }
        } : {
            beginner: { max: 15, label: 'Débutant' },
            intermediate: { max: 17, label: 'Intermédiaire' },
            advanced: { max: 19, label: 'Avancé' },
            elite: { max: 21, label: 'Élite naturel' },
            exceptional: { max: 100, label: 'Exceptionnel' }
        };

        for (const [key, cat] of Object.entries(categories)) {
            if (ffmi <= cat.max) {
                return { level: key, label: cat.label };
            }
        }

        return { level: 'exceptional', label: 'Exceptionnel' };
    },

    /**
     * Évaluation de l'état de santé
     * @param bodyFat
     * @param ffmi
     * @param gender
     */
    assessHealthStatus(bodyFat, ffmi, gender) {
        const warnings = [];
        const recommendations = [];

        // Vérifier la masse grasse
        if (gender === 'male') {
            if (bodyFat < 6) {
                warnings.push('Masse grasse très basse - Risque hormonal');
                recommendations.push('Augmenter légèrement les lipides');
            } else if (bodyFat < 10) {
                recommendations.push('Masse grasse optimale pour la performance');
            } else if (bodyFat > 25) {
                warnings.push('Masse grasse élevée - Risque métabolique');
                recommendations.push('Déficit calorique progressif recommandé');
            }
        } else {
            if (bodyFat < 12) {
                warnings.push('Masse grasse très basse - Risque hormonal et menstruel');
                recommendations.push('Augmenter les lipides et calories');
            } else if (bodyFat < 18) {
                recommendations.push('Masse grasse optimale pour la performance');
            } else if (bodyFat > 32) {
                warnings.push('Masse grasse élevée - Risque métabolique');
                recommendations.push('Déficit calorique progressif recommandé');
            }
        }

        // Vérifier le FFMI
        const ffmiCat = this.getFFMICategory(ffmi, gender);
        if (ffmiCat.level === 'beginner') {
            recommendations.push('Potentiel important de développement musculaire');
            recommendations.push('Surplus calorique et progression linéaire conseillés');
        } else if (ffmiCat.level === 'elite' || ffmiCat.level === 'exceptional') {
            recommendations.push('Niveau musculaire avancé atteint');
            recommendations.push('Progression plus lente attendue - Patience requise');
        }

        return {
            warnings,
            recommendations,
            overallStatus: warnings.length === 0 ? 'good' : 'attention'
        };
    },

    /**
     * Déterminer le morphotype (questionnaire + mesures)
     * @param member
     * @param questionnaireAnswers
     */
    determineMorphotype(member, questionnaireAnswers = {}) {
        // Score pour chaque morphotype
        const scores = {
            ectomorph: 0,
            mesomorph: 0,
            endomorph: 0
        };

        // 1. Analyse physique
        const bmi = member.weight / Math.pow(member.height / 100, 2);
        const bodyFat = member.body_fat_percentage || this.estimateBodyFat(member);

        if (bmi < 20) {scores.ectomorph += 3;}
        else if (bmi < 25) {scores.mesomorph += 3;}
        else {scores.endomorph += 3;}

        if (bodyFat < 12) {scores.ectomorph += 2;}
        else if (bodyFat < 18) {scores.mesomorph += 2;}
        else {scores.endomorph += 2;}

        // 2. Questions (si fournies)
        if (questionnaireAnswers.weightGainDifficulty === 'very_hard') {
            scores.ectomorph += 3;
        } else if (questionnaireAnswers.weightGainDifficulty === 'easy') {
            scores.endomorph += 3;
        } else {
            scores.mesomorph += 2;
        }

        if (questionnaireAnswers.muscleGains === 'fast') {
            scores.mesomorph += 3;
        } else if (questionnaireAnswers.muscleGains === 'slow') {
            scores.ectomorph += 2;
        }

        if (questionnaireAnswers.fatStorage === 'easy') {
            scores.endomorph += 3;
        } else if (questionnaireAnswers.fatStorage === 'hard') {
            scores.ectomorph += 2;
        }

        // 3. Déterminer le morphotype dominant
        const dominant = Object.entries(scores).reduce((a, b) =>
            scores[a[0]] > scores[b[0]] ? a : b
        )[0];

        return {
            dominant,
            scores,
            config: this.MORPHOTYPES[dominant],
            isMixed: Math.max(...Object.values(scores)) - Math.min(...Object.values(scores)) < 3
        };
    },

    /**
     * Ajuster les besoins selon le morphotype
     * @param baseCalories
     * @param baseMacros
     * @param morphotype
     */
    adjustForMorphotype(baseCalories, baseMacros, morphotype) {
        const config = this.MORPHOTYPES[morphotype];

        const adjustedCalories = Math.round(baseCalories * config.calorieAdjustment);

        // Recalculer les macros avec les ratios du morphotype
        const proteinCal = baseMacros.protein.grams * 4; // Garder protéines constantes
        const remainingCal = adjustedCalories - proteinCal;

        const carbsCal = Math.round(adjustedCalories * config.carbsRatio);
        const fatsCal = Math.round(adjustedCalories * config.fatsRatio);

        return {
            calories: adjustedCalories,
            macros: {
                protein: baseMacros.protein, // Inchangé
                carbs: {
                    grams: Math.round(carbsCal / 4),
                    calories: carbsCal,
                    percentage: Math.round((carbsCal / adjustedCalories) * 100)
                },
                fats: {
                    grams: Math.round(fatsCal / 9),
                    calories: fatsCal,
                    percentage: Math.round((fatsCal / adjustedCalories) * 100)
                }
            },
            mealFrequency: config.mealFrequency,
            morphotype: config.name
        };
    },

    /**
     * Calculer les besoins en micronutriments
     * @param member
     * @param objective
     * @param activityLevel
     */
    calculateMicronutrientNeeds(member, objective, activityLevel) {
        const age = NutritionCalculator.calculateAge(member.birthdate);
        const gender = member.gender;
        const weight = member.weight;

        // RDA (Recommended Dietary Allowances) de base
        const baseRDA = {
            // Vitamines
            vitaminA: gender === 'male' ? 900 : 700, // µg
            vitaminD: 15, // µg (600 UI)
            vitaminE: 15, // mg
            vitaminK: gender === 'male' ? 120 : 90, // µg
            vitaminC: gender === 'male' ? 90 : 75, // mg
            vitaminB1: gender === 'male' ? 1.2 : 1.1, // mg
            vitaminB2: gender === 'male' ? 1.3 : 1.1, // mg
            vitaminB3: gender === 'male' ? 16 : 14, // mg
            vitaminB6: 1.3, // mg
            vitaminB9: 400, // µg (folate)
            vitaminB12: 2.4, // µg

            // Minéraux
            calcium: age > 50 ? 1200 : 1000, // mg
            iron: gender === 'female' && age < 50 ? 18 : 8, // mg
            magnesium: gender === 'male' ? 400 : 310, // mg
            zinc: gender === 'male' ? 11 : 8, // mg
            selenium: 55, // µg
            phosphorus: 700, // mg
            potassium: 3400, // mg
            sodium: 1500, // mg (minimum, max 2300)

            // Acides gras essentiels
            omega3: 1.6, // g (ALA)
            omega6: 17 // g (LA)
        };

        // Ajustements selon activité
        const activityMultipliers = {
            sedentary: 1.0,
            light: 1.1,
            moderate: 1.2,
            active: 1.3,
            very_active: 1.5
        };

        const multiplier = activityMultipliers[activityLevel] || 1.2;

        // Ajustements selon objectif
        const objectiveAdjustments = {
            mass_gain: {
                vitaminD: 1.5, // Important pour testostérone
                zinc: 1.3,
                magnesium: 1.3,
                vitaminB6: 1.2
            },
            weight_loss: {
                vitaminD: 1.2,
                calcium: 1.2,
                magnesium: 1.2,
                iron: 1.1
            },
            performance: {
                vitaminC: 1.5, // Antioxydant
                vitaminE: 1.4,
                magnesium: 1.5,
                sodium: 1.3, // Pertes sudation
                potassium: 1.3
            }
        };

        const objAdj = objectiveAdjustments[objective] || {};

        // Calculer les besoins ajustés
        const adjusted = {};
        Object.entries(baseRDA).forEach(([nutrient, value]) => {
            const objMult = objAdj[nutrient] || 1.0;
            adjusted[nutrient] = Math.round(value * multiplier * objMult * 10) / 10;
        });

        return {
            daily: adjusted,
            notes: this.getMicronutrientNotes(objective, gender, age)
        };
    },

    /**
     * Notes sur les micronutriments
     * @param objective
     * @param gender
     * @param age
     */
    getMicronutrientNotes(objective, gender, age) {
        const notes = [];

        if (objective === 'mass_gain') {
            notes.push('Vitamine D : Essentielle pour testostérone et force');
            notes.push('Zinc : Croissance et réparation musculaire');
            notes.push('Magnésium : Synthèse protéique et récupération');
        } else if (objective === 'weight_loss') {
            notes.push('Calcium : Peut favoriser l\'oxydation des graisses');
            notes.push('Magnésium : Prévient les crampes en déficit');
            notes.push('Fer : Attention aux carences (fatigue)');
        } else if (objective === 'performance') {
            notes.push('Vitamine C + E : Protection stress oxydatif');
            notes.push('Sodium/Potassium : Compensation pertes sudation');
            notes.push('Magnésium : Contraction musculaire et énergie');
        }

        if (gender === 'female' && age < 50) {
            notes.push('⚠️ Fer : Besoins élevés (menstruations)');
            notes.push('Calcium : Important pour densité osseuse');
        }

        if (age > 40) {
            notes.push('Vitamine D : Production naturelle réduite avec l\'âge');
            notes.push('Calcium : Prévention ostéoporose');
            notes.push('B12 : Absorption réduite après 50 ans');
        }

        return notes;
    },

    /**
     * Analyser les tendances corporelles (historique)
     * @param measurements
     */
    analyzeTrends(measurements) {
        if (!measurements || measurements.length < 2) {
            return null;
        }

        // Trier par date
        const sorted = measurements.sort((a, b) =>
            new Date(a.measured_at) - new Date(b.measured_at)
        );

        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const timeSpan = (new Date(last.measured_at) - new Date(first.measured_at)) / (1000 * 60 * 60 * 24); // jours

        // Calculs de tendance
        const weightChange = last.weight_kg - first.weight_kg;
        const weightChangePerWeek = (weightChange / timeSpan) * 7;

        const fatChange = (last.body_fat_percentage || 0) - (first.body_fat_percentage || 0);
        const muscleChange = (last.muscle_mass_kg || 0) - (first.muscle_mass_kg || 0);

        // Analyse
        const analysis = {
            timeSpan: Math.round(timeSpan),
            weightChange: Math.round(weightChange * 10) / 10,
            weightChangePerWeek: Math.round(weightChangePerWeek * 100) / 100,
            fatChange: Math.round(fatChange * 10) / 10,
            muscleChange: Math.round(muscleChange * 10) / 10,
            trend: this.determineTrend(weightChange, fatChange, muscleChange),
            dataPoints: sorted.length
        };

        // Recommandations
        analysis.recommendations = this.getTrendRecommendations(analysis);

        return analysis;
    },

    /**
     * Déterminer la tendance
     * @param weightChange
     * @param fatChange
     * @param muscleChange
     */
    determineTrend(weightChange, fatChange, muscleChange) {
        if (Math.abs(weightChange) < 0.5) {
            return { type: 'stable', label: 'Poids stable', color: '#3b82f6' };
        }

        if (weightChange > 0) {
            if (fatChange > 1 && muscleChange < 1) {
                return { type: 'fat_gain', label: 'Prise de gras', color: '#ef4444' };
            } else if (muscleChange > 0.5 && fatChange < 1) {
                return { type: 'lean_gain', label: 'Prise de masse sèche', color: '#10b981' };
            } else {
                return { type: 'weight_gain', label: 'Prise de poids mixte', color: '#f59e0b' };
            }
        } else {
            if (fatChange < -1 && muscleChange > -0.5) {
                return { type: 'fat_loss', label: 'Perte de gras', color: '#10b981' };
            } else if (muscleChange < -1) {
                return { type: 'muscle_loss', label: 'Perte musculaire', color: '#ef4444' };
            } else {
                return { type: 'weight_loss', label: 'Perte de poids', color: '#f59e0b' };
            }
        }
    },

    /**
     * Recommandations selon tendance
     * @param analysis
     */
    getTrendRecommendations(analysis) {
        const recs = [];
        const { trend, weightChangePerWeek } = analysis;

        switch (trend.type) {
            case 'fat_gain':
                recs.push('⚠️ Réduire les calories de 200-300 kcal/jour');
                recs.push('Augmenter l\'activité cardio');
                recs.push('Vérifier le tracking alimentaire');
                break;

            case 'lean_gain':
                if (weightChangePerWeek > 0.5) {
                    recs.push('✅ Excellent ! Maintenir le cap');
                } else if (weightChangePerWeek > 0.7) {
                    recs.push('⚠️ Gain rapide - Risque de gras. Réduire légèrement');
                } else {
                    recs.push('💪 Progression optimale pour prise de masse');
                }
                break;

            case 'fat_loss':
                if (Math.abs(weightChangePerWeek) < 0.5) {
                    recs.push('✅ Perte progressive idéale - Maintenir');
                } else if (Math.abs(weightChangePerWeek) > 1.0) {
                    recs.push('⚠️ Perte trop rapide - Risque catabolisme');
                    recs.push('Augmenter les calories de 100-200 kcal');
                }
                break;

            case 'muscle_loss':
                recs.push('⚠️ ALERTE : Perte musculaire détectée');
                recs.push('Augmenter calories et protéines immédiatement');
                recs.push('Vérifier volume d\'entraînement (surentraînement?)');
                break;

            case 'stable':
                recs.push('Poids stable - Maintenance réussie');
                break;
        }

        return recs;
    }
};
