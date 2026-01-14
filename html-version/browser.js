/**
 * Cell Browser - Version JavaScript pure
 * Converti depuis React/Next.js
 */

// État global de l'application
const state = {
    tabs: [{
        id: 1,
        url: 'search.html',
        title: 'Cell',
        canGoBack: false,
        canGoForward: false,
        loading: false
    }],
    activeTabId: 1,
    nextTabId: 2,
    bookmarks: [],
    history: [],
    downloads: [],
    isPrivateMode: false,
    isFullscreen: false,
    isLightTheme: true,
    customThemeColor: '#000000',
    savedBookmarks: [],
    savedHistory: [],
    savedDownloads: [],
    savedThemeType: 'light',
    historyIdCounter: 1,
    bookmarkIdCounter: 1,
    downloadIdCounter: 1,
    iframeRefs: {},
    selectedSuggestionIndex: -1,
    chatMessages: [{
        id: 1,
        role: 'cell',
        text: "Salut. Je suis Cell, votre assistant de navigation. Parlez-moi directement, posez vos questions, demandez-moi de naviguer ou de chercher quelque chose. Je suis là pour vous.",
        timestamp: new Date()
    }],
    isSpeaking: false
};

// Thèmes disponibles
const themes = [
    { color: '#000000', name: 'Clair', type: 'light' },
    { color: '#2196f3', name: 'Clair Bleu', type: 'light' },
    { color: '#00ffff', name: 'Cyan', type: 'dark' }
];

// Langues pour la traduction
const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh-CN', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ru', name: 'Русский' }
];

// Sites populaires pour les suggestions
const popularSites = [
    { text: 'YouTube', url: 'https://youtube.com' },
    { text: 'Gmail', url: 'https://gmail.com' },
    { text: 'Facebook', url: 'https://facebook.com' },
    { text: 'Twitter', url: 'https://twitter.com' },
    { text: 'Instagram', url: 'https://instagram.com' },
    { text: 'Reddit', url: 'https://reddit.com' },
    { text: 'StackOverflow', url: 'https://stackoverflow.com' },
    { text: 'GitHub', url: 'https://github.com' },
    { text: 'Netflix', url: 'https://netflix.com' },
    { text: 'Amazon', url: 'https://amazon.com' },
    { text: 'Wikipedia', url: 'https://wikipedia.org' },
    { text: 'LinkedIn', url: 'https://linkedin.com' },
    { text: 'Google', url: 'https://google.com' },
    { text: 'Google Maps', url: 'https://maps.google.com' },
    { text: 'Météo Paris', url: 'https://www.google.com/search?q=météo+paris' },
    { text: 'Actualités', url: 'https://news.google.com' }
];

// ============= FONCTIONS UTILITAIRES =============

function getActiveTab() {
    return state.tabs.find(tab => tab.id === state.activeTabId);
}

function getThemeColor() {
    return state.isPrivateMode ? '#ff0000' : state.customThemeColor;
}

function getEffectiveIsLightTheme() {
    return state.isPrivateMode ? false : state.isLightTheme;
}

function getBgColor() {
    return getEffectiveIsLightTheme() ? '#ffffff' : '#0a0a0a';
}

function getBgColorSecondary() {
    return getEffectiveIsLightTheme() ? '#f5f5f5' : '#1a1a1a';
}

// ============= GESTION DES THÈMES =============

function applyTheme() {
    const themeColor = getThemeColor();
    const isLight = getEffectiveIsLightTheme();

    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--bg-color', getBgColor());
    document.documentElement.style.setProperty('--bg-color-secondary', getBgColorSecondary());

    document.body.classList.toggle('light-theme', isLight);
    document.body.classList.toggle('private-mode', state.isPrivateMode);

    // Envoyer le thème aux iframes
    Object.values(state.iframeRefs).forEach(iframe => {
        if (iframe && iframe.contentWindow) {
            try {
                iframe.contentWindow.postMessage({
                    type: 'themeUpdate',
                    themeColor: themeColor,
                    isLightTheme: isLight
                }, '*');
            } catch (e) {
                // Ignorer les erreurs cross-origin
            }
        }
    });

    // Sauvegarder dans localStorage
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('themeType', isLight ? 'light' : 'dark');
    localStorage.setItem('customThemeColor', state.customThemeColor);
}

