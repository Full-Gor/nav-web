/**
 * Cell - Assistant intelligent pour le navigateur web
 * Version JavaScript pure (converti depuis TypeScript)
 */

class CellAI {
    constructor() {
        this.name = "Cell";
        this.groqApiKey = "VOTRE_CLE_API_GROQ";
        this.context = {
            currentPage: null,
            pageContent: null,
            browserFeatures: this.getBrowserFeatures(),
            conversationHistory: []
        };
    }

    /**
     * Définit les fonctionnalités du navigateur que Cell connaît
     */
    getBrowserFeatures() {
        return {
            navigation: {
                back: "Retourner à la page précédente",
                forward: "Avancer à la page suivante",
                refresh: "Rafraîchir la page actuelle",
                home: "Retourner à la page d'accueil"
            },
            tabs: {
                new: "Ouvrir un nouvel onglet",
                close: "Fermer l'onglet actuel",
                switch: "Basculer entre les onglets"
            },
            search: {
                web: "Rechercher sur le web",
                inPage: "Rechercher dans la page"
            },
            ai: {
                summarize: "Résumer la page actuelle",
                answer: "Répondre à vos questions",
                generate: "Générer du texte",
                boost: "Améliorer vos recherches"
            },
            vr: {
                enable: "Activer le mode VR/réalité virtuelle",
                disable: "Quitter le mode VR",
                spatialTabs: "Organiser les onglets dans l'espace 3D",
                gazeControl: "Contrôle par le regard",
                compatible: "Compatible Meta Quest, Apple Vision Pro, et autres casques VR/AR"
            }
        };
    }

