/**
 * COACH LEARNING SYSTEM
 * Système d'apprentissage automatique du style de coaching
 * Analyse les séances passées pour apprendre :
 * - Le style d'écriture du coach
 * - Les schémas de progression
 * - Les exercices préférés
 * - La façon de structurer les séances
 * - Le vocabulaire et expressions utilisés
 */

const CoachLearningSystem = {
    // Profil du coach appris
    coachProfile: {
        writingStyle: null,
        vocabulary: [],
        preferredExercises: {},
        progressionPatterns: [],
        blockStructures: [],
        tempoPreferences: [],
        restPeriods: [],
        lastAnalysis: null,
        sessionsAnalyzed: 0
    },

    /**
     * Initialisation
     */
    async init() {
        console.log('🧠 Coach Learning System initialized');
        await this.loadCoachProfile();
        return true;
    },

    /**
     * Analyse toutes les séances depuis Supabase
     * @param monthsBack
     */
    async analyzeFromDatabase(monthsBack = 3) {
        try {
            console.log(`📊 Analyse des ${monthsBack} derniers mois depuis Supabase...`);

            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - monthsBack);

            const { data: sessions, error } = await window.supabase
                .from('sessions')
                .select('*')
                .gte('date', startDate.toISOString().split('T')[0])
                .lte('date', endDate.toISOString().split('T')[0])
                .order('date', { ascending: false });

            if (error) {
                throw error;
            }

            if (!sessions || sessions.length === 0) {
                console.warn('Aucune séance trouvée dans la base de données');
                return null;
            }

            console.log(`✅ ${sessions.length} séances trouvées, analyse en cours...`);

            // Analyser avec Claude AI
            const profile = await this.analyzeSessionsWithAI(sessions);

            // Sauvegarder le profil
            this.coachProfile = {
                ...profile,
                lastAnalysis: new Date().toISOString(),
                sessionsAnalyzed: sessions.length,
                source: 'database'
            };

            await this.saveCoachProfile();

            console.log('✅ Profil du coach mis à jour !');
            return this.coachProfile;
        } catch (error) {
            console.error("Erreur lors de l'analyse database:", error);
            throw error;
        }
    },

    /**
     * Analyse des PDFs importés
     * @param files
     */
    async analyzeFromPDFs(files) {
        try {
            console.log(`📄 Analyse de ${files.length} fichiers PDF...`);

            // Parser les PDFs
            const parsedSessions = await this.parsePDFFiles(files);

            if (!parsedSessions || parsedSessions.length === 0) {
                throw new Error("Impossible d'extraire les séances des PDFs");
            }

            console.log(`✅ ${parsedSessions.length} séances extraites des PDFs`);

            // Analyser avec Claude AI
            const profile = await this.analyzeSessionsWithAI(parsedSessions);

            // Sauvegarder le profil
            this.coachProfile = {
                ...profile,
                lastAnalysis: new Date().toISOString(),
                sessionsAnalyzed: parsedSessions.length,
                source: 'pdf'
            };

            await this.saveCoachProfile();

            console.log('✅ Profil du coach mis à jour depuis PDFs !');
            return this.coachProfile;
        } catch (error) {
            console.error("Erreur lors de l'analyse PDF:", error);
            throw error;
        }
    },

    /**
     * Parse les fichiers PDF pour extraire les séances
     * @param files
     */
    async parsePDFFiles(files) {
        const parsedSessions = [];

        for (const file of files) {
            try {
                // Utiliser pdf.js pour parser le PDF
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                let fullText = '';

                // Extraire le texte de toutes les pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }

                // Analyser le texte avec Claude pour extraire les séances structurées
                const sessions = await this.extractSessionsFromText(fullText);
                parsedSessions.push(...sessions);
            } catch (error) {
                console.error(`Erreur lors du parsing de ${file.name}:`, error);
            }
        }

        return parsedSessions;
    },

    /**
     * Extrait les séances structurées depuis du texte brut avec Claude
     * @param text
     */
    async extractSessionsFromText(text) {
        try {
            // 🆕 Récupérer la clé depuis ENV (qui redirige vers APIKeysManager automatiquement)
            const apiKey = ENV.get('claudeKey');
            if (!apiKey) {
            {throw new Error(
                'Clé API Claude non configurée. Allez dans Configuration → Intelligence Artificielle.'
            );
            }

            const prompt = `Tu es un expert en analyse de séances d'entraînement.

Analyse ce texte qui contient des séances d'entraînement et extrait-les au format JSON structuré.

TEXTE À ANALYSER :
${text}

Extrait TOUTES les séances trouvées dans ce texte et retourne un tableau JSON avec cette structure :

[
  {
    "title": "Nom de la séance",
    "date": "YYYY-MM-DD si trouvée, sinon null",
    "blocks": [
      {
        "name": "Nom du bloc (Warm-up, Bloc 1, etc.)",
        "content": "Contenu textuel exact du bloc tel qu'écrit"
      }
    ]
  }
]

IMPORTANT :
- Garde le texte EXACT tel qu'écrit (vocabulaire, expressions, style)
- Ne reformule PAS
- Ne change PAS le style d'écriture
- Garde les emojis, abréviations, etc. si présents
- Si plusieurs séances, retourne-les toutes

Réponds UNIQUEMENT avec le JSON, rien d'autre.`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 8000,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error('Erreur API Claude');
            }

            const data = await response.json();
            const resultText = data.content[0].text;

            const jsonMatch = resultText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Impossible de parser le JSON de réponse');
            }
        } catch (error) {
            console.error('Erreur extraction séances depuis texte:', error);
            return [];
        }
    },

    /**
     * Analyse les séances avec Claude pour créer le profil du coach
     * @param sessions
     */
    async analyzeSessionsWithAI(sessions) {
        try {
            // 🆕 Récupérer la clé depuis ENV (qui redirige vers APIKeysManager automatiquement)
            const apiKey = ENV.get('claudeKey');
            if (!apiKey) {
            {throw new Error(
                'Clé API Claude non configurée. Allez dans Configuration → Intelligence Artificielle.'
            );
            }

            // Limiter à 50 séances max pour ne pas surcharger
            const sessionsToAnalyze = sessions.slice(0, 50);

            const prompt = `Tu es un expert en analyse de style d'entraînement et de coaching.

Je vais te donner ${sessionsToAnalyze.length} séances d'entraînement créées par un coach.

Ton objectif : APPRENDRE son style unique pour pouvoir le reproduire fidèlement.

SÉANCES À ANALYSER :
${JSON.stringify(sessionsToAnalyze, null, 2)}

Analyse PROFONDÉMENT ces séances et crée un profil complet du coach qui contient :

1. **Style d'écriture** :
   - Est-il direct, technique, motivant, sec, verbeux ?
   - Utilise-t-il des emojis ? Lesquels ?
   - Est-il formel ou informel ?
   - Phrases courtes ou longues ?
   - Ton général (sérieux, fun, militaire, décontracté, etc.)

2. **Vocabulaire spécifique** :
   - Mots et expressions qu'il utilise souvent
   - Abréviations préférées (reps, @ pour "at", etc.)
   - Termes techniques récurrents
   - Façon de nommer les exercices

3. **Exercices préférés** (par catégorie) :
   - Push : quels exercices reviennent ?
   - Pull : quels exercices reviennent ?
   - Legs : quels exercices reviennent ?
   - Cardio : quels exercices reviennent ?
   - Liste par fréquence d'utilisation

4. **Schémas de progression** :
   - Comment il structure les sets/reps (3x10, 4x8, 5-5-5, etc.)
   - Utilise-t-il des pourcentages 1RM ? Lesquels ?
   - Tempos utilisés (3-0-1-0, etc.)
   - Comment il fait progresser d'une séance à l'autre

5. **Structure des blocs** :
   - Comment il organise les warm-ups
   - Comment il structure les blocs principaux
   - Durées typiques des blocs
   - Ordre des exercices

6. **Repos et tempos** :
   - Périodes de repos préférées
   - Format (mm:ss ou secondes ?)
   - Quand il prescrit des tempos

7. **Notes et consignes** :
   - Comment il donne des consignes
   - Type de feedback qu'il ajoute
   - Notes de sécurité, stratégie, etc.

8. **Patterns de programmation** :
   - Sur plusieurs séances, comment il varie ?
   - Cycles qu'il utilise
   - Philosophie de programmation

Réponds au format JSON suivant :

{
  "writingStyle": {
    "tone": "description du ton général",
    "formality": "formal/informal/mixed",
    "sentenceLength": "short/medium/long",
    "emojiUse": true/false,
    "commonEmojis": ["emoji1", "emoji2"],
    "characteristics": ["caractéristique 1", "caractéristique 2"]
  },
  "vocabulary": {
    "commonWords": ["mot1", "mot2", ...],
    "commonPhrases": ["expression1", "expression2", ...],
    "exerciseNaming": "comment il nomme les exercices",
    "abbreviations": {"reps": "reps ou répétitions ?", ...}
  },
  "preferredExercises": {
    "push": [{"exercise": "nom", "frequency": 10}],
    "pull": [{"exercise": "nom", "frequency": 8}],
    "legs": [{"exercise": "nom", "frequency": 12}],
    "cardio": [{"exercise": "nom", "frequency": 5}],
    "other": [{"exercise": "nom", "frequency": 3}]
  },
  "progressionPatterns": [
    {
      "type": "sets x reps",
      "examples": ["4x8", "5x5", "3x10"],
      "frequency": "often/sometimes/rarely"
    },
    {
      "type": "percentage 1RM",
      "ranges": ["70-75%", "80-85%"],
      "frequency": "often/sometimes/rarely"
    },
    {
      "type": "tempo",
      "examples": ["3-0-1-0", "4-1-1-0"],
      "frequency": "often/sometimes/rarely"
    }
  ],
  "blockStructures": {
    "warmup": {
      "typicalDuration": "8-10min",
      "structure": "description de la structure typique",
      "components": ["mobilité", "activation", "montée en charge"]
    },
    "mainBlocks": {
      "typicalNumber": 2,
      "typicalDuration": "12-18min",
      "structure": "description"
    }
  },
  "restPeriods": {
    "format": "mm:ss ou secondes",
    "typical": ["01:30", "02:00", "00:45"],
    "byIntensity": {
      "high": "03:00-05:00",
      "medium": "01:30-02:00",
      "low": "00:30-01:00"
    }
  },
  "coachingNotes": {
    "feedbackStyle": "comment il donne du feedback",
    "safetyFocus": "met-il l'accent sur la sécurité ?",
    "strategyTips": "donne-t-il des conseils de stratégie ?",
    "motivationalStyle": "comment il motive"
  },
  "programmingPhilosophy": "description de sa philosophie globale de programmation basée sur les patterns observés"
}

Sois TRÈS précis et TRÈS détaillé. Ce profil sera utilisé pour reproduire exactement son style.

Réponds UNIQUEMENT avec le JSON, rien d'autre.`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 16000,
                    temperature: 0.3, // Faible température pour analyse précise
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    `Claude API error: ${errorData.error?.message || response.statusText}`
                );
            }

            const data = await response.json();
            const profileText = data.content[0].text;

            const jsonMatch = profileText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Impossible de parser le profil JSON');
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('Erreur analyse IA:', error);
            throw error;
        }
    },

    /**
     * Génère un prompt enrichi avec le profil du coach
     * @param basePrompt
     */
    getEnrichedPrompt(basePrompt) {
        if (!this.coachProfile || !this.coachProfile.writingStyle) {
            console.warn('Aucun profil de coach chargé, utilisation du prompt de base');
            return basePrompt;
        }

        const profile = this.coachProfile;

        let enrichedPrompt = basePrompt + '\n\n';
        enrichedPrompt += '=== PROFIL DU COACH (APPRENDRE CE STYLE) ===\n\n';
        enrichedPrompt += '⚠️ CRITIQUE : Tu dois REPRODUIRE EXACTEMENT le style de ce coach.\n';
        enrichedPrompt += `Analyse basée sur ${profile.sessionsAnalyzed} séances réelles.\n`;
        enrichedPrompt += `Dernière analyse : ${new Date(profile.lastAnalysis).toLocaleDateString('fr-FR')}\n\n`;

        // Style d'écriture
        if (profile.writingStyle) {
            enrichedPrompt += "## STYLE D'ÉCRITURE À REPRODUIRE :\n\n";
            enrichedPrompt += `Ton général : ${profile.writingStyle.tone}\n`;
            enrichedPrompt += `Formalité : ${profile.writingStyle.formality}\n`;
            enrichedPrompt += `Longueur de phrases : ${profile.writingStyle.sentenceLength}\n`;

            if (profile.writingStyle.emojiUse && profile.writingStyle.commonEmojis) {
                enrichedPrompt += `Emojis utilisés : ${profile.writingStyle.commonEmojis.join(', ')}\n`;
            }

            if (profile.writingStyle.characteristics) {
                enrichedPrompt += `Caractéristiques : ${profile.writingStyle.characteristics.join(', ')}\n`;
            }
            enrichedPrompt += '\n';
        }

        // Vocabulaire
        if (profile.vocabulary) {
            enrichedPrompt += '## VOCABULAIRE À UTILISER :\n\n';

            if (profile.vocabulary.commonWords && profile.vocabulary.commonWords.length > 0) {
                enrichedPrompt += `Mots fréquents : ${profile.vocabulary.commonWords.slice(0, 20).join(', ')}\n`;
            }

            if (profile.vocabulary.commonPhrases && profile.vocabulary.commonPhrases.length > 0) {
                enrichedPrompt += `Expressions typiques : ${profile.vocabulary.commonPhrases.join(', ')}\n`;
            }

            if (profile.vocabulary.exerciseNaming) {
                enrichedPrompt += `Façon de nommer les exercices : ${profile.vocabulary.exerciseNaming}\n`;
            }
            enrichedPrompt += '\n';
        }

        // Exercices préférés
        if (profile.preferredExercises) {
            enrichedPrompt += '## EXERCICES PRÉFÉRÉS DU COACH :\n\n';

            Object.keys(profile.preferredExercises).forEach(category => {
                const exercises = profile.preferredExercises[category];
                if (exercises && exercises.length > 0) {
                    const topExercises = exercises
                        .sort((a, b) => b.frequency - a.frequency)
                        .slice(0, 5)
                        .map(e => e.exercise);
                    enrichedPrompt += `${category.toUpperCase()} : ${topExercises.join(', ')}\n`;
                }
            });
            enrichedPrompt += '\n';
        }

        // Schémas de progression
        if (profile.progressionPatterns && profile.progressionPatterns.length > 0) {
            enrichedPrompt += '## SCHÉMAS DE PROGRESSION UTILISÉS :\n\n';
            profile.progressionPatterns.forEach(pattern => {
                enrichedPrompt += `Type : ${pattern.type}\n`;
                if (pattern.examples) {
                    enrichedPrompt += `Exemples : ${pattern.examples.join(', ')}\n`;
                }
                enrichedPrompt += `Fréquence : ${pattern.frequency}\n\n`;
            });
        }

        // Structure des blocs
        if (profile.blockStructures) {
            enrichedPrompt += '## STRUCTURE DES BLOCS :\n\n';

            if (profile.blockStructures.warmup) {
                const wu = profile.blockStructures.warmup;
                enrichedPrompt += `Warm-up : ${wu.typicalDuration}\n`;
                enrichedPrompt += `Structure : ${wu.structure}\n`;
                if (wu.components) {
                    enrichedPrompt += `Composants : ${wu.components.join(', ')}\n`;
                }
                enrichedPrompt += '\n';
            }

            if (profile.blockStructures.mainBlocks) {
                const mb = profile.blockStructures.mainBlocks;
                enrichedPrompt += `Blocs principaux : ${mb.typicalNumber} blocs de ${mb.typicalDuration}\n`;
                enrichedPrompt += `Structure : ${mb.structure}\n\n`;
            }
        }

        // Repos
        if (profile.restPeriods) {
            enrichedPrompt += '## PÉRIODES DE REPOS :\n\n';
            enrichedPrompt += `Format : ${profile.restPeriods.format}\n`;
            if (profile.restPeriods.typical) {
                enrichedPrompt += `Typiques : ${profile.restPeriods.typical.join(', ')}\n`;
            }
            if (profile.restPeriods.byIntensity) {
                enrichedPrompt += 'Par intensité :\n';
                Object.keys(profile.restPeriods.byIntensity).forEach(intensity => {
                    enrichedPrompt += `  ${intensity} : ${profile.restPeriods.byIntensity[intensity]}\n`;
                });
            }
            enrichedPrompt += '\n';
        }

        // Notes de coaching
        if (profile.coachingNotes) {
            enrichedPrompt += '## STYLE DE COACHING :\n\n';
            enrichedPrompt += `Feedback : ${profile.coachingNotes.feedbackStyle}\n`;
            enrichedPrompt += `Focus sécurité : ${profile.coachingNotes.safetyFocus}\n`;
            enrichedPrompt += `Conseils stratégie : ${profile.coachingNotes.strategyTips}\n`;
            enrichedPrompt += `Style motivationnel : ${profile.coachingNotes.motivationalStyle}\n\n`;
        }

        // Philosophie
        if (profile.programmingPhilosophy) {
            enrichedPrompt += '## PHILOSOPHIE DE PROGRAMMATION :\n\n';
            enrichedPrompt += `${profile.programmingPhilosophy}\n\n`;
        }

        enrichedPrompt += '=== FIN DU PROFIL ===\n\n';
        enrichedPrompt += '⚠️ IMPORTANT : Utilise CE style exact pour générer la séance.\n';
        enrichedPrompt +=
            'Ne génère PAS dans un style générique. Reproduis EXACTEMENT ce coach.\n\n';

        return enrichedPrompt;
    },

    /**
     * Sauvegarde le profil dans localStorage
     */
    async saveCoachProfile() {
        try {
            localStorage.setItem('coachProfile', JSON.stringify(this.coachProfile));
            console.log('✅ Profil du coach sauvegardé');
        } catch (error) {
            console.error('Erreur sauvegarde profil:', error);
        }
    },

    /**
     * Charge le profil depuis localStorage
     */
    async loadCoachProfile() {
        try {
            const saved = localStorage.getItem('coachProfile');
            if (saved) {
                this.coachProfile = JSON.parse(saved);
                console.log(
                    `✅ Profil du coach chargé (${this.coachProfile.sessionsAnalyzed} séances analysées)`
                );
            }
        } catch (error) {
            console.error('Erreur chargement profil:', error);
        }
    },

    /**
     * Interface UI pour le système d'apprentissage
     */
    showLearningUI() {
        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-lg">
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-bold text-white mb-2">
                                🧠 Système d'Apprentissage du Style de Coach
                            </h2>
                            <p class="text-purple-100 text-sm">
                                L'IA apprend votre style unique de programmation et d'écriture
                            </p>
                        </div>
                        <button onclick="this.closest('.fixed').remove()"
                                class="text-white hover:text-gray-200 text-2xl leading-none">
                            ×
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6 space-y-6">

                    <!-- Statut actuel -->
                    <div id="learningStatus" class="bg-gray-800 rounded-lg p-5">
                        <h3 class="text-lg font-semibold text-white mb-3">📊 Statut du Profil</h3>
                        ${this.renderProfileStatus()}
                    </div>

                    <!-- Options d'analyse -->
                    <div class="bg-gray-800 rounded-lg p-5 space-y-4">
                        <h3 class="text-lg font-semibold text-white mb-4">🎯 Analyser vos séances</h3>

                        <!-- Analyse depuis Supabase -->
                        <div class="border border-gray-700 rounded-lg p-4">
                            <h4 class="font-semibold text-purple-400 mb-3">
                                📊 Depuis la base de données Supabase
                            </h4>
                            <p class="text-sm text-gray-400 mb-4">
                                Analyse automatique de toutes vos séances enregistrées dans Supabase
                            </p>
                            <div class="flex items-center gap-4 mb-4">
                                <label class="text-sm text-gray-300">Analyser les</label>
                                <select id="monthsBack" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                                    <option value="1">1 mois</option>
                                    <option value="3" selected>3 mois</option>
                                    <option value="6">6 mois</option>
                                    <option value="12">12 mois</option>
                                </select>
                                <span class="text-sm text-gray-300">derniers</span>
                            </div>
                            <button onclick="CoachLearningSystem.analyzeFromDatabaseUI()"
                                    id="analyzeDbBtn"
                                    class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all">
                                🚀 Analyser depuis Supabase
                            </button>
                        </div>

                        <!-- Import PDF -->
                        <div class="border border-gray-700 rounded-lg p-4">
                            <h4 class="font-semibold text-pink-400 mb-3">
                                📄 Import depuis PDFs
                            </h4>
                            <p class="text-sm text-gray-400 mb-4">
                                Importez vos PDFs de séances passées pour analyse
                            </p>
                            <input type="file"
                                   id="pdfFilesInput"
                                   accept=".pdf"
                                   multiple
                                   class="hidden">
                            <button onclick="document.getElementById('pdfFilesInput').click()"
                                    class="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all">
                                📎 Sélectionner des PDFs
                            </button>
                            <div id="pdfFilesList" class="mt-3 text-sm text-gray-400"></div>
                            <button onclick="CoachLearningSystem.analyzeFromPDFsUI()"
                                    id="analyzePdfBtn"
                                    class="w-full mt-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all hidden">
                                🔍 Analyser les PDFs
                            </button>
                        </div>
                    </div>

                    <!-- Résultat -->
                    <div id="learningResult" class="hidden"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listener pour les fichiers PDF
        document.getElementById('pdfFilesInput').addEventListener('change', e => {
            const files = e.target.files;
            const filesList = document.getElementById('pdfFilesList');
            const analyzeBtn = document.getElementById('analyzePdfBtn');

            if (files.length > 0) {
                filesList.innerHTML = `<p class="text-green-400">✅ ${files.length} fichier(s) sélectionné(s)</p>`;
                analyzeBtn.classList.remove('hidden');
            } else {
                filesList.innerHTML = '';
                analyzeBtn.classList.add('hidden');
            }
        });
    },

    /**
     * Affiche le statut du profil actuel
     */
    renderProfileStatus() {
        if (!this.coachProfile || !this.coachProfile.writingStyle) {
            return `
                <div class="text-gray-400 text-center py-4">
                    <p class="mb-2">❌ Aucun profil de coach chargé</p>
                    <p class="text-sm">Analysez vos séances pour créer votre profil personnalisé</p>
                </div>
            `;
        }

        const profile = this.coachProfile;
        return `
            <div class="space-y-3">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-xs text-gray-500">Séances analysées</p>
                        <p class="text-2xl font-bold text-purple-400">${profile.sessionsAnalyzed}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Dernière analyse</p>
                        <p class="text-sm text-white">${new Date(profile.lastAnalysis).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Source</p>
                        <p class="text-sm text-white">${profile.source === 'database' ? '📊 Supabase' : '📄 PDF'}</p>
                    </div>
                </div>

                ${
                    profile.writingStyle
                        ? `
                    <div class="bg-gray-900 rounded p-3 mt-4">
                        <p class="text-xs text-gray-500 mb-2">Style d'écriture détecté</p>
                        <p class="text-sm text-gray-300">${profile.writingStyle.tone}</p>
                        ${
                            profile.writingStyle.characteristics
                                ? `
                            <div class="flex flex-wrap gap-2 mt-2">
                                ${profile.writingStyle.characteristics
                                    .map(
                                        c =>
                                            `<span class="text-xs bg-purple-900 px-2 py-1 rounded">${c}</span>`
                                    )
                                    .join('')}
                            </div>
                        `
                                : ''
                        }
                    </div>
                `
                        : ''
                }

                <button onclick="CoachLearningSystem.showDetailedProfile()"
                        class="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm">
                    📋 Voir le profil détaillé
                </button>
            </div>
        `;
    },

    /**
     * Analyse depuis la base de données (UI)
     */
    async analyzeFromDatabaseUI() {
        const btn = document.getElementById('analyzeDbBtn');
        const resultDiv = document.getElementById('learningResult');

        try {
            btn.disabled = true;
            btn.innerHTML = '⏳ Analyse en cours...';

            const months = parseInt(document.getElementById('monthsBack').value);
            const profile = await this.analyzeFromDatabase(months);

            // Vérifier si le profil a été créé
            if (!profile || !profile.sessionsAnalyzed) {
                throw new Error(
                    'Aucune séance trouvée ou analyse échouée. Vérifiez votre connexion Supabase.'
                );
            }

            // Afficher le résultat
            resultDiv.className = 'bg-green-900 border border-green-700 rounded-lg p-5';
            resultDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-white mb-2">✅ Analyse terminée !</h3>
                <p class="text-green-200 text-sm mb-4">
                    Profil créé à partir de ${profile.sessionsAnalyzed} séances
                </p>
                <p class="text-green-100 text-sm">
                    L'IA utilisera maintenant ce profil pour générer des séances dans VOTRE style unique.
                </p>
            `;
            resultDiv.classList.remove('hidden');

            // Mettre à jour le statut
            document.getElementById('learningStatus').innerHTML = this.renderProfileStatus();

            btn.disabled = false;
            btn.innerHTML = '✅ Réanalyser depuis Supabase';
        } catch (error) {
            console.error(error);
            resultDiv.className = 'bg-red-900 border border-red-700 rounded-lg p-5';
            resultDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-white mb-2">❌ Erreur</h3>
                <p class="text-red-200 text-sm">${error.message}</p>
            `;
            resultDiv.classList.remove('hidden');

            btn.disabled = false;
            btn.innerHTML = '🚀 Analyser depuis Supabase';
        }
    },

    /**
     * Analyse depuis PDFs (UI)
     */
    async analyzeFromPDFsUI() {
        const btn = document.getElementById('analyzePdfBtn');
        const resultDiv = document.getElementById('learningResult');
        const filesInput = document.getElementById('pdfFilesInput');

        try {
            const files = Array.from(filesInput.files);
            if (files.length === 0) {
                throw new Error('Aucun fichier sélectionné');
            }

            btn.disabled = true;
            btn.innerHTML = '⏳ Analyse des PDFs en cours...';

            const profile = await this.analyzeFromPDFs(files);

            // Afficher le résultat
            resultDiv.className = 'bg-green-900 border border-green-700 rounded-lg p-5';
            resultDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-white mb-2">✅ Analyse terminée !</h3>
                <p class="text-green-200 text-sm mb-4">
                    Profil créé à partir de ${profile.sessionsAnalyzed} séances extraites des PDFs
                </p>
                <p class="text-green-100 text-sm">
                    L'IA utilisera maintenant ce profil pour générer des séances dans VOTRE style unique.
                </p>
            `;
            resultDiv.classList.remove('hidden');

            // Mettre à jour le statut
            document.getElementById('learningStatus').innerHTML = this.renderProfileStatus();

            btn.disabled = false;
            btn.innerHTML = '✅ PDFs analysés';
        } catch (error) {
            console.error(error);
            resultDiv.className = 'bg-red-900 border border-red-700 rounded-lg p-5';
            resultDiv.innerHTML = `
                <h3 class="text-lg font-semibold text-white mb-2">❌ Erreur</h3>
                <p class="text-red-200 text-sm">${error.message}</p>
            `;
            resultDiv.classList.remove('hidden');

            btn.disabled = false;
            btn.innerHTML = '🔍 Analyser les PDFs';
        }
    },

    /**
     * Affiche le profil détaillé
     */
    showDetailedProfile() {
        if (!this.coachProfile || !this.coachProfile.writingStyle) {
            alert('Aucun profil disponible');
            return;
        }

        const modal = document.createElement('div');
        modal.className =
            'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
                    <div class="flex justify-between items-start">
                        <h2 class="text-2xl font-bold text-white">📋 Profil Détaillé du Coach</h2>
                        <button onclick="this.closest('.fixed').remove()"
                                class="text-white hover:text-gray-200 text-2xl leading-none">×</button>
                    </div>
                </div>
                <div class="p-6">
                    <pre class="bg-gray-800 p-4 rounded text-xs text-gray-300 overflow-x-auto">${JSON.stringify(this.coachProfile, null, 2)}</pre>
                    <button onclick="navigator.clipboard.writeText(JSON.stringify(CoachLearningSystem.coachProfile, null, 2))"
                            class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                        📋 Copier le JSON
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
};

// Initialisation automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CoachLearningSystem.init());
} else {
    CoachLearningSystem.init();
}

// Export global
window.CoachLearningSystem = CoachLearningSystem;