function handleThemeChange(color, type) {
    state.customThemeColor = color;
    state.isLightTheme = type === 'light';
    applyTheme();
    hideAllMenus();
}

function loadThemeFromStorage() {
    const savedColor = localStorage.getItem('customThemeColor');
    const savedType = localStorage.getItem('themeType');

    if (savedColor) {
        state.customThemeColor = savedColor;
    }
    if (savedType) {
        state.isLightTheme = savedType === 'light';
    }

    applyTheme();
}

// ============= GESTION DES ONGLETS =============

function renderTabs() {
    const tabsScroll = document.getElementById('tabsScroll');
    tabsScroll.innerHTML = '';

    state.tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${tab.id === state.activeTabId ? 'active' : ''}`;
        tabEl.dataset.tabId = tab.id;

        // Titre de l'onglet
        let title = tab.title || tab.url;
        if (title && title !== 'about:blank') {
            title = title.replace(/^https?:\/\//i, '');
            title = title.length > 20 ? title.substring(0, 20) + '...' : title;
        } else {
            title = 'Nouvel onglet';
        }

        tabEl.innerHTML = `
            <span class="tab-text">${title}</span>
            ${state.tabs.length > 1 ? `
                <button class="tab-close" data-close-tab="${tab.id}">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
            ` : ''}
        `;

        tabEl.addEventListener('click', (e) => {
            if (!e.target.closest('.tab-close')) {
                handleTabChange(tab.id);
            }
        });

        const closeBtn = tabEl.querySelector('.tab-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
            });
        }

        tabsScroll.appendChild(tabEl);
    });
}

function handleNewTab() {
    const newTab = {
        id: state.nextTabId,
        url: 'search.html',
        title: 'Nouvel onglet',
        canGoBack: false,
        canGoForward: false,
        loading: false
    };

    state.tabs.push(newTab);
    state.activeTabId = state.nextTabId;
    state.nextTabId++;

    renderTabs();
    renderWebviews();
    updateUrlInput();
}

function handleCloseTab(tabId) {
    if (state.tabs.length === 1) return;

    const currentIndex = state.tabs.findIndex(tab => tab.id === tabId);
    state.tabs = state.tabs.filter(tab => tab.id !== tabId);

    if (tabId === state.activeTabId) {
        const newActiveTab = state.tabs[currentIndex] || state.tabs[currentIndex - 1];
        state.activeTabId = newActiveTab.id;
    }

    delete state.iframeRefs[tabId];

    renderTabs();
    renderWebviews();
    updateUrlInput();
}

function handleTabChange(tabId) {
    state.activeTabId = tabId;
    renderTabs();
    renderWebviews();
    updateUrlInput();
}

function updateTab(tabId, updates) {
    state.tabs = state.tabs.map(tab =>
        tab.id === tabId ? { ...tab, ...updates } : tab
    );
    renderTabs();
}

// ============= GESTION DES WEBVIEWS (IFRAMES) =============

function renderWebviews() {
    const container = document.getElementById('webviewContainer');

    // Supprimer les iframes des onglets qui n'existent plus
    const existingIframes = container.querySelectorAll('iframe');
    existingIframes.forEach(iframe => {
        const tabId = parseInt(iframe.dataset.tabId);
        if (!state.tabs.find(t => t.id === tabId)) {
            iframe.remove();
        }
    });

    // Créer ou mettre à jour les iframes
    state.tabs.forEach(tab => {
        let iframe = container.querySelector(`iframe[data-tab-id="${tab.id}"]`);

        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.className = 'webview';
            iframe.dataset.tabId = tab.id;
            iframe.src = tab.url;

            iframe.addEventListener('load', () => {
                updateTab(tab.id, { loading: false });
                if (tab.id === state.activeTabId) {
                    addToHistory(tab.url, tab.title || tab.url);
                }
            });

            container.appendChild(iframe);
            state.iframeRefs[tab.id] = iframe;
        }

        // Afficher/masquer selon l'onglet actif
        iframe.classList.toggle('hidden', tab.id !== state.activeTabId);

        // Mettre à jour l'URL si elle a changé
        if (iframe.src !== tab.url && !iframe.src.endsWith(tab.url)) {
            iframe.src = tab.url;
        }
    });
}

// ============= NAVIGATION =============

function handleNavigate() {
    const urlInput = document.getElementById('urlInput');
    let formattedUrl = urlInput.value.trim();

    hideSuggestions();

    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('/')) {
        if (formattedUrl.includes('.') && !formattedUrl.includes(' ')) {
            formattedUrl = `https://${formattedUrl}`;
        } else {
            // Utiliser la page de recherche personnalisée
            formattedUrl = `search.html?q=${encodeURIComponent(formattedUrl)}`;
        }
    }

    updateTab(state.activeTabId, { url: formattedUrl });
    renderWebviews();
}

