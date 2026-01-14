'use client'

import React, { useState, useRef, useEffect } from 'react'
import SendIcon from '@mui/icons-material/Send'
import MicIcon from '@mui/icons-material/Mic'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import CloseIcon from '@mui/icons-material/Close'
import fullAI from '@/utils/FullAI'

interface Message {
  id: number
  role: 'user' | 'full'
  text: string
  timestamp: Date
  action?: string
}

interface FullChatProps {
  visible: boolean
  onCommand: (command: any) => void
  currentUrl: string
  pageContent: string
  onClose: () => void
  themeColor: string
  isLightTheme?: boolean
}

const FullChat: React.FC<FullChatProps> = ({
  visible,
  onCommand,
  currentUrl,
  pageContent,
  onClose,
  themeColor,
  isLightTheme = false
}) => {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'full',
      text: "Salut. Je suis Cell, votre assistant de navigation. Parlez-moi directement, posez vos questions, demandez-moi de naviguer ou de chercher quelque chose. Je suis là pour vous.",
      timestamp: new Date()
    }
  ])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const scrollViewRef = useRef<HTMLDivElement>(null)

  // Suggestions rapides
  const quickActions = [
    { label: "Suggestions", icon: "lightbulb", command: "Donne-moi des suggestions" },
    { label: "Résume", icon: "file-document", command: "Résume cette page" },
    { label: "Aide", icon: "help", command: "Aide" },
  ]

  // Mettre à jour le contexte de Cell
  useEffect(() => {
    if (currentUrl) {
      fullAI.updatePageContext(currentUrl, pageContent)
    }
  }, [currentUrl, pageContent])

  // Scroll automatique vers le bas
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = message
    setMessage('')

    // Traiter la commande avec Cell
    try {
      const response = await fullAI.processCommand(userInput)

      // Ajouter la réponse de Cell
      const fullMessage: Message = {
        id: Date.now() + 1,
        role: 'full',
        text: response.message,
        timestamp: new Date(),
        action: response.action
      }

      setMessages(prev => [...prev, fullMessage])

      // Exécuter l'action immédiatement (y compris recherche)
      if (onCommand) {
        onCommand(response)
      }

      fullAI.addToHistory('user', userInput)
      fullAI.addToHistory('full', response.message)

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'full',
        text: "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleQuickAction = (command: string) => {
    setMessage(command)
  }

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'fr-FR' // Voix française
        utterance.rate = 0.9 // Débit normal
        utterance.pitch = 1.0 // Voix normale

        // Sélectionner une voix française si disponible
        const voices = window.speechSynthesis.getVoices()
        const frenchVoice = voices.find(voice =>
          voice.lang.startsWith('fr')
        )
        if (frenchVoice) {
          utterance.voice = frenchVoice
        }

        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
      }
    } else {
      alert('La synthèse vocale n\'est pas supportée par votre navigateur')
    }
  }

  const handleVoiceInput = () => {
    alert("🎤 Reconnaissance vocale: Cette fonctionnalité nécessite des permissions microphone supplémentaires.")
  }

  if (!visible) return null

  const bgColor = isLightTheme ? '#ffffff' : '#0a0a0a'
  const bgColorSecondary = isLightTheme ? '#f5f5f5' : '#1a1a1a'
  const styles = getStyles(themeColor, isLightTheme, bgColor, bgColorSecondary)

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iaIcon}>
            <span style={styles.iaText}>Cell</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => window.speechSynthesis?.cancel()} style={styles.iconButton}>
            <VolumeUpIcon style={{ color: themeColor, fontSize: 20 }} />
          </button>
          <button onClick={onClose} style={styles.iconButton}>
            <CloseIcon style={{ color: themeColor, fontSize: 24 }} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollViewRef} style={styles.messagesContainer}>
        <div style={styles.messagesContent}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                ...(msg.role === 'user' ? styles.userRow : styles.fullRow)
              }}
            >
              {msg.role === 'full' && (
                <div style={styles.messageAvatar}>
                  <span style={styles.avatarText}>Cell</span>
                </div>
              )}
              <div
                style={{
                  ...styles.messageCard,
                  ...(msg.role === 'user' ? styles.userMessage : styles.fullMessage)
                }}
              >
                <div style={styles.messageContent}>
                  <span
                    style={{
                      ...styles.messageText,
                      ...(msg.role === 'user' ? styles.userMessageText : {})
                    }}
                  >
                    {msg.text}
                  </span>
                  {msg.role === 'full' && (
                    <button
                      onClick={() => speakMessage(msg.text)}
                      style={styles.speakButton}
                    >
                      <VolumeUpIcon style={{ fontSize: 18, color: themeColor }} />
                    </button>
                  )}
                </div>
              </div>
              {msg.role === 'user' && (
                <div style={styles.userAvatar}>
                  <span style={styles.avatarText}>Vous</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div style={styles.quickActions}>
        <div style={styles.quickActionsContent}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(action.command)}
              style={styles.quickActionChip}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <button onClick={handleVoiceInput} style={styles.micButton}>
          <MicIcon style={{ color: themeColor, fontSize: 24 }} />
        </button>
        <input
          type="text"
          placeholder="Parlez à Cell... (ex: recherche Paris, ouvre un onglet, que peux-tu faire?)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={styles.input}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          style={{
            ...styles.sendButton,
            opacity: !message.trim() ? 0.5 : 1
          }}
        >
          <SendIcon style={{ color: themeColor, fontSize: 24 }} />
        </button>
      </div>
    </div>
  )
}

