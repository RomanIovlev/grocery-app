import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

/**
 * LanguageSwitcher component - allows users to switch between languages
 */
function LanguageSwitcher() {
  const { currentLanguage, setCurrentLanguage } = useLanguage()

  return (
    <div className="language-switcher" role="group" aria-label="Language selection">
      <button
        type="button"
        className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => setCurrentLanguage('en')}
        aria-pressed={currentLanguage === 'en'}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn ${currentLanguage === 'nl' ? 'active' : ''}`}
        onClick={() => setCurrentLanguage('nl')}
        aria-pressed={currentLanguage === 'nl'}
        aria-label="Switch to Dutch"
      >
        NL
      </button>
    </div>
  )
}

// No PropTypes needed as this component doesn't accept props

export default React.memo(LanguageSwitcher)
