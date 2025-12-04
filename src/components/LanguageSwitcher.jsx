import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

function LanguageSwitcher() {
  const { currentLanguage, setCurrentLanguage } = useLanguage()

  return (
    <div className="language-switcher">
      <button 
        className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => setCurrentLanguage('en')}
      >
        EN
      </button>
      <button 
        className={`lang-btn ${currentLanguage === 'nl' ? 'active' : ''}`}
        onClick={() => setCurrentLanguage('nl')}
      >
        NL
      </button>
    </div>
  )
}

export default LanguageSwitcher