function handleGoBack() {
    const iframe = state.iframeRefs[state.activeTabId];
    const activeTab = getActiveTab();
    if (iframe && iframe.contentWindow && activeTab?.canGoBack) {
        iframe.contentWindow.history.back();
    }
}

function handleGoForward() {
    const iframe = state.iframeRefs[state.activeTabId];
    const activeTab = getActiveTab();
    if (iframe && iframe.contentWindow && activeTab?.canGoForward) {
        iframe.contentWindow.history.forward();
    }
}

function handleRefresh() {
    const iframe = state.iframeRefs[state.activeTabId];
    if (iframe) {
        iframe.src = iframe.src;
    }
}

function updateUrlInput() {
    const activeTab = getActiveTab();
    const urlInput = document.getElementById('urlInput');
    if (activeTab) {
        urlInput.value = activeTab.url.replace(/^https?:\/\//, '');
    }
    updateClearButton();
}

function updateClearButton() {
    const urlInput = document.getElementById('urlInput');
    const clearBtn = document.getElementById('clearUrlBtn');
    clearBtn.classList.toggle('hidden', !urlInput.value);
}

// ============= SUGGESTIONS =============

function generateSuggestions(value) {
    if (!value.trim()) {
        hideSuggestions();
        return;
    }

    const lowerValue = value.toLowerCase();

    const suggestions = [
        ...state.history
            .filter(h => h.url.toLowerCase().includes(lowerValue) || h.title.toLowerCase().includes(lowerValue))
            .slice(0, 3)
            .map(h => ({ text: h.title, url: h.url })),
        ...state.bookmarks
            .filter(b => b.url.toLowerCase().includes(lowerValue) || b.title.toLowerCase().includes(lowerValue))
            .slice(0, 3)
            .map(b => ({ text: b.title, url: b.url })),
        ...popularSites
            .filter(s => s.text.toLowerCase().includes(lowerValue))
            .slice(0, 5)
    ].slice(0, 8);

    // Supprimer les doublons
    const uniqueSuggestions = suggestions.filter((item, index, self) =>
        index === self.findIndex(t => t.url === item.url)
    );

    if (uniqueSuggestions.length > 0) {
        showSuggestions(uniqueSuggestions);
    } else {
        hideSuggestions();
    }
}

function showSuggestions(suggestions) {
    const box = document.getElementById('suggestionsBox');
    box.innerHTML = suggestions.map((s, i) => `
        <div class="suggestion-item ${i === state.selectedSuggestionIndex ? 'selected' : ''}" data-index="${i}" data-url="${s.url}">
            <span class="suggestion-icon">🔍</span>
            <div style="flex: 1">
                <div class="suggestion-text">${s.text}</div>
                <div class="suggestion-url">${s.url}</div>
            </div>
        </div>
    `).join('');

    box.classList.remove('hidden');

    // Ajouter les event listeners
    box.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('urlInput').value = item.dataset.url;
            hideSuggestions();
            handleNavigate();
        });
    });
}