const getStyles = (themeColor: string, isLightTheme: boolean, bgColor: string, bgColorSecondary: string): Record<string, React.CSSProperties> => ({
  container: {
    position: 'fixed',
    bottom: '15px',
    left: 0,
    right: 0,
    height: '43%',
    backgroundColor: bgColor,
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    border: `2px solid ${themeColor}`,
    boxShadow: isLightTheme ? 'none' : `0 -5px 15px ${themeColor}cc`,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: `2px solid ${themeColor}40`,
    backgroundColor: bgColorSecondary,
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '18px'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px'
  },
  iaIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    backgroundColor: bgColorSecondary,
    border: `2px solid ${themeColor}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '12px',
    boxShadow: isLightTheme ? 'none' : `0 0 8px ${themeColor}`
  },
  iaText: {
    color: `${themeColor}`,
    fontSize: '16px',
    fontWeight: 'bold',
    textShadow: isLightTheme ? 'none' : `0 0 5px ${themeColor}`
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: bgColor,
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  messagesContent: {
    padding: '16px'
  },
  messageRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '8px',
    alignItems: 'flex-start'
  },
  userRow: {
    justifyContent: 'flex-end'
  },
  fullRow: {
    justifyContent: 'flex-start'
  },
  messageAvatar: {
    backgroundColor: bgColorSecondary,
    border: `1px solid ${themeColor}`,
    marginRight: '8px',
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userAvatar: {
    backgroundColor: bgColorSecondary,
    border: `1px solid ${themeColor}`,
    marginLeft: '8px',
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: `${themeColor}`,
    fontSize: '12px',
    fontWeight: 'bold',
    textShadow: isLightTheme ? 'none' : `0 0 3px ${themeColor}`
  },
  messageCard: {
    maxWidth: '70%',
    borderRadius: '12px',
    border: '1px solid',
    minHeight: '40px'
  },
  userMessage: {
    backgroundColor: bgColorSecondary,
    borderColor: `${themeColor}`,
    boxShadow: isLightTheme ? 'none' : `0 0 5px ${themeColor}80`
  },
  fullMessage: {
    backgroundColor: bgColorSecondary,
    borderColor: `${themeColor}60`,
    boxShadow: isLightTheme ? 'none' : `0 0 5px ${themeColor}50`
  },
  messageContent: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '8px'
  },
  messageText: {
    flex: 1,
    fontSize: '14px',
    color: `${themeColor}`,
    fontFamily: 'monospace',
    lineHeight: '1.5',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap'
  },
  userMessageText: {
    color: `${themeColor}`,
    fontWeight: 'bold'
  },
  speakButton: {
    margin: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickActions: {
    maxHeight: '50px',
    borderTop: `2px solid ${themeColor}40`,
    backgroundColor: bgColor,
    overflowX: 'auto',
    overflowY: 'hidden'
  },
  quickActionsContent: {
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'row',
    gap: '8px'
  },
  quickActionChip: {
    padding: '6px 12px',
    backgroundColor: bgColorSecondary,
    border: `1px solid ${themeColor}`,
    borderRadius: '16px',
    color: `${themeColor}`,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '12px',
    whiteSpace: 'nowrap'
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: '12px',
    paddingBottom: '40px',
    borderTop: `2px solid ${themeColor}40`,
    backgroundColor: bgColorSecondary
  },
  micButton: {
    margin: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    flex: 1,
    margin: '0 8px',
    maxHeight: '100px',
    backgroundColor: bgColor,
    borderRadius: '12px',
    border: `2px solid ${themeColor}`,
    color: `${themeColor}`,
    padding: '8px 12px',
    fontSize: '14px',
    fontFamily: 'monospace',
    outline: 'none'
  },
  sendButton: {
    margin: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default FullChat
