import { createContext, useContext, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

const translations = {
  en: {
    title: "Select Your Products",
    navigationTitle: "Your Shopping Route",
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
    reachCheckout: "Reach checkout",
    gridModeTitle: "Grid Mode",
    basketModeTitle: "Basket Mode",
    gameModeTitle: "Game Mode",
    basketSelectionDesc: "Add products to your basket. Click 'Find Route' to see the store layout and optimal path.",
    findRoute: "Find Route",
    totalItems: "Total Items",
    minSteps: "Min Steps",
    stepsTaken: "Steps Taken",
    productsCollected: "Products",
    gameInstructions: "Click on adjacent nodes to navigate. Collect all products and reach the exit within the minimum steps!",
    gameWon: "Congratulations!",
    gameWonDesc: "You completed the challenge in the minimum steps!",
    gameLost: "Game Over",
    gameLostDesc: "You ran out of steps. Try again!",
    newGame: "New Game"
  },
  nl: {
    title: "Selecteer Uw Producten",
    navigationTitle: "Uw Winkelroute",
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
    reachCheckout: "Bereik kassa",
    gridModeTitle: "Raster Modus",
    basketModeTitle: "Mandje Modus",
    gameModeTitle: "Spel Modus",
    basketSelectionDesc: "Voeg producten toe aan uw mandje. Klik op 'Vind Route' om de winkelindeling en optimale route te zien.",
    findRoute: "Vind Route",
    totalItems: "Totaal Items",
    minSteps: "Min Stappen",
    stepsTaken: "Stappen Genomen",
    productsCollected: "Producten",
    gameInstructions: "Klik op aangrenzende knooppunten om te navigeren. Verzamel alle producten en bereik de uitgang binnen het minimum aantal stappen!",
    gameWon: "Gefeliciteerd!",
    gameWonDesc: "Je hebt de uitdaging voltooid in het minimum aantal stappen!",
    gameLost: "Spel Voorbij",
    gameLostDesc: "Je stappen zijn op. Probeer het opnieuw!",
    newGame: "Nieuw Spel"
  }
}

const LanguageContext = createContext()

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('nl')

  const t = useCallback((key, params = {}) => {
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

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext)
}