function hideSuggestions() {
    document.getElementById('suggestionsBox').classList.add('hidden');
    state.selectedSuggestionIndex = -1;
}

function handleUrlKeyDown(e) {
    const box = document.getElementById('suggestionsBox');
    const isVisible = !box.classList.contains('hidden');
    const items = box.querySelectorAll('.suggestion-item');

    if (!isVisible || items.length === 0) {
        if (e.key === 'Enter') {
            handleNavigate();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            state.selectedSuggestionIndex = Math.min(state.selectedSuggestionIndex + 1, items.length - 1);
            updateSuggestionSelection();
            break;
        case 'ArrowUp':
            e.preventDefault();
            state.selectedSuggestionIndex = Math.max(state.selectedSuggestionIndex - 1, -1);
            updateSuggestionSelection();
            break;
        case 'Tab':
            e.preventDefault();
            if (state.selectedSuggestionIndex >= 0 && state.selectedSuggestionIndex < items.length) {
                document.getElementById('urlInput').value = items[state.selectedSuggestionIndex].dataset.url;
                hideSuggestions();
            } else if (items.length > 0) {
                state.selectedSuggestionIndex = 0;
                updateSuggestionSelection();
            }
            break;
        case 'Enter':
            e.preventDefault();
            if (state.selectedSuggestionIndex >= 0 && state.selectedSuggestionIndex < items.length) {
                document.getElementById('urlInput').value = items[state.selectedSuggestionIndex].dataset.url;
                hideSuggestions();
            }
            handleNavigate();
            break;
        case 'Escape':
            hideSuggestions();
            break;
    }
}

function updateSuggestionSelection() {
    const items = document.querySelectorAll('.suggestion-item');
    items.forEach((item, i) => {
        item.classList.toggle('selected', i === state.selectedSuggestionIndex);
    });
}

// ============= FAVORIS =============

function isBookmarked() {
    const activeTab = getActiveTab();
    return state.bookmarks.some(b => b.url === activeTab?.url);
}

function addBookmark() {
    if (state.isPrivateMode) return;

    const activeTab = getActiveTab();
    if (activeTab && !isBookmarked()) {
        state.bookmarks.push({
            id: `bookmark_${state.bookmarkIdCounter++}`,
            url: activeTab.url,
            title: activeTab.title || activeTab.url,
            timestamp: new Date().toISOString()
        });
    }
    updateBookmarkButton();
}

function removeBookmark() {
    const activeTab = getActiveTab();
    state.bookmarks = state.bookmarks.filter(b => b.url !== activeTab?.url);
    updateBookmarkButton();
}

function updateBookmarkButton() {
    const btn = document.getElementById('bookmarkBtn');
    btn.classList.toggle('bookmarked', isBookmarked());
}

function renderBookmarksMenu() {
    const list = document.getElementById('bookmarksList');

    if (state.bookmarks.length === 0) {
        list.innerHTML = '<div class="menu-empty-text">Aucun favori</div>';
        return;
    }

    list.innerHTML = state.bookmarks.map(b => `
        <div class="menu-item" data-url="${b.url}">
            <div class="menu-item-title">${b.title}</div>
            <div class="menu-item-url">${b.url}</div>
        </div>
    `).join('');

    list.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('urlInput').value = item.dataset.url;
            hideAllMenus();
            handleNavigate();
        });
    });
}

// ============= HISTORIQUE =============

