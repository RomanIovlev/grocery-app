import React, { createContext, useContext, useState } from 'react'

const translations = {
  en: {
    title: "Select Your Products",
    navigationTitle: "Your Shopping Route",
    selectProducts: "Select products on the grid",
    selectProductsDesc: "Tap on a location to add a product. Tap again to remove.",
    findPath: "Find Products",
    clearAll: "Clear All",
    back: "← Back to Selection",
    instructions: "Navigation Instructions",
    goForward: "Go forward",
    goBackward: "Go backward",
    turnRight: "Turn right",
    turnLeft: "Turn left",
    collectProduct: "Collect product",
    reachCheckout: "Reach checkout"
  },
  nl: {
    title: "Selecteer Uw Producten",
    navigationTitle: "Uw Winkelroute",
    selectProducts: "Selecteer producten op het raster",
    selectProductsDesc: "Tik op een locatie om een product toe te voegen. Tik opnieuw om te verwijderen.",
    findPath: "Vind Producten",
    clearAll: "Alles Wissen",
    back: "← Terug naar Selectie",
    instructions: "Navigatie Instructies",
    goForward: "Ga vooruit",
    goBackward: "Ga achteruit",
    turnRight: "Sla rechtsaf",
    turnLeft: "Sla linksaf",
    collectProduct: "Verzamel product",
    reachCheckout: "Bereik kassa"
  }
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('nl')

  const t = React.useCallback((key, params = {}) => {
    let text = translations[currentLanguage][key] || translations.en[key] || key
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param])
      })
    }
    return text
  }, [currentLanguage])

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

