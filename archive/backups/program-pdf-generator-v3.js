/**
 * ============================================================================
 * SKALI PROG - PDF GENERATOR V3
 * ============================================================================
 *
 * Générateur de programmes d'entraînement au format PDF
 *
 * STRUCTURE:
 * - Page 1: Présentation (haut 50%) + Timeline périodisation (bas 50%)
 * - Pages 2+: 1 semaine par page (tableau 7 colonnes: Lundi → Dimanche)
 *
 * INSPIRATIONS:
 * - Format: Plannings Strivee (ref/*.pdf)
 * - Contenu: Séances sport-spécifiques (Trail, CrossFit, Hyrox, Cyclisme, etc.)
 * - Intelligence: Sélection méthodologies via Claude API
 *
 * @version 3.0.0
 * @date 2025-01-26
 */

const ProgramPDFGeneratorV3 = {
    /**
     * Configuration
     */
    config: {
        colors: {
            primary: '#2d4a7c', // BPJEPS blue
            secondary: '#3e8e41', // Skali green
            dark: '#1a1a1a', // Noir tableau header
            lightGray: '#f5f5f5', // Fond alternance
            ppg: '#4a90e2', // Phase PPG
            ppo: '#e94e77', // Phase PPO
            pps: '#f39c12' // Phase PPS
        },
        fonts: {
            title: 24,
            subtitle: 16,
            heading: 14,
            body: 10,
            small: 8
        },
        margins: {
            page: 10,
            cell: 2
        }
    },

    /**
     * Base de données de séances par sport
     */
    sessionLibrary: {
        // ============== TRAIL RUNNING ==============
        trail: {
            warmup: [
                'Cardio Z1: 10-15 min\n+ Gammes athlétiques (talons-fesses, montées genoux)\n+ Mobilité chevilles/hanches',
                "EMOM 12':\n- Rameur léger\n- Squats poids du corps\n- Étirements dynamiques",
                "Échauffement progressif:\n- 5' marche rapide\n- 5' footing Z2\n- 3x(30s Z3 / 30s récup)"
            ],

            ppg: [
                {
                    name: 'Longue sortie aérobie',
                    format: 'Long Run Z2',
                    description:
                        "90-150 min @ 65-75% FCmax\nTerrain varié, D+ progressif\nHydratation toutes les 30'\n\nObjectif: Base aérobie, économie de course"
                },
                {
                    name: 'Fartlek long',
                    format: "Fartlek 60'",
                    description:
                        "Après échauffement 15':\n- 10x(2' Z3 / 2' Z2)\n- Terrain vallonné\n- Écoute sensations\n\nObjectif: Variété intensités, plaisir"
                },
                {
                    name: 'Endurance + côtes courtes',
                    format: "Endurance 70' + Hills",
                    description:
                        "50' Z2 terrain plat\n+ 8x(30s côte raide / retour footing)\n+ 10' retour calme\n\nObjectif: Force musculaire jambes"
                }
            ],

            ppo: [
                {
                    name: 'Tempo run seuil',
                    format: 'Tempo Run',
                    description:
                        "Échauffement 15'\n+ 3x(10' @ 80-85% VMA / 3' récup)\n+ Retour calme 10'\n\nRPE 7-8\nObjectif: Seuil lactique, endurance vitesse"
                },
                {
                    name: 'VMA courte',
                    format: 'Intervals VO2max',
                    description:
                        "Échauffement 20'\n+ 10x(400m @ 95-100% VMA / récup 400m footing)\n+ Retour calme 10'\n\nRPE 9\nObjectif: VO2max, puissance aérobie"
                },
                {
                    name: 'Côtes longues',
                    format: 'Hill Repeats',
                    description:
                        "Échauffement 15'\n+ 6x(3' montée @ 85% FCmax / descente récup)\n+ Retour calme 10'\n\nObjectif: Force spécifique trail, résistance"
                }
            ],

            pps: [
                {
                    name: 'Sortie spécifique compétition',
                    format: 'Race Simulation',
                    description:
                        'Simulation profil course:\n- D+ similaire\n- Allure cible\n- Nutrition/hydratation testées\n\nDurée: 60-80% durée course'
                },
                {
                    name: 'VMA + descente technique',
                    format: 'Mixed Session',
                    description:
                        "Échauffement 15'\n+ 6x(2' @ VMA / 2' descente technique rapide)\n+ Retour calme\n\nObjectif: Frappe avant-pied, technique descente"
                },
                {
                    name: 'Activation pré-course',
                    format: 'Sharpening',
                    description:
                        "Footing 30' Z2\n+ 4x(1' @ allure course / 2' récup)\n+ 10' cool down\n\nRPE 6\nObjectif: Maintien fraîcheur, activation"
                }
            ]
        },

        // ============== CROSSFIT ==============
        crossfit: {
            warmup: [
                "EMOM 12':\n- Rameur\n- OVH squat élastique\n- 10 V-up / 10 Superman",
                "EMOM 10':\n- Assault bike\n- Step up box\n- Burpees",
                "Cardio 5'\n+ 3 tours:\n10 squats\n5 pompes\n3 burpees"
            ],

            ppg: [
                {
                    name: 'Volume hypertrophie',
                    format: "AMRAP 20'",
                    skills: 'Échauffement barre:\n5 deadlift\n5 hang power clean\n5 front squat\n5 push press',
                    wod: "AMRAP 20':\n- 10 Thrusters @ 40kg\n- 15 Pullups\n- 20 Wallball shots\n- 200m Run\n\nRPE 7\nObjectif: Volume, endurance musculaire"
                },
                {
                    name: 'Gymnastic skills',
                    format: "EMOM 16'",
                    skills: 'Toes to bar progression:\n- Mobilité épaule\n- Kipping (arch/hollow)\n- T2B strict puis kipping',
                    wod: "EMOM 16':\n1/ 14 Cal Rameur\n2/ 30 Heavy rope\n3/ Max Toes to bar\n4/ Rest\n\nTarget: 60+ T2B total"
                },
                {
                    name: 'Endurance MetCon',
                    format: "For Time TC: 35'",
                    skills: null,
                    wod: '100 Cal Bikerg\n10x 20m Run\n- - - - -\n100 Cal Skierg\n40 Burpees deadlift\n- - - - -\n100 Cal Rameur\n50 Kettlebell swings\n\nRPE 8\nPace: Sustainable, pas de sprint'
                }
            ],

            ppo: [
                {
                    name: 'Force maximale',
                    format: 'Strength + MetCon',
                    skills: "Squat progression:\nEvery 2' x 7 sets\n- 3 reps @ 75-85% 1RM\n- Montée en charge progressive",
                    wod: "For Time TC: 12':\n21-15-9\n- Squat @ 60%\n- Box jumps 60cm\n- Pullups\n\nRPE 8\nObjectif: Force + conditionnement"
                },
                {
                    name: 'Olympic lifting',
                    format: 'Skills + AMRAP',
                    skills: "Clean & Jerk:\nEvery 2' x 7\n1 Power clean\n+ 1 Hang squat clean\n+ 1 Jerk\n\nStart @ 60% 1RM",
                    wod: "AMRAP 4' x 3 rounds:\n- 30 Double unders\n- 10 Clean & Jerk @ 50%\n- 5 Burpees OTB\n\n2' rest between\nRPE 9"
                },
                {
                    name: 'Clusters puissance',
                    format: "EMOM 15'",
                    skills: 'Montée en charge:\n5 Hang power clean\n5 Front squat\n5 Push press',
                    wod: "EMOM 15':\n1/ 5 Clusters @ 70%\n2/ 10 Box jumps\n3/ 15 Cal Assault bike\n\nObjectif: Puissance explosive"
                }
            ],

            pps: [
                {
                    name: 'Competition simulation',
                    format: 'CrossFit Open WOD',
                    skills: 'Échauffement spécifique\nMobilité épaules/hanches\nActivation musculaire',
                    wod: "For Time TC: 15':\n30 Snatches @ 43kg\n30 Bar muscle ups\n30 Thrusters @ 43kg\n\nRPE 9-10\nTest capacités maximales"
                },
                {
                    name: 'Mixed modal',
                    format: "AMRAP 12'",
                    skills: null,
                    wod: "AMRAP 12':\n- 5 Devil press @ 22.5kg\n- 10 Chest to bar\n- 15 Wallballs\n- 300m Run\n\nRPE 8\nPace: Aggressive mais contrôlé"
                },
                {
                    name: 'Taper activation',
                    format: 'Light MetCon',
                    skills: "EMOM 10':\n30s work / 30s rest\nMovements variés légers",
                    wod: "For Time TC: 10':\n10 Rounds:\n- 5 Burpees\n- 10 KB swings léger\n- 50m Run\n\nRPE 6\nObjectif: Activation, fraîcheur"
                }
            ]
        },

        // ============== HYROX ==============
        hyrox: {
            warmup: [
                "Cardio 8'\n+ Mobilité chevilles/hanches\n+ Activation core",
                "EMOM 10':\n- Rameur\n- Sled push léger\n- Burpees",
                "Échauffement Hyrox:\n- 5' cardio varié\n- Drill stations (léger)\n- Activation musculaire"
            ],

            ppg: [
                {
                    name: 'Base running',
                    format: 'Steady State Run',
                    description:
                        "60' @ 70-75% FCmax\nAllure conversationnelle\nTerrain plat\n\nObjectif: Base aérobie, économie"
                },
                {
                    name: 'Stations volume',
                    format: 'Circuit Training',
                    description:
                        "4 Rounds:\n- 500m Row @ 70%\n- 20 Lunges sandbag 20kg\n- 40 Wallballs\n- 2' rest\n\nObjectif: Endurance musculaire stations"
                },
                {
                    name: 'Long cardio mixte',
                    format: "E4' MOM 48'",
                    description:
                        '12 rounds rotating:\n1/ 800m Run\n2/ 800m Row\n3/ 40 Cal Assault bike\n\nRPE 6-7\nPace sustainable'
                }
            ],

            ppo: [
                {
                    name: 'Seuil running + stations',
                    format: 'Mixed Intervals',
                    description:
                        "5 Rounds:\n- 1km Run @ 85% (seuil)\n- 50m Sled push (lourd)\n- 15 Burpees broad jump\n- 2' rest\n\nRPE 8\nObjectif: Seuil sous fatigue"
                },
                {
                    name: 'Stations force',
                    format: "EMOM 20'",
                    description:
                        'Rotation 5 stations x 4:\n1/ Sled push 50m max weight\n2/ Sled pull 50m max weight\n3/ 80m Farmers carry lourd\n4/ 100m Sandbag lunges\n5/ Rest\n\nObjectif: Force spécifique'
                },
                {
                    name: 'VO2max running',
                    format: 'Intervals',
                    description:
                        "Échauffement 15'\n+ 8x(400m @ 95% VMA / 400m récup)\n+ Cool down 10'\n\nRPE 9\nObjectif: Puissance aérobie"
                }
            ],

            pps: [
                {
                    name: 'Simulation course',
                    format: 'Race Simulation',
                    description:
                        'Mini Hyrox:\n1km Run\n1000m SkiErg\n1km Run\n50m Sled push\n1km Run\n50m Sled pull\n1km Run\n40 Burpee broad jump\n\nAllure course\nTest nutrition/stratégie'
                },
                {
                    name: 'Stations rapides',
                    format: 'Repeat Stations',
                    description:
                        "3 Rounds for time:\n- 1km Run @ race pace\n- 20 Burpee broad jump\n- 40 Wallballs\n- 3' rest\n\nRPE 8-9\nFocus: Transitions, vitesse"
                },
                {
                    name: 'Activation légère',
                    format: 'Active Recovery',
                    description:
                        "30' total:\n- 10' cardio Z1-Z2\n- Drill stations (50% effort)\n- Mobilité\n\nRPE 4-5\nObjectif: Fraîcheur"
                }
            ]
        },

        // ============== CYCLISME ==============
        cyclisme: {
            warmup: [
                "15' Z1-Z2 progressif\n+ 3x(1' Z3 / 1' Z1)\n+ Cadence drills",
                "Échauffement home trainer:\n10' easy spin\n+ 5' progression 60-85% FTP\n+ 3x(30s Z4 / 30s easy)",
                "Warmup outdoor:\n20' Z2\n+ Sprints cadence 3x(20s / 40s)\n+ Prêt pour intervalles"
            ],

            ppg: [
                {
                    name: 'Base aérobie longue',
                    format: 'Long Ride Z2',
                    description:
                        '120-180 min @ 60-70% FTP\nCadence 85-95 rpm\nTerrain plat à vallonné\n\nObjectif: Base aérobie, économie pédalage'
                },
                {
                    name: 'Sweet Spot',
                    format: 'SST Intervals',
                    description:
                        "Échauffement 15'\n+ 3x(12' @ 88-93% FTP / 4' Z2)\n+ Cool down 15'\n\nCadence 85-90 rpm\nRPE 7\nObjectif: Endurance au seuil"
                },
                {
                    name: 'Endurance + sprints',
                    format: 'Z2 + Sprints',
                    description:
                        "90' Z2 @ 65% FTP\n+ Toutes les 15': Sprint 15s max\n+ Cool down 15'\n\nObjectif: Puissance neuromusculaire + base"
                }
            ],

            ppo: [
                {
                    name: 'Seuil FTP',
                    format: 'FTP Intervals',
                    description:
                        "Échauffement 20'\n+ 3x(15' @ 95-100% FTP / 8' récup Z2)\n+ Cool down 15'\n\nCadence 90-95 rpm\nRPE 8-9\nObjectif: Augmentation FTP"
                },
                {
                    name: 'Over-unders',
                    format: 'Threshold Intervals',
                    description:
                        "Échauffement 15'\n+ 4x(8' alternant: 2' @ 105% FTP + 2' @ 95% FTP)\n+ 5' récup entre blocs\n+ Cool down 15'\n\nObjectif: Tolérance lactique, gestion seuil"
                },
                {
                    name: 'VO2max courts',
                    format: 'VO2max Intervals',
                    description:
                        "Échauffement 20'\n+ 5x(3' @ 110-120% FTP / 3' récup)\n+ Cool down 15'\n\nRPE 9-10\nObjectif: Puissance maximale aérobie"
                }
            ],

            pps: [
                {
                    name: 'Simulation CLM',
                    format: 'Time Trial Simulation',
                    description:
                        "Échauffement 30' progressif\n+ 40km @ allure CLM (95-105% FTP)\n+ Cool down 20'\n\nPosition aéro\nTest matériel/nutrition"
                },
                {
                    name: 'Efforts répétés',
                    format: 'Repeated Efforts',
                    description:
                        "Échauffement 20'\n+ 6x(5' @ 95% FTP / 2' récup)\n+ Cool down 15'\n\nRPE 8\nObjectif: Maintien puissance sous fatigue"
                },
                {
                    name: 'Openers (activation)',
                    format: 'Pre-Race Openers',
                    description:
                        "45' Z2 @ 65% FTP\n+ 3x(90s @ allure course / 3' récup)\n+ Cool down 10'\n\nRPE 5-6\nObjectif: Activation sans fatigue"
                }
            ]
        }
    },

    /**
     * Génération du PDF principal
     */
    async generatePDF(program, member, formData) {
        try {
            console.log('📄 Génération PDF V3...');

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const c = this.config;

            // PAGE 1: Présentation + Timeline
            await this.renderPage1(doc, program, member, formData);

            // PAGES 2+: Semaines (1 semaine par page)
            const weeks = this.calculateWeeks(formData);

            for (let weekNum = 1; weekNum <= weeks.length; weekNum++) {
                doc.addPage();
                await this.renderWeekPage(
                    doc,
                    program,
                    member,
                    formData,
                    weekNum,
                    weeks[weekNum - 1]
                );
            }

            // Sauvegarder PDF
            const filename = `programme-${member.name.replace(/\s/g, '-')}-${new Date().getTime()}.pdf`;
            doc.save(filename);

            console.log('✅ PDF V3 généré:', filename);

            return {
                success: true,
                filename: filename,
                pages: weeks.length + 1
            };
        } catch (error) {
            console.error('❌ Erreur génération PDF V3:', error);
            throw error;
        }
    },

    /**
     * PAGE 1: Présentation (haut) + Timeline (bas)
     */
    renderPage1(doc, program, member, formData) {
        const c = this.config;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const halfHeight = pageHeight / 2;

        // ========== HAUT: PRÉSENTATION (50%) ==========

        // Fond dégradé bleu
        doc.setFillColor(c.colors.primary);
        doc.rect(0, 0, pageWidth, halfHeight, 'F');

        // Logo SKALI PROG
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(c.fonts.title);
        doc.setFont('helvetica', 'bold');
        doc.text('SKALI PROG', pageWidth / 2, 20, { align: 'center' });

        // Nom athlète
        doc.setFontSize(c.fonts.subtitle);
        doc.setFont('helvetica', 'bold');
        doc.text(member.name.toUpperCase(), pageWidth / 2, 35, { align: 'center' });

        // Sport + Objectif
        const sport = window.SportsMatrix?.sports[formData.sport];
        const objective = this.getObjectiveLabel(formData.objective_primary);

        doc.setFontSize(c.fonts.body);
        doc.setFont('helvetica', 'normal');
        doc.text(`Sport: ${sport?.name || formData.sport}`, pageWidth / 2, 45, { align: 'center' });
        doc.text(`Objectif: ${objective}`, pageWidth / 2, 52, { align: 'center' });

        // Infos clés (2 colonnes)
        const leftX = 40;
        const rightX = pageWidth - 80;
        let y = 70;

        doc.setFontSize(c.fonts.body);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFIL ATHLÈTE', leftX, y);
        doc.text('PROGRAMME', rightX, y);

        y += 8;
        doc.setFont('helvetica', 'normal');

        // Colonne gauche
        doc.text(`Âge: ${this.calculateAge(member.date_of_birth)} ans`, leftX, y);
        y += 6;
        doc.text(`Poids: ${member.weight || 'N/A'} kg`, leftX, y);
        y += 6;
        doc.text(`Taille: ${member.height || 'N/A'} cm`, leftX, y);
        y += 6;
        doc.text(`Niveau: ${this.getLevelLabel(formData.level)}`, leftX, y);

        // Colonne droite
        y = 78;
        doc.text(`Durée: ${formData.duration_weeks} semaines`, rightX, y);
        y += 6;
        doc.text(`Fréquence: ${formData.frequency} séances/semaine`, rightX, y);
        y += 6;
        doc.text(`Début: ${this.formatDate(formData.start_date)}`, rightX, y);
        y += 6;
        if (formData.competition_date) {
            doc.text(`Compétition: ${this.formatDate(formData.competition_date)}`, rightX, y);
        }

        // ========== BAS: TIMELINE PÉRIODISATION (50%) ==========

        const timelineStartY = halfHeight + 10;

        // Titre section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(c.fonts.heading);
        doc.setFont('helvetica', 'bold');
        doc.text('PÉRIODISATION', pageWidth / 2, timelineStartY, { align: 'center' });

        // Timeline visuelle
        this.renderTimeline(doc, formData, timelineStartY + 10);

        // Légende phases
        const legendY = timelineStartY + 55;
        const legendSpacing = 60;

        doc.setFontSize(c.fonts.body);

        // PPG
        doc.setFillColor(c.colors.ppg);
        doc.rect(40, legendY, 8, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('PPG', 52, legendY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Préparation Physique Générale', 52, legendY + 11);
        doc.text('Base, volume, endurance', 52, legendY + 16);

        // PPO
        doc.setFillColor(c.colors.ppo);
        doc.rect(40 + legendSpacing, legendY, 8, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('PPO', 52 + legendSpacing, legendY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Préparation Physique Orientée', 52 + legendSpacing, legendY + 11);
        doc.text('Force, puissance, intensité', 52 + legendSpacing, legendY + 16);

        // PPS
        doc.setFillColor(c.colors.pps);
        doc.rect(40 + legendSpacing * 2, legendY, 8, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.text('PPS', 52 + legendSpacing * 2, legendY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Préparation Physique Spécifique', 52 + legendSpacing * 2, legendY + 11);
        doc.text('Peaking, spécificité, affûtage', 52 + legendSpacing * 2, legendY + 16);
    },

    /**
     * Timeline visuelle PPG/PPO/PPS
     */
    renderTimeline(doc, formData, startY) {
        const c = this.config;
        const pageWidth = doc.internal.pageSize.getWidth();
        const totalWeeks = parseInt(formData.duration_weeks) || 12;

        // Calculer périodisation
        const phases = this.calculatePeriodization(
            totalWeeks,
            formData.competition_date,
            formData.start_date
        );

        // Dimensions timeline
        const timelineWidth = pageWidth - 80;
        const timelineX = 40;
        const cellWidth = timelineWidth / totalWeeks;
        const cellHeight = 20;

        // Dessiner chaque semaine
        for (let week = 0; week < totalWeeks; week++) {
            const phase = phases[week];
            const x = timelineX + week * cellWidth;

            // Couleur selon phase
            let color;
            if (phase === 'PPG') color = c.colors.ppg;
            else if (phase === 'PPO') color = c.colors.ppo;
            else if (phase === 'PPS') color = c.colors.pps;

            // Rectangle coloré
            doc.setFillColor(color);
            doc.rect(x, startY, cellWidth, cellHeight, 'F');

            // Bordure
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.rect(x, startY, cellWidth, cellHeight, 'S');

            // Numéro semaine
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(c.fonts.small);
            doc.setFont('helvetica', 'bold');
            doc.text(`S${week + 1}`, x + cellWidth / 2, startY + cellHeight / 2 + 2, {
                align: 'center'
            });
        }

        // Labels phases sous timeline
        let currentPhase = phases[0];
        let phaseStart = 0;

        for (let week = 1; week <= totalWeeks; week++) {
            if (week === totalWeeks || phases[week] !== currentPhase) {
                // Fin de phase, dessiner label
                const phaseWeeks = week - phaseStart;
                const x = timelineX + phaseStart * cellWidth;
                const width = phaseWeeks * cellWidth;

                doc.setTextColor(0, 0, 0);
                doc.setFontSize(c.fonts.body);
                doc.setFont('helvetica', 'bold');
                doc.text(currentPhase, x + width / 2, startY + cellHeight + 8, { align: 'center' });

                if (week < totalWeeks) {
                    currentPhase = phases[week];
                    phaseStart = week;
                }
            }
        }
    },

    /**
     * Calculer périodisation intelligente BASÉE SUR DATE COMPÉTITION
     */
    calculatePeriodization(totalWeeks, competitionDate, startDate) {
        const phases = [];

        // Si date compétition fournie, calculer semaines RÉELLES jusqu'à compét
        let weeksToCompetition = totalWeeks;

        if (competitionDate && startDate) {
            const start = new Date(startDate);
            const competition = new Date(competitionDate);
            const diffTime = competition - start;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            weeksToCompetition = Math.ceil(diffDays / 7);

            console.log(`📅 Semaines réelles jusqu'à compétition: ${weeksToCompetition}`);
        }

        // Utiliser le MINIMUM entre durée prog et semaines jusqu'à compét
        const effectiveWeeks = Math.min(totalWeeks, weeksToCompetition);

        if (effectiveWeeks <= 3) {
            // PPS uniquement (urgence)
            console.log('⚠️ URGENCE: PPS uniquement (3 semaines ou moins)');
            for (let i = 0; i < totalWeeks; i++) {
                phases.push('PPS');
            }
        } else if (effectiveWeeks <= 6) {
            // PPG court + PPO + PPS
            const ppgWeeks = Math.floor(effectiveWeeks * 0.25);
            const ppsWeeks = Math.floor(effectiveWeeks * 0.25);
            const ppoWeeks = effectiveWeeks - ppgWeeks - ppsWeeks;

            for (let i = 0; i < ppgWeeks; i++) phases.push('PPG');
            for (let i = 0; i < ppoWeeks; i++) phases.push('PPO');
            for (let i = 0; i < ppsWeeks; i++) phases.push('PPS');

            // Si prog plus long que temps dispo, remplir le reste en PPS
            while (phases.length < totalWeeks) {
                phases.push('PPS');
            }
        } else {
            // Périodisation standard (33% / 42% / 25%)
            const ppgWeeks = Math.floor(effectiveWeeks * 0.33);
            const ppsWeeks = Math.floor(effectiveWeeks * 0.25);
            const ppoWeeks = effectiveWeeks - ppgWeeks - ppsWeeks;

            for (let i = 0; i < ppgWeeks; i++) phases.push('PPG');
            for (let i = 0; i < ppoWeeks; i++) phases.push('PPO');
            for (let i = 0; i < ppsWeeks; i++) phases.push('PPS');

            // Si prog plus long que temps dispo, remplir le reste en PPS
            while (phases.length < totalWeeks) {
                phases.push('PPS');
            }
        }

        return phases;
    },

    /**
     * Calculer semaines avec dates et phases
     */
    calculateWeeks(formData) {
        const totalWeeks = parseInt(formData.duration_weeks) || 12;
        const startDate = new Date(formData.start_date);
        const phases = this.calculatePeriodization(
            totalWeeks,
            formData.competition_date,
            formData.start_date
        );

        const weeks = [];

        for (let i = 0; i < totalWeeks; i++) {
            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + i * 7);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            weeks.push({
                number: i + 1,
                phase: phases[i],
                startDate: weekStart,
                endDate: weekEnd
            });
        }

        return weeks;
    },

    /**
     * PAGE SEMAINE: Tableau 7 colonnes (Lundi → Dimanche)
     */
    async renderWeekPage(doc, program, member, formData, weekNum, weekData) {
        const c = this.config;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Header noir avec dates
        doc.setFillColor(c.colors.dark);
        doc.rect(0, 0, pageWidth, 15, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(c.fonts.heading);
        doc.setFont('helvetica', 'bold');
        const headerText = `Planning ${this.formatDate(weekData.startDate)} - ${this.formatDate(weekData.endDate)}`;
        doc.text(headerText, pageWidth / 2, 10, { align: 'center' });

        // Tableau semaine
        const days = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
        const colWidth = (pageWidth - c.margins.page * 2) / 7;
        const headerHeight = 12;
        const cellStartY = 20;

        // Headers colonnes (jours)
        days.forEach((day, index) => {
            const x = c.margins.page + index * colWidth;

            // Fond header
            doc.setFillColor(c.colors.dark);
            doc.rect(x, cellStartY, colWidth, headerHeight, 'F');

            // Texte jour
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(c.fonts.body);
            doc.setFont('helvetica', 'bold');
            doc.text(day, x + colWidth / 2, cellStartY + 8, { align: 'center' });
        });

        // Générer séances pour chaque jour
        const sessions = await this.generateWeekSessions(formData, weekNum, weekData.phase);

        // Dessiner cellules journées
        const cellHeight = pageHeight - cellStartY - headerHeight - c.margins.page;

        sessions.forEach((session, index) => {
            const x = c.margins.page + index * colWidth;
            const y = cellStartY + headerHeight;

            // Bordure cellule
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.rect(x, y, colWidth, cellHeight, 'S');

            // Contenu séance
            if (session) {
                this.renderDaySession(doc, session, x, y, colWidth, cellHeight);
            }
        });
    },

    /**
     * Générer séances pour une semaine
     */
    async generateWeekSessions(formData, weekNum, phase) {
        const sport = formData.sport;
        const frequency = parseInt(formData.frequency) || 4;
        const library = this.sessionLibrary[sport];

        console.log(
            `🏃 Génération séances - Sport: ${sport}, Phase: ${phase}, Fréquence: ${frequency}`
        );

        if (!library) {
            console.error(`❌ Pas de bibliothèque de séances pour sport: ${sport}`);
            console.log('📚 Sports disponibles:', Object.keys(this.sessionLibrary));
            return new Array(7).fill(null);
        }

        // Sélectionner séances selon phase
        let phaseSessions = [];
        if (phase === 'PPG') phaseSessions = library.ppg || [];
        else if (phase === 'PPO') phaseSessions = library.ppo || [];
        else if (phase === 'PPS') phaseSessions = library.pps || [];

        console.log(`📋 Séances ${phase} trouvées:`, phaseSessions.length);

        if (phaseSessions.length === 0) {
            console.error(`❌ Aucune séance ${phase} pour ${sport}`);
            return new Array(7).fill(null);
        }

        // Répartir sur la semaine selon fréquence
        const sessions = new Array(7).fill(null);

        // Pattern selon fréquence
        let trainingDays = [];
        if (frequency === 3)
            trainingDays = [0, 2, 4]; // Lun, Mer, Ven
        else if (frequency === 4)
            trainingDays = [0, 2, 3, 5]; // Lun, Mer, Jeu, Sam
        else if (frequency === 5)
            trainingDays = [0, 1, 2, 4, 5]; // Lun, Mar, Mer, Ven, Sam
        else if (frequency === 6) trainingDays = [0, 1, 2, 3, 4, 5]; // Lun-Sam

        console.log(`📅 Jours d'entraînement (indices):`, trainingDays);

        // Assigner séances
        trainingDays.forEach((dayIndex, i) => {
            const sessionIndex = i % phaseSessions.length;
            const sessionTemplate = phaseSessions[sessionIndex];

            if (sessionTemplate) {
                sessions[dayIndex] = {
                    warmup: library.warmup[i % library.warmup.length],
                    ...sessionTemplate
                };
                console.log(
                    `✅ Séance assignée jour ${dayIndex}: ${sessionTemplate.name || sessionTemplate.format}`
                );
            }
        });

        return sessions;
    },

    /**
     * Rendu d'une séance journalière
     */
    renderDaySession(doc, session, x, y, width, height) {
        const c = this.config;
        const padding = 2;
        let currentY = y + padding + 4;
        const maxWidth = width - padding * 2;

        doc.setFontSize(c.fonts.small);
        doc.setTextColor(0, 0, 0);

        // Warmup
        if (session.warmup) {
            doc.setFont('helvetica', 'bold');
            doc.text('Warmup:', x + padding, currentY);
            currentY += 4;

            doc.setFont('helvetica', 'normal');
            const warmupLines = doc.splitTextToSize(session.warmup, maxWidth);
            warmupLines.forEach(line => {
                if (currentY > y + height - 5) return; // Éviter débordement
                doc.text(line, x + padding, currentY);
                currentY += 3;
            });
            currentY += 2;
        }

        // Skills (si CrossFit)
        if (session.skills) {
            doc.setFont('helvetica', 'bold');
            doc.text('Skills:', x + padding, currentY);
            currentY += 4;

            doc.setFont('helvetica', 'normal');
            const skillsLines = doc.splitTextToSize(session.skills, maxWidth);
            skillsLines.forEach(line => {
                if (currentY > y + height - 5) return;
                doc.text(line, x + padding, currentY);
                currentY += 3;
            });
            currentY += 2;
        }

        // Main WOD / Training
        if (session.wod || session.description) {
            const content = session.wod || session.description;
            const label = session.wod
                ? 'CrossFit Training:'
                : session.format
                  ? `${session.format}:`
                  : 'Training:';

            doc.setFont('helvetica', 'bold');
            doc.text(label, x + padding, currentY);
            currentY += 4;

            doc.setFont('helvetica', 'normal');
            const contentLines = doc.splitTextToSize(content, maxWidth);
            contentLines.forEach(line => {
                if (currentY > y + height - 5) return;
                doc.text(line, x + padding, currentY);
                currentY += 3;
            });
        }

        // Format (si présent et pas déjà affiché)
        if (session.format && !session.wod && !session.description) {
            doc.setFont('helvetica', 'bold');
            doc.setFillColor(c.colors.secondary);
            doc.setTextColor(255, 255, 255);
            doc.roundedRect(x + padding, currentY - 3, maxWidth, 6, 1, 1, 'F');
            doc.text(session.format, x + padding + 2, currentY + 1);
        }
    },

    /**
     * Helpers
     */
    calculateAge(birthDate) {
        if (!birthDate) return 30;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    },

    getLevelLabel(level) {
        const labels = {
            beginner: 'Débutant',
            intermediate: 'Intermédiaire',
            advanced: 'Avancé'
        };
        return labels[level] || level;
    },

    getObjectiveLabel(objective) {
        const labels = {
            force: 'Force maximale',
            hypertrophie: 'Hypertrophie',
            endurance: 'Endurance',
            puissance: 'Puissance',
            explosivite: 'Explosivité',
            vo2max: 'VO2max',
            vma: 'VMA',
            'capacite-aerobie': 'Capacité aérobie'
        };
        return labels[objective] || objective;
    }
};

// Export global
window.ProgramPDFGeneratorV3 = ProgramPDFGeneratorV3;

console.log('✅ ProgramPDFGeneratorV3 loaded');
