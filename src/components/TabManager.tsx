'use client'

import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'

interface Tab {
  id: number
  url: string
  title: string
  canGoBack: boolean
  canGoForward: boolean
  loading: boolean
}

interface TabManagerProps {
  tabs: Tab[]
  activeTabId: number
  onTabChange: (tabId: number) => void
  onNewTab: () => void
  onCloseTab: (tabId: number) => void
  themeColor: string
  isLightTheme?: boolean
}

const TabManager: React.FC<TabManagerProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onNewTab,
  onCloseTab,
  themeColor,
  isLightTheme = false
}) => {
  const getTabTitle = (tab: Tab) => {
    if (tab.title && tab.title !== 'about:blank') {
      return tab.title.length > 20 ? tab.title.substring(0, 20) + '...' : tab.title
    }
    if (tab.url && tab.url !== 'about:blank') {
      const url = tab.url.replace(/^https?:\/\//i, '')
      return url.length > 20 ? url.substring(0, 20) + '...' : url
    }
    return 'Nouvel onglet'
  }

  const bgColor = isLightTheme ? '#ffffff' : '#0a0a0a'
  const bgColorSecondary = isLightTheme ? '#f5f5f5' : '#1a1a1a'
  const styles = getStyles(themeColor, isLightTheme, bgColor, bgColorSecondary)

  return (
    <div style={styles.container}>
      <div style={styles.scrollView}>
        <div style={styles.scrollContent}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={styles.tab}
            >
              <div
                style={{
                  ...styles.tabSurface,
                  ...(activeTabId === tab.id ? styles.activeTabSurface : {})
                }}
              >
                <span
                  style={{
                    ...styles.tabText,
                    ...(activeTabId === tab.id ? styles.activeTabText : {})
                  }}
                >
                  {getTabTitle(tab)}
                </span>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onCloseTab(tab.id)
                    }}
                    style={styles.closeButton}
                  >
                    <CloseIcon style={{ fontSize: 16, color: themeColor }} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div
            onClick={onNewTab}
            style={styles.newTabButton}
          >
            <div style={styles.newTabSurface}>
              <AddIcon style={{ fontSize: 20, color: themeColor }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getStyles = (themeColor: string, isLightTheme: boolean, bgColor: string, bgColorSecondary: string): Record<string, React.CSSProperties> => ({
  container: {
    height: '50px',
    backgroundColor: bgColor,
    borderBottom: `2px solid ${themeColor}30`,
    overflow: 'hidden'
  },
  scrollView: {
    height: '100%',
    overflowX: 'auto',
    overflowY: 'hidden'
  },
  scrollContent: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '8px',
    paddingRight: '8px',
    flexDirection: 'row',
    minHeight: '100%'
  },
  tab: {
    marginRight: '6px',
    cursor: 'pointer'
  },
  tabSurface: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '6px',
    paddingBottom: '6px',
    borderRadius: '16px',
    backgroundColor: bgColorSecondary,
    border: `2px solid ${themeColor}40`,
    minWidth: '120px',
    maxWidth: '180px',
    height: '36px',
    marginTop: '7px',
    marginBottom: '7px',
    boxShadow: isLightTheme ? 'none' : `0 0 5px ${themeColor}50`,
    transition: 'all 0.2s ease'
  },
  activeTabSurface: {
    backgroundColor: bgColorSecondary,
    borderColor: themeColor,
    borderWidth: '2px',
    boxShadow: isLightTheme ? 'none' : `0 0 10px ${themeColor}cc`
  },
  tabText: {
    flex: 1,
    fontSize: '13px',
    color: `${themeColor}80`,
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  activeTabText: {
    color: themeColor,
    fontWeight: '600',
    textShadow: isLightTheme ? 'none' : `0 0 5px ${themeColor}`
  },
  closeButton: {
    margin: 0,
    marginLeft: '4px',
    padding: '2px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  newTabButton: {
    marginLeft: '6px',
    cursor: 'pointer'
  },
  newTabSurface: {
    borderRadius: '16px',
    backgroundColor: bgColorSecondary,
    border: `2px solid ${themeColor}`,
    width: '36px',
    height: '36px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '7px',
    marginBottom: '7px',
    boxShadow: isLightTheme ? 'none' : `0 0 10px ${themeColor}cc`,
    transition: 'all 0.2s ease'
  }
})

export default TabManager
