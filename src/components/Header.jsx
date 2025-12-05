import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

/**
 * Header component - includes app type selector and language switcher
 */
function Header() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const getCurrentMode = () => {
    if (location.pathname.startsWith('/grid')) return 'grid'
    if (location.pathname.startsWith('/game')) return 'game'
    return 'basket'
  }

  const currentMode = getCurrentMode()

  const handleModeChange = (mode) => {
    if (mode === 'grid') {
      navigate('/grid')
    } else if (mode === 'game') {
      navigate('/game')
    } else {
      navigate('/basket')
    }
  }

  return (
    <div className="app-header">
      <div className="header-content">
        <div className="ah-logo-small">AH</div>
        <div className="app-mode-selector">
          <button
            type="button"
            className={`mode-btn ${currentMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleModeChange('grid')}
            aria-pressed={currentMode === 'grid'}
          >
            <span className="mode-icon">📍</span>
            <span className="mode-text">{t('gridModeTitle')}</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${currentMode === 'basket' ? 'active' : ''}`}
            onClick={() => handleModeChange('basket')}
            aria-pressed={currentMode === 'basket'}
          >
            <span className="mode-icon">🛒</span>
            <span className="mode-text">{t('basketModeTitle')}</span>
          </button>
          <button
            type="button"
            className={`mode-btn ${currentMode === 'game' ? 'active' : ''}`}
            onClick={() => handleModeChange('game')}
            aria-pressed={currentMode === 'game'}
          >
            <span className="mode-icon">🎮</span>
            <span className="mode-text">{t('gameModeTitle')}</span>
          </button>
        </div>
      </div>
      <LanguageSwitcher />
    </div>
  )
}

export default React.memo(Header)

