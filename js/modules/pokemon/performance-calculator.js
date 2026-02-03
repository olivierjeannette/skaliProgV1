/**
 * PERFORMANCE CALCULATOR - Système de calcul avancé
 * Calcul des performances avec références mondiales et coefficients personnalisés
 */

const PerformanceCalculator = {
    // ===================================================================
    // RÉFÉRENCES MONDIALES PAR EXERCICE
    // ===================================================================
    worldRecords: {
        // FORCE
        squat: {
            worldRecord: { male: 575, female: 387 }, // kg
            elite: { male: 250, female: 180 },
            advanced: { male: 180, female: 120 },
            intermediate: { male: 120, female: 80 },
            novice: { male: 80, female: 50 }
        },
        'bench press': {
            worldRecord: { male: 350, female: 207 },
            elite: { male: 160, female: 100 },
            advanced: { male: 120, female: 70 },
            intermediate: { male: 80, female: 45 },
            novice: { male: 50, female: 25 }
        },
        deadlift: {
            worldRecord: { male: 501, female: 310 },
            elite: { male: 280, female: 200 },
            advanced: { male: 200, female: 140 },
            intermediate: { male: 140, female: 90 },
            novice: { male: 90, female: 60 }
        },

        // ENDURANCE
        '5km': {
            worldRecord: { male: 12.51, female: 14.44 }, // minutes
            elite: { male: 15, female: 17 },
            advanced: { male: 18, female: 21 },
            intermediate: { male: 23, female: 27 },
            novice: { male: 30, female: 35 }
        },
        '10km': {
            worldRecord: { male: 26.17, female: 29.17 },
            elite: { male: 32, female: 36 },
            advanced: { male: 38, female: 44 },
            intermediate: { male: 48, female: 56 },
            novice: { male: 65, female: 75 }
        },
        marathon: {
            worldRecord: { male: 120.35, female: 134.15 }, // minutes
            elite: { male: 150, female: 170 },
            advanced: { male: 180, female: 210 },
            intermediate: { male: 240, female: 270 },
            novice: { male: 300, female: 330 }
        },

        // VITESSE
        '100m': {
            worldRecord: { male: 9.58, female: 10.49 }, // secondes
            elite: { male: 10.5, female: 11.8 },
            advanced: { male: 11.5, female: 13.0 },
            intermediate: { male: 12.5, female: 14.0 },
            novice: { male: 14.0, female: 16.0 }
        },
        '200m': {
            worldRecord: { male: 19.19, female: 21.34 },
            elite: { male: 22, female: 25 },
            advanced: { male: 24, female: 27 },
            intermediate: { male: 27, female: 30 },
            novice: { male: 32, female: 36 }
        },
        '400m': {
            worldRecord: { male: 43.03, female: 47.6 },
            elite: { male: 50, female: 56 },
            advanced: { male: 55, female: 65 },
            intermediate: { male: 65, female: 75 },
            novice: { male: 80, female: 90 }
        }
    },

    // ===================================================================
    // COEFFICIENTS ÂGE (Facteurs de correction)
    // ===================================================================
    ageCoefficients: {
        // Force diminue avec l'âge, endurance aussi mais moins vite
        getForceCoefficient(age) {
            if (age < 20) {
                return 0.85;
            } // Jeune, pas encore au pic
            if (age <= 30) {
                return 1.0;
            } // Pic de force
            if (age <= 40) {
                return 0.95;
            }
            if (age <= 50) {
                return 0.85;
            }
            if (age <= 60) {
                return 0.75;
            }
            return 0.65;
        },

        getEnduranceCoefficient(age) {
            if (age < 20) {
                return 0.9;
            }
            if (age <= 30) {
                return 1.0;
            } // Pic d'endurance
            if (age <= 40) {
                return 0.98;
            }
            if (age <= 50) {
                return 0.92;
            }
            if (age <= 60) {
                return 0.85;
            }
            return 0.75;
        },

        getSpeedCoefficient(age) {
            if (age < 20) {
                return 0.9;
            }
            if (age <= 25) {
                return 1.0;
            } // Pic de vitesse
            if (age <= 35) {
                return 0.95;
            }
            if (age <= 45) {
                return 0.85;
            }
            if (age <= 55) {
                return 0.75;
            }
            return 0.65;
        }
    },

    // ===================================================================
    // COEFFICIENTS POIDS/TAILLE (Wilks-like pour force, BMI-adjusted pour endurance)
    // ===================================================================
    bodyCoefficients: {
        // Coefficient Wilks simplifié pour la force
        getWilksCoefficient(weight, gender) {
            // Formule simplifiée Wilks
            const a = gender === 'male' ? -216.0475144 : -27.23842536447;
            const b = gender === 'male' ? 16.2606339 : 0.82112226871;
            const c = gender === 'male' ? -0.002388645 : -0.00930733913;
            const d = gender === 'male' ? -0.00113732 : 0.00004731582;
            const e = gender === 'male' ? 7.01863e-6 : -0.00000009054;
            const f = gender === 'male' ? -1.291e-8 : 2.35004e-10;

            const denom =
                a +
                b * weight +
                c * weight ** 2 +
                d * weight ** 3 +
                e * weight ** 4 +
                f * weight ** 5;
            return 500 / denom;
        },

        // Coefficient BMI pour endurance (pénalité si surpoids)
        getBMICoefficient(weight, height) {
            const heightM = height / 100;
            const bmi = weight / (heightM * heightM);

            if (bmi < 18.5) {
                return 0.9;
            } // Sous-poids
            if (bmi < 22) {
                return 1.0;
            } // Optimal
            if (bmi < 25) {
                return 0.98;
            } // Léger surpoids
            if (bmi < 30) {
                return 0.9;
            } // Surpoids
            return 0.75; // Obésité
        },

        // Taille avantageuse pour certains exercices
        getHeightAdvantage(height, exerciseType) {
            // Pour la force (squat/deadlift), les petits ont un avantage
            if (exerciseType === 'strength') {
                if (height < 165) {
                    return 1.05;
                }
                if (height < 175) {
                    return 1.0;
                }
                if (height < 185) {
                    return 0.95;
                }
                return 0.9;
            }

            // Pour l'endurance, taille moyenne optimale
            if (exerciseType === 'endurance') {
                if (height < 160 || height > 190) {
                    return 0.95;
                }
                return 1.0;
            }

            // Vitesse : grands ont léger avantage (foulée)
            if (exerciseType === 'speed') {
                if (height < 170) {
                    return 0.95;
                }
                if (height < 180) {
                    return 1.0;
                }
                return 1.05;
            }

            return 1.0;
        }
    },

    // ===================================================================
    // CALCUL DU SCORE DE PERFORMANCE (0-100)
    // ===================================================================
    calculatePerformanceScore(performance, member) {
        const exerciseKey = this.normalizeExerciseName(performance.exercise_type);
        const reference = this.worldRecords[exerciseKey];

        if (!reference) {
            console.warn(`Pas de référence pour ${exerciseKey}, score par défaut`);
            return 50; // Score moyen par défaut
        }

        const gender = member.gender || 'male';
        const age = this.calculateAge(member.birthdate);

        // Récupérer la performance brute
        let rawPerformance = performance.value || 0;

        // Déterminer le type d'exercice
        const exerciseType = this.getExerciseType(exerciseKey);

        // Appliquer les coefficients personnalisés
        const ageCoef = this.getAgeCoefficientForType(age, exerciseType);
        const bodyCoef = this.getBodyCoefficient(
            member.weight,
            member.height,
            exerciseType,
            gender
        );

        // Performance ajustée
        const adjustedPerformance = rawPerformance * ageCoef * bodyCoef;

        // Calculer le pourcentage vs record mondial
        const worldRecord = reference.worldRecord[gender];
        const elite = reference.elite[gender];
        const advanced = reference.advanced[gender];
        const intermediate = reference.intermediate[gender];
        const novice = reference.novice[gender];

        // Pour les exercices où plus petit = mieux (temps)
        const isLowerBetter = exerciseType === 'endurance' || exerciseType === 'speed';

        let score;
        if (isLowerBetter) {
            // Plus petit = meilleur (temps de course)
            if (adjustedPerformance <= worldRecord) {
                score = 100;
            } else if (adjustedPerformance <= elite) {
            {score = 90 + ((elite - adjustedPerformance) / (elite - worldRecord)) * 10;}
            } else if (adjustedPerformance <= advanced) {
            {score = 75 + ((advanced - adjustedPerformance) / (advanced - elite)) * 15;}
            } else if (adjustedPerformance <= intermediate) {
            {score =
                    55 + ((intermediate - adjustedPerformance) / (intermediate - advanced)) * 20;
            } else if (adjustedPerformance <= novice) {
            {score = 30 + ((novice - adjustedPerformance) / (novice - intermediate)) * 25;}
            } else {
                score = Math.max(10, 30 - ((adjustedPerformance - novice) / novice) * 20);
            }
        } else {
            // Plus grand = meilleur (poids soulevé)
            if (adjustedPerformance >= worldRecord) {
                score = 100;
            } else if (adjustedPerformance >= elite) {
            {score = 90 + ((adjustedPerformance - elite) / (worldRecord - elite)) * 10;}
            } else if (adjustedPerformance >= advanced) {
            {score = 75 + ((adjustedPerformance - advanced) / (elite - advanced)) * 15;}
            } else if (adjustedPerformance >= intermediate) {
            {score =
                    55 + ((adjustedPerformance - intermediate) / (advanced - intermediate)) * 20;
            } else if (adjustedPerformance >= novice) {
            {score = 30 + ((adjustedPerformance - novice) / (intermediate - novice)) * 25;}
            } else {
                score = Math.max(10, (adjustedPerformance / novice) * 30);
            }
        }

        return Math.min(100, Math.max(10, Math.round(score)));
    },

    // ===================================================================
    // HELPERS
    // ===================================================================
    normalizeExerciseName(exerciseName) {
        const name = (exerciseName || '').toLowerCase();

        if (name.includes('squat')) {
            return 'squat';
        }
        if (name.includes('bench') || name.includes('développé couché')) {
            return 'bench press';
        }
        if (name.includes('deadlift') || name.includes('soulevé de terre')) {
            return 'deadlift';
        }

        if (name.includes('5km') || name.includes('5000m')) {
            return '5km';
        }
        if (name.includes('10km') || name.includes('10000m')) {
            return '10km';
        }
        if (name.includes('marathon')) {
            return 'marathon';
        }

        if (name.includes('100m')) {
            return '100m';
        }
        if (name.includes('200m')) {
            return '200m';
        }
        if (name.includes('400m')) {
            return '400m';
        }

        return name;
    },

    getExerciseType(exerciseKey) {
        if (['squat', 'bench press', 'deadlift'].includes(exerciseKey)) {
            return 'strength';
        }
        if (['5km', '10km', 'marathon'].includes(exerciseKey)) {
            return 'endurance';
        }
        if (['100m', '200m', '400m'].includes(exerciseKey)) {
            return 'speed';
        }
        return 'general';
    },

    getAgeCoefficientForType(age, exerciseType) {
        if (exerciseType === 'strength') {
            return this.ageCoefficients.getForceCoefficient(age);
        }
        if (exerciseType === 'endurance') {
            return this.ageCoefficients.getEnduranceCoefficient(age);
        }
        if (exerciseType === 'speed') {
            return this.ageCoefficients.getSpeedCoefficient(age);
        }
        return 1.0;
    },

    getBodyCoefficient(weight, height, exerciseType, gender) {
        let coef = 1.0;

        if (exerciseType === 'strength') {
            coef *= this.bodyCoefficients.getWilksCoefficient(weight, gender);
            coef *= this.bodyCoefficients.getHeightAdvantage(height, 'strength');
        } else if (exerciseType === 'endurance') {
            coef *= this.bodyCoefficients.getBMICoefficient(weight, height);
            coef *= this.bodyCoefficients.getHeightAdvantage(height, 'endurance');
        } else if (exerciseType === 'speed') {
            coef *= this.bodyCoefficients.getBMICoefficient(weight, height);
            coef *= this.bodyCoefficients.getHeightAdvantage(height, 'speed');
        }

        return Math.max(0.5, Math.min(1.5, coef)); // Limiter à ±50%
    },

    calculateAge(birthdate) {
        if (!birthdate) {
            return 25;
        } // Âge par défaut
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
};

// Exposer globalement
window.PerformanceCalculator = PerformanceCalculator;
