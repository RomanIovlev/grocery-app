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

  const currentMode = location.pathname.startsWith('/grid') ? 'grid' : 'basket'

  const handleModeChange = (mode) => {
    if (mode === 'grid') {
      navigate('/grid')
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
        </div>
      </div>
      <LanguageSwitcher />
    </div>
  )
}

export default React.memo(Header)

