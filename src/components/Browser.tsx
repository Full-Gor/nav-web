'use client'

import React, { useState, useRef, useEffect } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import RefreshIcon from '@mui/icons-material/Refresh'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import HistoryIcon from '@mui/icons-material/History'
import DownloadIcon from '@mui/icons-material/Download'
import TranslateIcon from '@mui/icons-material/Translate'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import PaletteIcon from '@mui/icons-material/Palette'
import TabManager from './TabManager'
import FullChat from './FullChat'

interface Tab {
  id: number
  url: string
  title: string
  canGoBack: boolean
  canGoForward: boolean
  loading: boolean
}

interface Bookmark {
  id: string
  url: string
  title: string
  timestamp: string
}

interface HistoryItem {
  id: string
  url: string
  title: string
  timestamp: string
}

interface Download {
  id: string
  url: string
  filename: string
  timestamp: string
}

interface Language {
  code: string
  name: string
}

const Browser: React.FC = () => {
  // État des onglets
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 1,
      url: '/search.html',
      title: 'Cell',
      canGoBack: false,
      canGoForward: false,
      loading: false
    }
  ])
  const [activeTabId, setActiveTabId] = useState(1)
  const [nextTabId, setNextTabId] = useState(2)

  // État de la barre d'adresse
  const [url, setUrl] = useState('/search.html')
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{text: string, url: string}>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)

  // État de Full
  const [fullVisible, setFullVisible] = useState(false)
  const [pageContent, setPageContent] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPrivateMode, setIsPrivateMode] = useState(false)
  const [customThemeColor, setCustomThemeColor] = useState('#000000')
  const [isLightTheme, setIsLightTheme] = useState(true)
  const [themeKey, setThemeKey] = useState(0)

  // Thème : couleur personnalisée ou rouge en mode privé
  const themeColor = isPrivateMode ? '#ff0000' : customThemeColor
  // En mode privé, forcer le fond noir (dark mode)
  const effectiveIsLightTheme = isPrivateMode ? false : isLightTheme
  const bgColor = effectiveIsLightTheme ? '#ffffff' : '#0a0a0a'
  const bgColorSecondary = effectiveIsLightTheme ? '#f5f5f5' : '#1a1a1a'

  // État des favoris et de l'historique
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [downloads, setDownloads] = useState<Download[]>([])
  const [bookmarksMenuVisible, setBookmarksMenuVisible] = useState(false)
  const [historyMenuVisible, setHistoryMenuVisible] = useState(false)
  const [downloadsMenuVisible, setDownloadsMenuVisible] = useState(false)
  const [translateMenuVisible, setTranslateMenuVisible] = useState(false)
  const [themeMenuVisible, setThemeMenuVisible] = useState(false)

  // Sauvegarde pour le mode privé
  const [savedBookmarks, setSavedBookmarks] = useState<Bookmark[]>([])
  const [savedHistory, setSavedHistory] = useState<HistoryItem[]>([])
  const [savedDownloads, setSavedDownloads] = useState<Download[]>([])

  const historyIdCounter = useRef(1)
  const bookmarkIdCounter = useRef(1)
  const downloadIdCounter = useRef(1)

  // Refs pour les iframes
  const iframeRefs = useRef<Record<number, HTMLIFrameElement | null>>({})

  // Obtenir l'onglet actif
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Liste des thèmes disponibles
  const themes = [
    { color: '#000000', name: 'Clair', type: 'light' },
    { color: '#2196f3', name: 'Clair Bleu', type: 'light' },
    { color: '#00ffff', name: 'Cyan', type: 'dark' },
  ]

  // Liste des langues pour la traduction
  const languages: Language[] = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ar', name: 'العربية' },
    { code: 'zh-CN', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ru', name: 'Русский' },
  ]

  // Mettre à jour l'URL quand l'onglet change
  useEffect(() => {
    if (activeTab) {
      setUrl(activeTab.url)
    }
  }, [activeTabId, activeTab])

  // Charger la couleur de thème personnalisée depuis localStorage
  useEffect(() => {
    const savedColor = localStorage.getItem('customThemeColor')
    const savedType = localStorage.getItem('themeType')
    if (savedColor) {
      setCustomThemeColor(savedColor)
    }
    if (savedType) {
      setIsLightTheme(savedType === 'light')
    }
  }, [])

  // Générer des suggestions de recherche
  const handleUrlChange = (value: string) => {
    setUrl(value)
    setSelectedSuggestionIndex(-1) // Réinitialiser la sélection

    if (value.trim().length > 0) {
      const popularSites: Array<{text: string, url: string}> = [
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
        { text: 'Météo Paris', url: 'https://www.google.com/search?q=m%C3%A9t%C3%A9o+paris' },
        { text: 'Actualités', url: 'https://news.google.com' }
      ]

      const lowerValue = value.toLowerCase()
      const suggestions: Array<{text: string, url: string}> = [
        ...history.filter(h => h.url.toLowerCase().includes(lowerValue) || h.title.toLowerCase().includes(lowerValue)).slice(0, 3).map(h => ({ text: h.title, url: h.url })),
        ...bookmarks.filter(b => b.url.toLowerCase().includes(lowerValue) || b.title.toLowerCase().includes(lowerValue)).slice(0, 3).map(b => ({ text: b.title, url: b.url })),
        ...popularSites.filter(s => s.text.toLowerCase().includes(lowerValue)).slice(0, 5)
      ].slice(0, 8)

      // Supprimer les doublons basés sur l'URL
      const uniqueSuggestions = suggestions.filter((item, index, self) =>
        index === self.findIndex((t) => t.url === item.url)
      )

      setSearchSuggestions(uniqueSuggestions)
      setShowSuggestions(uniqueSuggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  // Gérer la navigation clavier dans les suggestions
  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleNavigate()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Tab':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < searchSuggestions.length) {
          const suggestion = searchSuggestions[selectedSuggestionIndex]
          setUrl(suggestion.url)
          setShowSuggestions(false)
          setSelectedSuggestionIndex(-1)
        } else if (searchSuggestions.length > 0) {
          // Si aucune sélection, sélectionner la première suggestion
          setSelectedSuggestionIndex(0)
        }
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < searchSuggestions.length) {
          handleSuggestionClick(searchSuggestions[selectedSuggestionIndex])
        } else {
          handleNavigate()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (suggestion: {text: string, url: string}) => {
    setUrl(suggestion.url)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  const handleNavigate = () => {
    let formattedUrl = url.trim()
    setShowSuggestions(false)

    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('/')) {
      if (formattedUrl.includes('.') && !formattedUrl.includes(' ')) {
        formattedUrl = `https://${formattedUrl}`
      } else {
        // Utiliser notre page de recherche personnalisée
        formattedUrl = `/search.html?q=${encodeURIComponent(formattedUrl)}`
      }
    }

    updateTab(activeTabId, { url: formattedUrl })
  }

  const handleGoBack = () => {
    const iframe = iframeRefs.current[activeTabId]
    if (iframe && iframe.contentWindow && activeTab?.canGoBack) {
      iframe.contentWindow.history.back()
    }
  }

  const handleGoForward = () => {
    const iframe = iframeRefs.current[activeTabId]
    if (iframe && iframe.contentWindow && activeTab?.canGoForward) {
      iframe.contentWindow.history.forward()
    }
  }

  const handleRefresh = () => {
    const iframe = iframeRefs.current[activeTabId]
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  // Gestion du fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch((err) => {
        console.error('Erreur fullscreen:', err)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false)
        })
      }
    }
  }

  // Détecter les changements de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Stocker la couleur du thème dans localStorage pour la page de recherche
  useEffect(() => {
    localStorage.setItem('themeColor', themeColor)
  }, [themeColor])

  // Mettre à jour les variables CSS pour le thème
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor)
    document.documentElement.style.setProperty('--bg-color', bgColor)
    document.documentElement.style.setProperty('--bg-color-secondary', bgColorSecondary)
  }, [themeColor, bgColor, bgColorSecondary])

  // Envoyer les changements de thème à tous les iframes pour mise à jour instantanée
  useEffect(() => {
    localStorage.setItem('themeType', effectiveIsLightTheme ? 'light' : 'dark')

    // Envoyer un message à tous les iframes pour mettre à jour le thème instantanément
    Object.values(iframeRefs.current).forEach(iframe => {
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({
            type: 'themeUpdate',
            themeColor: themeColor,
            isLightTheme: effectiveIsLightTheme
          }, '*')
        } catch (e) {
          // Ignorer les erreurs de cross-origin
        }
      }
    })
  }, [themeColor, isLightTheme, effectiveIsLightTheme])

  // Gestion des favoris
  const addBookmark = () => {
    // Ne pas sauvegarder les bookmarks en mode privé
    if (isPrivateMode) return

    if (activeTab && !isBookmarked()) {
      const newBookmark: Bookmark = {
        id: `bookmark_${bookmarkIdCounter.current++}`,
        url: activeTab.url,
        title: activeTab.title,
        timestamp: new Date().toISOString()
      }
      setBookmarks(prev => [...prev, newBookmark])
    }
  }

  const removeBookmark = () => {
    setBookmarks(prev => prev.filter(b => b.url !== activeTab?.url))
  }

  const isBookmarked = () => {
    return bookmarks.some(b => b.url === activeTab?.url)
  }

  const navigateToBookmark = (url: string) => {
    setUrl(url)
    setBookmarksMenuVisible(false)
    setTimeout(() => handleNavigate(), 100)
  }

  // Sauvegarder le thème avant le mode privé
  const [savedThemeType, setSavedThemeType] = useState<string>('light')

  // Gestion du mode privé
  const togglePrivateMode = () => {
    if (!isPrivateMode) {
      // Entrer en mode privé : sauvegarder l'état actuel
      setSavedBookmarks([...bookmarks])
      setSavedHistory([...history])
      setSavedDownloads([...downloads])
      setSavedThemeType(isLightTheme ? 'light' : 'dark')
      setIsPrivateMode(true)
      // Forcer un re-render complet pour appliquer instantanément le thème rouge/noir
      setThemeKey(prev => prev + 1)
    } else {
      // Quitter le mode privé : restaurer l'état sauvegardé
      setBookmarks(savedBookmarks)
      setHistory(savedHistory)
      setDownloads(savedDownloads)
      setIsPrivateMode(false)
      // Forcer un re-render complet pour restaurer instantanément le thème précédent
      setThemeKey(prev => prev + 1)
    }
  }

  // Gestion de l'historique
  const addToHistory = (url: string, title: string) => {
    // Ne pas sauvegarder l'historique en mode privé
    if (isPrivateMode) return

    const newHistoryItem: HistoryItem = {
      id: `history_${historyIdCounter.current++}`,
      url,
      title,
      timestamp: new Date().toISOString()
    }
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 100))
  }

  const navigateToHistoryItem = (url: string) => {
    setUrl(url)
    setHistoryMenuVisible(false)
    setTimeout(() => handleNavigate(), 100)
  }

  const clearHistory = () => {
    setHistory([])
    setHistoryMenuVisible(false)
  }

  // Fonction de traduction de la page
  const handleTranslate = (targetLang: string) => {
    if (activeTab?.url) {
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=${targetLang}&u=${encodeURIComponent(activeTab.url)}`
      updateTab(activeTabId, { url: translateUrl })
      setTranslateMenuVisible(false)
    }
  }

  // Fonction pour changer de thème
  const handleThemeChange = (color: string, type: string) => {
    setCustomThemeColor(color)
    setIsLightTheme(type === 'light')
    setThemeMenuVisible(false)
    localStorage.setItem('customThemeColor', color)
    localStorage.setItem('themeType', type)
    // Forcer un re-render complet
    setThemeKey(prev => prev + 1)
  }

  // Effacer l'historique des téléchargements
  const clearDownloads = () => {
    setDownloads([])
    setDownloadsMenuVisible(false)
  }

  const updateTab = (tabId: number, updates: Partial<Tab>) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
    )
  }

  const handleNewTab = () => {
    const newTab: Tab = {
      id: nextTabId,
      url: '/search.html',
      title: 'Nouvel onglet',
      canGoBack: false,
      canGoForward: false,
      loading: false
    }

    setTabs(prevTabs => [...prevTabs, newTab])
    setActiveTabId(nextTabId)
    setNextTabId(nextTabId + 1)
  }

  const handleCloseTab = (tabId: number) => {
    if (tabs.length === 1) return

    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId)

      if (tabId === activeTabId) {
        const currentIndex = prevTabs.findIndex(tab => tab.id === tabId)
        const newActiveTab = newTabs[currentIndex] || newTabs[currentIndex - 1]
        setActiveTabId(newActiveTab.id)
      }

      return newTabs
    })

    delete iframeRefs.current[tabId]
  }

  const handleTabChange = (tabId: number) => {
    setActiveTabId(tabId)
  }

  // Gérer les commandes de Full
  const handleFullCommand = (command: any) => {
    switch (command.action) {
      case 'navigate':
        if (command.direction === 'back') handleGoBack()
        else if (command.direction === 'forward') handleGoForward()
        else if (command.direction === 'refresh') handleRefresh()
        break

      case 'tab':
        if (command.operation === 'new') handleNewTab()
        else if (command.operation === 'close') handleCloseTab(activeTabId)
        break

      case 'search':
        // Utiliser notre page de recherche personnalisée
        const searchUrl = `/search.html?q=${encodeURIComponent(command.query)}`
        updateTab(activeTabId, { url: searchUrl })
        break

      default:
        break
    }
  }

  const styles = getStyles(themeColor, effectiveIsLightTheme, bgColor, bgColorSecondary, isPrivateMode)

  return (
    <div key={themeKey} style={styles.container}>
      {/* Barre de navigation */}
      <div style={styles.header}>
        <div style={styles.toolbar}>
          <button
            onClick={handleGoBack}
            disabled={!activeTab?.canGoBack}
            style={{
              ...styles.iconButton,
              opacity: !activeTab?.canGoBack ? 0.5 : 1
            }}
          >
            <ArrowBackIcon style={{ color: themeColor, fontSize: 24 }} />
          </button>
          <button
            onClick={handleGoForward}
            disabled={!activeTab?.canGoForward}
            style={{
              ...styles.iconButton,
              opacity: !activeTab?.canGoForward ? 0.5 : 1
            }}
          >
            <ArrowForwardIcon style={{ color: themeColor, fontSize: 24 }} />
          </button>
          <button onClick={handleRefresh} style={styles.iconButton}>
            <RefreshIcon style={{ color: themeColor, fontSize: 24 }} />
          </button>
          <button onClick={toggleFullscreen} style={styles.iconButton}>
            {isFullscreen ? (
              <FullscreenExitIcon style={{ color: themeColor, fontSize: 24 }} />
            ) : (
              <FullscreenIcon style={{ color: themeColor, fontSize: 24 }} />
            )}
          </button>

          {/* Bouton Favoris */}
          <div style={styles.iconWrapper}>
            <button
              onClick={() => setBookmarksMenuVisible(!bookmarksMenuVisible)}
              style={styles.iconButton}
            >
              <StarIcon style={{ color: themeColor, fontSize: 24 }} />
            </button>
            {bookmarksMenuVisible && (
              <div style={styles.menu}>
                <div style={styles.menuScroll}>
                  {bookmarks.length === 0 ? (
                    <div style={styles.menuEmptyText}>Aucun favori</div>
                  ) : (
                    bookmarks.map(bookmark => (
                      <div
                        key={bookmark.id}
                        onClick={() => navigateToBookmark(bookmark.url)}
                        style={styles.menuItem}
                      >
                        <div style={styles.menuItemTitle}>{bookmark.title}</div>
                        <div style={styles.menuItemUrl}>{bookmark.url}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bouton Historique */}
          <div style={styles.iconWrapper}>
            <button
              onClick={() => setHistoryMenuVisible(!historyMenuVisible)}
              style={styles.iconButton}
            >
              <HistoryIcon style={{ color: themeColor, fontSize: 24 }} />
            </button>
            {historyMenuVisible && (
              <div style={styles.menu}>
                <div style={styles.menuScroll}>
                  {history.length > 0 && (
                    <button onClick={clearHistory} style={styles.clearButton}>
                      Effacer l'historique
                    </button>
                  )}
                  {history.length === 0 ? (
                    <div style={styles.menuEmptyText}>Aucun historique</div>
                  ) : (
                    history.map(item => (
                      <div
                        key={item.id}
                        onClick={() => navigateToHistoryItem(item.url)}
                        style={styles.menuItem}
                      >
                        <div style={styles.menuItemTitle}>{item.title}</div>
                        <div style={styles.menuItemUrl}>{item.url}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bouton Téléchargements */}
          <div style={styles.iconWrapper}>
            <button
              onClick={() => setDownloadsMenuVisible(!downloadsMenuVisible)}
              style={styles.iconButton}
            >
              <DownloadIcon style={{ color: themeColor, fontSize: 24 }} />
            </button>
            {downloadsMenuVisible && (
              <div style={styles.menu}>
                <div style={styles.menuScroll}>
                  {downloads.length > 0 && (
                    <button onClick={clearDownloads} style={styles.clearButton}>
                      Effacer l'historique
                    </button>
                  )}
                  {downloads.length === 0 ? (
                    <div style={styles.menuEmptyText}>Aucun téléchargement</div>
                  ) : (
                    downloads.map(item => (
                      <div key={item.id} style={styles.menuItem}>
                        <div style={styles.menuItemTitle}>{item.filename}</div>
                        <div style={styles.menuItemUrl}>
                          {new Date(item.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bouton Traduction */}
          <div style={styles.iconWrapper}>
            <button
              onClick={() => setTranslateMenuVisible(!translateMenuVisible)}
              style={styles.iconButton}
            >
              <TranslateIcon style={{ color: themeColor, fontSize: 24 }} />
            </button>
            {translateMenuVisible && (
              <div style={styles.menu}>
                <div style={styles.menuTitle}>Traduire en:</div>
                <div style={styles.menuScroll}>
                  {languages.map(lang => (
                    <div
                      key={lang.code}
                      onClick={() => handleTranslate(lang.code)}
                      style={styles.menuItem}
                    >
                      <div style={styles.menuItemTitle}>{lang.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bouton Thème */}
          <div style={styles.iconWrapper}>
            <button
              onClick={() => setThemeMenuVisible(!themeMenuVisible)}
              style={styles.iconButton}
            >
              <PaletteIcon style={{ color: themeColor, fontSize: 24 }} />
            </button>
            {themeMenuVisible && (
              <div style={styles.menu}>
                <div style={styles.menuTitle}>Choisir un thème:</div>
                <div style={styles.menuScroll}>
                  {themes.map(theme => (
                    <div
                      key={`${theme.color}-${theme.type}`}
                      onClick={() => handleThemeChange(theme.color, theme.type)}
                      style={{
                        ...styles.menuItem,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: theme.color,
                        border: `2px solid ${themeColor}`,
                        boxShadow: customThemeColor === theme.color && isLightTheme === (theme.type === 'light') ? `0 0 8px ${theme.color}` : 'none'
                      }} />
                      <div style={styles.menuItemTitle}>{theme.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gestionnaire d'onglets */}
      <TabManager
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={handleTabChange}
        onNewTab={handleNewTab}
        onCloseTab={handleCloseTab}
        themeColor={themeColor}
        isLightTheme={effectiveIsLightTheme}
      />

      {/* Barre d'adresse */}
      <div style={styles.addressBarContainer}>
        <div style={styles.urlBox}>
          <span style={styles.urlProtocol}>https://</span>
          <input
            type="text"
            placeholder="recherche ou URL..."
            value={url.replace(/^https?:\/\//, '')}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            onFocus={() => url.trim().length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => { setShowSuggestions(false); setSelectedSuggestionIndex(-1); }, 200)}
            style={styles.urlInput}
          />
          {url && (
            <button onClick={() => { setUrl(''); setShowSuggestions(false); }} style={styles.urlClearButton}>
              <span style={styles.urlClearText}>×</span>
            </button>
          )}
          <button onClick={handleNavigate} style={styles.urlButton}>
            <span style={styles.urlButtonText}>GO</span>
          </button>
          <button
            onClick={isBookmarked() ? removeBookmark : addBookmark}
            style={styles.urlButton}
          >
            <span
              style={{
                ...styles.urlButtonText,
                ...(isBookmarked() ? styles.bookmarked : {})
              }}
            >
              ★
            </span>
          </button>
        </div>

        {/* Suggestions de recherche */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div style={styles.suggestionsBox}>
            {searchSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  ...styles.suggestionItem,
                  ...(index === selectedSuggestionIndex ? styles.suggestionItemSelected : {})
                }}
              >
                <span style={styles.suggestionIcon}>🔍</span>
                <div style={{ flex: 1 }}>
                  <div style={styles.suggestionText}>{suggestion.text}</div>
                  <div style={styles.suggestionUrl}>{suggestion.url}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Iframes pour chaque onglet */}
      <div style={styles.webviewContainer}>
        {tabs.map(tab => (
          <iframe
            key={tab.id}
            ref={ref => {
              if (ref) iframeRefs.current[tab.id] = ref
            }}
            src={tab.url}
            style={{
              ...styles.webview,
              ...(tab.id !== activeTabId ? styles.hiddenWebview : {})
            }}
            onLoad={() => {
              updateTab(tab.id, { loading: false })
              if (tab.id === activeTabId) {
                addToHistory(tab.url, tab.title || tab.url)
              }
            }}
          />
        ))}
      </div>

      {/* Bouton Full */}
      <button onClick={() => setFullVisible(!fullVisible)} style={styles.fullButton}>
        <span style={styles.fullButtonText}>Cell</span>
      </button>

      {/* Bouton Mode Privé */}
      <button
        onClick={togglePrivateMode}
        style={{
          ...styles.privateModeButton,
          ...(isPrivateMode ? {
            backgroundColor: '#2a1a2a',
            border: `2px solid ${themeColor}`,
            boxShadow: `0 0 15px ${themeColor}80`,
            color: themeColor
          } : {})
        }}
        title={isPrivateMode ? "Quitter le mode privé" : "Activer le mode privé"}
      >
        <VisibilityOffIcon style={{ fontSize: 24 }} />
        {isPrivateMode && <span style={styles.privateModeText}>Privé</span>}
      </button>

      {/* Interface de chat Full */}
      <FullChat
        visible={fullVisible}
        onCommand={handleFullCommand}
        currentUrl={activeTab?.url || ''}
        pageContent={pageContent}
        onClose={() => setFullVisible(false)}
        themeColor={themeColor}
        isLightTheme={effectiveIsLightTheme}
      />
    </div>
  )
}

const getStyles = (themeColor: string, isLightTheme: boolean, bgColor: string, bgColorSecondary: string, isPrivateMode: boolean = false): Record<string, React.CSSProperties> => ({
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: bgColor,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    backgroundColor: bgColorSecondary,
    boxShadow: isLightTheme ? 'none' : `0 2px 4px ${themeColor}50`
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 'clamp(8px, 2vw, 12px)',
    gap: 'clamp(8px, 2vw, 16px)',
    flexWrap: 'wrap'
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 'clamp(6px, 1.5vw, 10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    minHeight: '40px'
  },
  iconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addressBarContainer: {
    padding: 'clamp(4px, 2vw, 8px)',
    backgroundColor: bgColor,
    position: 'relative'
  },
  urlBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: bgColorSecondary,
    borderRadius: 'clamp(16px, 5vw, 24px)',
    border: `2px solid ${themeColor}`,
    padding: 'clamp(8px, 2vw, 12px)',
    boxShadow: isLightTheme ? 'none' : `0 0 10px ${themeColor}80`,
    width: '100%',
    boxSizing: 'border-box'
  },
  urlProtocol: {
    color: themeColor,
    fontSize: 'clamp(10px, 3vw, 14px)',
    fontWeight: 'bold',
    marginLeft: 'clamp(2px, 1vw, 5px)',
    textShadow: isLightTheme ? 'none' : `0 0 5px ${themeColor}`,
    fontFamily: 'monospace',
    display: 'none'
  },
  urlInput: {
    flex: 1,
    color: themeColor,
    fontSize: 'clamp(12px, 3vw, 14px)',
    padding: 'clamp(4px, 2vw, 8px)',
    fontFamily: 'monospace',
    textShadow: isLightTheme ? 'none' : `0 0 3px ${themeColor}`,
    background: 'none',
    border: 'none',
    outline: 'none',
    minWidth: 0
  },
  urlButton: {
    paddingLeft: '10px',
    paddingRight: '10px',
    paddingTop: '6px',
    paddingBottom: '6px',
    marginLeft: '4px',
    background: isPrivateMode ? '#0a0a0a' : '#ffffff',
    border: isPrivateMode ? `2px solid ${themeColor}` : '2px solid #000000',
    borderRadius: '20px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  urlButtonText: {
    color: isPrivateMode ? themeColor : '#000000',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  urlClearButton: {
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '4px',
    paddingBottom: '4px',
    marginLeft: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  urlClearText: {
    color: themeColor,
    fontSize: '28px',
    fontWeight: 'bold',
    textShadow: isLightTheme ? 'none' : `0 0 5px ${themeColor}`
  },
  bookmarked: {
    color: '#ffff00',
    textShadow: '0 0 5px #ffff00'
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  },
  webview: {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: bgColor
  },
  hiddenWebview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    pointerEvents: 'none'
  },
  fullButton: {
    position: 'fixed',
    bottom: 'clamp(10px, 3vw, 20px)',
    right: 'clamp(10px, 3vw, 20px)',
    width: 'clamp(44px, 12vw, 56px)',
    height: 'clamp(44px, 12vw, 56px)',
    borderRadius: '50%',
    backgroundColor: isPrivateMode ? '#0a0a0a' : '#ffffff',
    boxShadow: isPrivateMode ? `0 0 10px ${themeColor}80` : 'none',
    border: isPrivateMode ? `2px solid ${themeColor}` : '2px solid #000000',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  },
  fullButtonText: {
    color: isPrivateMode ? themeColor : '#000000',
    fontSize: 'clamp(12px, 3.5vw, 16px)',
    fontWeight: 'bold'
  },
  privateModeButton: {
    position: 'fixed',
    bottom: 'clamp(10px, 3vw, 20px)',
    left: 'clamp(10px, 3vw, 20px)',
    padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
    borderRadius: 'clamp(20px, 5vw, 24px)',
    backgroundColor: bgColorSecondary,
    border: '2px solid #888888',
    boxShadow: isLightTheme ? 'none' : '0 0 10px #88888880',
    color: '#888888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(4px, 1vw, 8px)',
    zIndex: 999,
    transition: 'all 0.3s ease'
  },
  privateModeText: {
    fontSize: 'clamp(10px, 2.5vw, 14px)',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  menu: {
    position: 'absolute',
    top: '100%',
    left: 'clamp(-100px, -10vw, -30px)',
    marginTop: 'clamp(4px, 2vw, 8px)',
    backgroundColor: bgColorSecondary,
    borderRadius: 'clamp(8px, 2vw, 10px)',
    border: `2px solid ${themeColor}`,
    maxHeight: 'clamp(250px, 60vh, 400px)',
    minWidth: 'clamp(200px, 50vw, 300px)',
    maxWidth: '90vw',
    boxShadow: isLightTheme ? 'none' : `0 0 10px ${themeColor}80`,
    zIndex: 1000
  },
  menuScroll: {
    maxHeight: '350px',
    overflowY: 'auto'
  },
  menuEmptyText: {
    color: themeColor,
    textAlign: 'center',
    padding: '20px',
    fontSize: '14px'
  },
  menuTitle: {
    color: themeColor,
    fontWeight: 'bold',
    fontSize: '16px',
    padding: '12px',
    textAlign: 'center',
    borderBottom: `2px solid ${themeColor}30`
  },
  menuItem: {
    padding: '12px',
    borderBottom: `1px solid ${themeColor}30`,
    cursor: 'pointer'
  },
  menuItemTitle: {
    color: themeColor,
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  menuItemUrl: {
    color: `${themeColor}80`,
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  clearButton: {
    backgroundColor: '#ff000030',
    padding: '10px',
    margin: '8px',
    borderRadius: '8px',
    border: '1px solid #ff0000',
    color: '#ff0000',
    textAlign: 'center',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: 'calc(100% - 16px)'
  },
  suggestionsBox: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: bgColorSecondary,
    border: `2px solid ${themeColor}`,
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    marginTop: '-10px',
    maxHeight: 'clamp(200px, 40vh, 300px)',
    overflowY: 'auto',
    boxShadow: isLightTheme ? 'none' : `0 4px 10px ${themeColor}50`,
    zIndex: 1000
  },
  suggestionItem: {
    padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 16px)',
    cursor: 'pointer',
    borderBottom: `1px solid ${themeColor}30`,
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s'
  },
  suggestionItemSelected: {
    backgroundColor: `${themeColor}20`,
    borderLeft: `4px solid ${themeColor}`
  },
  suggestionIcon: {
    marginRight: 'clamp(8px, 2vw, 12px)',
    fontSize: 'clamp(14px, 3.5vw, 16px)'
  },
  suggestionText: {
    color: themeColor,
    fontSize: 'clamp(12px, 3vw, 14px)',
    fontFamily: 'monospace',
    fontWeight: 'bold'
  },
  suggestionUrl: {
    color: `${themeColor}60`,
    fontSize: 'clamp(10px, 2.5vw, 12px)',
    fontFamily: 'monospace',
    marginTop: '2px'
  }
})

export default Browser