    /**
     * Appelle l'API Groq pour générer des réponses intelligentes
     */
    async callGroqAPI(prompt) {
        try {
            console.log('🔵 [Groq] Appel API avec prompt:', prompt.substring(0, 50) + '...');

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.groqApiKey}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'Tu es un assistant IA masculin intégré dans un navigateur web. Réponds de manière directe et concise, sans emojis, comme un homme qui aide efficacement. Sois professionnel mais accessible. Tu aides avec la navigation, les recherches et les questions. Ne mentionne jamais ton nom.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            console.log('🔵 [Groq] Statut réponse:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ [Groq] Erreur API - Status:', response.status);
                console.error('❌ [Groq] Erreur API - Détails:', JSON.stringify(errorData, null, 2));
                throw new Error(`Groq API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ [Groq] Réponse reçue');
            return data.choices[0].message.content;
        } catch (error) {
            console.error('❌ [Groq] Erreur:', error);
            console.error('❌ [Groq] Fallback vers réponses locales');
            return this.generateSmartResponse(prompt);
        }
    }

    /**
     * Met à jour le contexte de la page actuelle
     */
    updatePageContext(url, content = null) {
        this.context.currentPage = url;
        this.context.pageContent = content;
    }

    /**
     * Résume le contenu d'une page web
     */
    async summarizePage(pageContent) {
        if (!pageContent) {
            return "Je n'ai pas accès au contenu de cette page pour le résumer.";
        }

        return `Résumé de la page:\n\nCette page contient des informations ${this.analyzeContent(pageContent)}. Voulez-vous que je vous explique quelque chose de spécifique?`;
    }

    /**
     * Analyse le type de contenu
     */
    analyzeContent(content) {
        const lowerContent = content.toLowerCase();

        if (lowerContent.includes('article') || lowerContent.includes('news')) {
            return "sous forme d'article ou de nouvelles";
        } else if (lowerContent.includes('product') || lowerContent.includes('shop')) {
            return "commerciales sur des produits";
        } else if (lowerContent.includes('video') || lowerContent.includes('watch')) {
            return "vidéo et multimédia";
        } else if (lowerContent.includes('documentation') || lowerContent.includes('tutorial')) {
            return "techniques et documentaires";
        }
        return "diverses";
    }

    /**
     * Répond aux questions sur le navigateur
     */
    async answerBrowserQuestion(question) {
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes('comment') && (lowerQuestion.includes('retour') || lowerQuestion.includes('back'))) {
            return "Pour revenir en arrière, utilisez le bouton flèche gauche en haut de l'écran. Vous pouvez aussi me dire 'Cell, reviens en arrière'.";
        }

        if (lowerQuestion.includes('onglet') || lowerQuestion.includes('tab')) {
            return "Pour gérer les onglets:\n• Cliquez sur le + pour un nouvel onglet\n• Cliquez sur un onglet pour le sélectionner\n• Cliquez sur X pour fermer un onglet\n• Dites-moi 'Cell, ouvre un nouvel onglet'";
        }

        if (lowerQuestion.includes('recherche') || lowerQuestion.includes('search')) {
            return "Pour rechercher:\n• Tapez dans la barre d'adresse en haut\n• Si c'est une URL, je naviguerai vers le site\n• Sinon, je lancerai une recherche\n• Dites-moi 'Cell, recherche [votre requête]'";
        }

        if (lowerQuestion.includes('aide') || lowerQuestion.includes('help')) {
            return this.getHelpMessage();
        }

        return null;
    }

    /**
     * Répond aux questions générales avec contexte de page
     */
    async answerQuestion(question) {
        const browserAnswer = await this.answerBrowserQuestion(question);
        if (browserAnswer) return browserAnswer;

        const lowerQuestion = question.toLowerCase();

        if (this.context.currentPage) {
            if (lowerQuestion.includes('cette page') || lowerQuestion.includes('ce site')) {
                return `Vous êtes actuellement sur: ${this.context.currentPage}\n\nVoulez-vous que je résume le contenu de cette page?`;
            }

            if (lowerQuestion.includes('résume') || lowerQuestion.includes('summary')) {
                return await this.summarizePage(this.context.pageContent);
            }
        }

        // Utiliser Groq API pour les questions générales
        return await this.callGroqAPI(question);
    }

    /**
     * Génère une réponse intelligente (fallback)
     */
    generateSmartResponse(question) {
        const responses = {
            greeting: [
                "Bonjour. Comment puis-je vous aider?",
                "Salut. Prêt à explorer le web ensemble?",
                "Hello. Que puis-je faire pour vous?"
            ],
            thanks: [
                "De rien. N'hésitez pas si vous avez d'autres questions.",
                "Avec plaisir. Je suis là pour vous aider.",
                "Content d'avoir pu vous aider."
            ],
            default: [
                "Intéressant. Voulez-vous que je fasse une recherche sur ce sujet?",
                "Je peux vous aider à trouver des informations sur ce sujet. Voulez-vous que je lance une recherche?",
                "Bonne question. Laissez-moi vous aider à trouver la réponse."
            ]
        };

        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.match(/bonjour|salut|hello|hi|hey/)) {
            return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
        }

        if (lowerQuestion.match(/merci|thanks|thank you/)) {
            return responses.thanks[Math.floor(Math.random() * responses.thanks.length)];
        }

        return responses.default[Math.floor(Math.random() * responses.default.length)];
    }

    /**
     * Booste une recherche en ajoutant des mots-clés pertinents
     */
    boostSearch(query) {
        const lowerQuery = query.toLowerCase();
        let boostedQuery = query;
        let suggestions = [];

        if (lowerQuery.includes('comment')) {
            suggestions.push('tutorial', 'guide', 'how to');
            boostedQuery = `${query} tutorial guide`;
        } else if (lowerQuery.includes('meilleur') || lowerQuery.includes('best')) {
            suggestions.push('review', 'comparison', '2024');
            boostedQuery = `${query} review comparison 2024`;
        } else if (lowerQuery.includes('acheter') || lowerQuery.includes('buy')) {
            suggestions.push('price', 'buy', 'shop');
        }

        return {
            original: query,
            boosted: boostedQuery,
            suggestions: suggestions,
            message: suggestions.length > 0
                ? `J'ai optimisé votre recherche en ajoutant: ${suggestions.join(', ')}`
                : `Recherche de: ${query}`
        };
    }