function addToHistory(url, title) {
    if (state.isPrivateMode) return;

    state.history.unshift({
        id: `history_${state.historyIdCounter++}`,
        url,
        title,
        timestamp: new Date().toISOString()
    });

    // Limiter à 100 entrées
    state.history = state.history.slice(0, 100);
}

function clearHistory() {
    state.history = [];
    renderHistoryMenu();
    hideAllMenus();
}

function renderHistoryMenu() {
    const list = document.getElementById('historyList');

    if (state.history.length === 0) {
        list.innerHTML = '<div class="menu-empty-text">Aucun historique</div>';
        return;
    }

    list.innerHTML = `
        <button class="clear-button" id="clearHistoryBtn">Effacer l'historique</button>
        ${state.history.map(h => `
            <div class="menu-item" data-url="${h.url}">
                <div class="menu-item-title">${h.title}</div>
                <div class="menu-item-url">${h.url}</div>
            </div>
        `).join('')}
    `;

    document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);

    list.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('urlInput').value = item.dataset.url;
            hideAllMenus();
            handleNavigate();
        });
    });
}

// ============= TÉLÉCHARGEMENTS =============

function clearDownloads() {
    state.downloads = [];
    renderDownloadsMenu();
    hideAllMenus();
}

function renderDownloadsMenu() {
    const list = document.getElementById('downloadsList');

    if (state.downloads.length === 0) {
        list.innerHTML = '<div class="menu-empty-text">Aucun téléchargement</div>';
        return;
    }

    list.innerHTML = `
        <button class="clear-button" id="clearDownloadsBtn">Effacer l'historique</button>
        ${state.downloads.map(d => `
            <div class="menu-item">
                <div class="menu-item-title">${d.filename}</div>
                <div class="menu-item-url">${new Date(d.timestamp).toLocaleString('fr-FR')}</div>
            </div>
        `).join('')}
    `;

    document.getElementById('clearDownloadsBtn')?.addEventListener('click', clearDownloads);
}

// ============= TRADUCTION =============

function handleTranslate(targetLang) {
    const activeTab = getActiveTab();
    if (activeTab?.url) {
        const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${targetLang}&u=${encodeURIComponent(activeTab.url)}`;
        updateTab(state.activeTabId, { url: translateUrl });
        renderWebviews();
        hideAllMenus();
    }
}

function renderTranslateMenu() {
    const list = document.getElementById('translateList');
    list.innerHTML = languages.map(lang => `
        <div class="menu-item" data-lang="${lang.code}">
            <div class="menu-item-title">${lang.name}</div>
        </div>
    `).join('');

    list.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            handleTranslate(item.dataset.lang);
        });
    });
}

// ============= THÈMES MENU =============

function renderThemeMenu() {
    const list = document.getElementById('themeList');
    list.innerHTML = themes.map(theme => `
        <div class="menu-item theme-item" data-color="${theme.color}" data-type="${theme.type}">
            <div class="theme-color-preview ${state.customThemeColor === theme.color && state.isLightTheme === (theme.type === 'light') ? 'active' : ''}" style="background-color: ${theme.color}"></div>
            <div class="menu-item-title">${theme.name}</div>
        </div>
    `).join('');

    list.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            handleThemeChange(item.dataset.color, item.dataset.type);
        });
    });
}

// ============= MODE PRIVÉ =============

function togglePrivateMode() {
    if (!state.isPrivateMode) {
        // Entrer en mode privé : sauvegarder l'état actuel
        state.savedBookmarks = [...state.bookmarks];
        state.savedHistory = [...state.history];
        state.savedDownloads = [...state.downloads];
        state.savedThemeType = state.isLightTheme ? 'light' : 'dark';
        state.isPrivateMode = true;
    } else {
        // Quitter le mode privé : restaurer l'état sauvegardé
        state.bookmarks = state.savedBookmarks;
        state.history = state.savedHistory;
        state.downloads = state.savedDownloads;
        state.isPrivateMode = false;
    }

    applyTheme();
    document.getElementById('privateModeText').classList.toggle('hidden', !state.isPrivateMode);
}

// ============= PLEIN ÉCRAN =============

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            state.isFullscreen = true;
            updateFullscreenButton();
        }).catch(err => {
            console.error('Erreur fullscreen:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            state.isFullscreen = false;
            updateFullscreenButton();
        });
    }
}

function updateFullscreenButton() {
    document.getElementById('fullscreenIcon').style.display = state.isFullscreen ? 'none' : 'block';
    document.getElementById('exitFullscreenIcon').style.display = state.isFullscreen ? 'block' : 'none';
}

// ============= MENUS =============

function hideAllMenus() {
    document.querySelectorAll('.menu').forEach(menu => menu.classList.add('hidden'));
}

function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    const isHidden = menu.classList.contains('hidden');

    hideAllMenus();

    if (isHidden) {
        // Rendre le menu
        if (menuId === 'bookmarksMenu') renderBookmarksMenu();
        if (menuId === 'historyMenu') renderHistoryMenu();
        if (menuId === 'downloadsMenu') renderDownloadsMenu();
        if (menuId === 'translateMenu') renderTranslateMenu();
        if (menuId === 'themeMenu') renderThemeMenu();

        menu.classList.remove('hidden');
    }
}

// ============= CHAT CELL =============

function toggleChat() {
    const container = document.getElementById('chatContainer');
    container.classList.toggle('hidden');
}

function renderChatMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = state.chatMessages.map(msg => `
        <div class="message-row ${msg.role}">
            ${msg.role === 'cell' ? `
                <div class="message-avatar">
                    <span class="avatar-text">Cell</span>
                </div>
            ` : ''}
            <div class="message-card">
                <span class="message-text">${msg.text}</span>
                ${msg.role === 'cell' ? `
                    <button class="speak-button" data-text="${encodeURIComponent(msg.text)}">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    </button>
                ` : ''}
            </div>
            ${msg.role === 'user' ? `
                <div class="message-avatar">
                    <span class="avatar-text">Vous</span>
                </div>
            ` : ''}
        </div>
    `).join('');

    // Scroll vers le bas
    container.scrollTop = container.scrollHeight;

    // Ajouter les event listeners pour la synthèse vocale
    container.querySelectorAll('.speak-button').forEach(btn => {
        btn.addEventListener('click', () => {
            speakMessage(decodeURIComponent(btn.dataset.text));
        });
    });
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Ajouter le message utilisateur
    state.chatMessages.push({
        id: Date.now(),
        role: 'user',
        text: message,
        timestamp: new Date()
    });

    input.value = '';
    renderChatMessages();

    // Traiter avec Cell AI
    try {
        const response = await cellAI.processCommand(message);

        // Ajouter la réponse de Cell
        state.chatMessages.push({
            id: Date.now() + 1,
            role: 'cell',
            text: response.message,
            timestamp: new Date()
        });

        renderChatMessages();

        // Exécuter l'action
        handleCellCommand(response);

        cellAI.addToHistory('user', message);
        cellAI.addToHistory('cell', response.message);

    } catch (error) {
        state.chatMessages.push({
            id: Date.now() + 1,
            role: 'cell',
            text: "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler?",
            timestamp: new Date()
        });
        renderChatMessages();
    }
}

function handleCellCommand(command) {
    switch (command.action) {
        case 'navigate':
            if (command.direction === 'back') handleGoBack();
            else if (command.direction === 'forward') handleGoForward();
            else if (command.direction === 'refresh') handleRefresh();
            break;
        case 'tab':
            if (command.operation === 'new') handleNewTab();
            else if (command.operation === 'close') handleCloseTab(state.activeTabId);
            break;
        case 'search':
            const searchUrl = `search.html?q=${encodeURIComponent(command.query)}`;
            updateTab(state.activeTabId, { url: searchUrl });
            renderWebviews();
            break;
    }
}

function speakMessage(text) {
    if ('speechSynthesis' in window) {
        if (state.isSpeaking) {
            window.speechSynthesis.cancel();
            state.isSpeaking = false;
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 0.9;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
            if (frenchVoice) {
                utterance.voice = frenchVoice;
            }

            utterance.onend = () => state.isSpeaking = false;
            utterance.onerror = () => state.isSpeaking = false;
            window.speechSynthesis.speak(utterance);
            state.isSpeaking = true;
        }
    } else {
        alert("La synthèse vocale n'est pas supportée par votre navigateur");
    }
}

function handleQuickAction(command) {
    document.getElementById('chatInput').value = command;
}

// ============= INITIALISATION =============

function initEventListeners() {
    // Navigation
    document.getElementById('backBtn').addEventListener('click', handleGoBack);
    document.getElementById('forwardBtn').addEventListener('click', handleGoForward);
    document.getElementById('refreshBtn').addEventListener('click', handleRefresh);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);

    // URL
    const urlInput = document.getElementById('urlInput');
    urlInput.addEventListener('input', (e) => {
        generateSuggestions(e.target.value);
        updateClearButton();
    });
    urlInput.addEventListener('keydown', handleUrlKeyDown);
    urlInput.addEventListener('focus', () => {
        if (urlInput.value.trim()) {
            generateSuggestions(urlInput.value);
        }
    });
    urlInput.addEventListener('blur', () => {
        setTimeout(hideSuggestions, 200);
    });

    document.getElementById('clearUrlBtn').addEventListener('click', () => {
        urlInput.value = '';
        hideSuggestions();
        updateClearButton();
    });

    document.getElementById('goBtn').addEventListener('click', handleNavigate);
    document.getElementById('bookmarkBtn').addEventListener('click', () => {
        if (isBookmarked()) {
            removeBookmark();
        } else {
            addBookmark();
        }
    });

    // Onglets
    document.getElementById('newTabBtn').addEventListener('click', handleNewTab);

    // Menus
    document.getElementById('bookmarksBtn').addEventListener('click', () => toggleMenu('bookmarksMenu'));
    document.getElementById('historyBtn').addEventListener('click', () => toggleMenu('historyMenu'));
    document.getElementById('downloadsBtn').addEventListener('click', () => toggleMenu('downloadsMenu'));
    document.getElementById('translateBtn').addEventListener('click', () => toggleMenu('translateMenu'));
    document.getElementById('themeBtn').addEventListener('click', () => toggleMenu('themeMenu'));

    // Mode privé
    document.getElementById('privateModeBtn').addEventListener('click', togglePrivateMode);

    // Chat
    document.getElementById('cellBtn').addEventListener('click', toggleChat);
    document.getElementById('closeChatBtn').addEventListener('click', toggleChat);
    document.getElementById('stopSpeechBtn').addEventListener('click', () => {
        window.speechSynthesis?.cancel();
        state.isSpeaking = false;
    });

    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    document.getElementById('sendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('micBtn').addEventListener('click', () => {
        alert("🎤 Reconnaissance vocale: Cette fonctionnalité nécessite des permissions microphone supplémentaires.");
    });

    // Quick actions
    document.querySelectorAll('.quick-action-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            handleQuickAction(chip.dataset.command);
        });
    });

    // Fullscreen change
    document.addEventListener('fullscreenchange', () => {
        state.isFullscreen = !!document.fullscreenElement;
        updateFullscreenButton();
    });

    // Fermer les menus en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.icon-wrapper') && !e.target.closest('.menu')) {
            hideAllMenus();
        }
    });
}

function init() {
    loadThemeFromStorage();
    initEventListeners();
    renderTabs();
    renderWebviews();
    renderChatMessages();
    updateUrlInput();
    updateBookmarkButton();

    // Mettre à jour le contexte de Cell
    const activeTab = getActiveTab();
    if (activeTab) {
        cellAI.updatePageContext(activeTab.url, null);
    }
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', init);