    /**
     * Traite une commande vocale ou textuelle
     */
    async processCommand(command) {
        const lowerCommand = command.toLowerCase();

        // Navigation
        if (lowerCommand.includes('retour') || lowerCommand.includes('back')) {
            return { action: 'navigate', direction: 'back', message: 'Retour à la page précédente' };
        }

        if (lowerCommand.includes('avant') || lowerCommand.includes('forward')) {
            return { action: 'navigate', direction: 'forward', message: 'Page suivante' };
        }

        if (lowerCommand.includes('rafraîchir') || lowerCommand.includes('refresh') || lowerCommand.includes('reload')) {
            return { action: 'navigate', direction: 'refresh', message: 'Rafraîchissement de la page' };
        }

        // Onglets
        if (lowerCommand.includes('nouvel onglet') || lowerCommand.includes('new tab') || lowerCommand.includes('ouvre un onglet')) {
            return { action: 'tab', operation: 'new', message: "Ouverture d'un nouvel onglet" };
        }

        if (lowerCommand.includes('fermer onglet') || lowerCommand.includes('close tab') || lowerCommand.includes("ferme l'onglet")) {
            return { action: 'tab', operation: 'close', message: "Fermeture de l'onglet" };
        }

        // Résumé de page
        if (lowerCommand.includes('résume') || lowerCommand.includes('summarize')) {
            const summary = await this.summarizePage(this.context.pageContent);
            return { action: 'answer', message: summary };
        }

        // Aide
        if (lowerCommand === 'aide' || lowerCommand === 'help') {
            return { action: 'answer', message: this.getHelpMessage() };
        }

        // Questions conversationnelles (NE PAS chercher sur internet)
        const conversationalPatterns = [
            /^(comment|ca|ça)\s+(va|vas|tu vas|allez|ca va|ça va)/i,
            /^(salut|bonjour|hello|hi|hey)/i,
            /^(merci|thanks|thank you)/i,
            /^(qui es-tu|tu es qui|c'est quoi ton nom)/i,
            /^(comment tu t'appelles|quel est ton nom)/i,
            /^(que peux-tu faire|quelles sont tes capacités)/i
        ];

        const isConversational = conversationalPatterns.some(pattern => pattern.test(lowerCommand));

        if (isConversational) {
            const answer = await this.answerQuestion(command);
            return { action: 'answer', message: answer };
        }

        // Détecter les intentions de recherche pour des informations factuelles
        const searchKeywords = ['météo', 'meteo', 'weather', 'température', 'cherche', 'trouve', 'search', 'prix', 'acheter', 'restaurant', 'hotel'];
        const searchPatterns = [
            /^(quelle est|quel est|quels sont|quelles sont)\s+(?!ton|ta|tes)/i,
            /^(qui est|où est|où se trouve)\s+[A-Z]/i,
            /^(comment faire|comment aller|comment se rendre)/i
        ];

        const isSearchIntent = searchKeywords.some(keyword => lowerCommand.includes(keyword)) ||
                              searchPatterns.some(pattern => pattern.test(command)) ||
                              (lowerCommand.endsWith('?') && lowerCommand.length > 20) ||
                              lowerCommand.startsWith('recherche ') ||
                              lowerCommand.startsWith('search ');

        if (isSearchIntent) {
            // Nettoyer la requête
            let query = command
                .replace(/^(recherche|search|cherche|trouve)\s+/i, '')
                .replace(/^(quelle est|quel est|qui est|où est|comment)\s+/i, '$& ')
                .trim();

            const boosted = this.boostSearch(query);
            return {
                action: 'search',
                query: boosted.boosted,
                message: `Recherche de: ${query}`,
                original: query
            };
        }

        // Pour les autres questions, utiliser Groq API
        const answer = await this.answerQuestion(command);
        return { action: 'answer', message: answer };
    }

    /**
     * Message d'aide complet
     */
    getHelpMessage() {
        return `Je suis Cell, votre assistant de navigation.

MES CAPACITES:

RECHERCHE
• "Recherche [sujet]" - Je vais optimiser votre recherche

ANALYSE DE PAGE
• "Résume cette page" - Je vais résumer le contenu
• "De quoi parle cette page?" - Je vais analyser le contenu

NAVIGATION
• "Retour" - Page précédente
• "Avant" - Page suivante
• "Rafraîchir" - Recharger la page

GESTION D'ONGLETS
• "Nouvel onglet" - Ouvrir un onglet
• "Fermer onglet" - Fermer l'onglet actuel

QUESTIONS
• Posez-moi des questions sur le navigateur
• Demandez-moi de l'aide sur n'importe quel sujet

Tapez votre question dans le chat.`;
    }

    /**
     * Ajoute un message à l'historique
     */
    addToHistory(role, message) {
        this.context.conversationHistory.push({
            role,
            message,
            timestamp: new Date()
        });

        if (this.context.conversationHistory.length > 50) {
            this.context.conversationHistory = this.context.conversationHistory.slice(-50);
        }
    }
}

// Export singleton
const cellAI = new CellAI();
