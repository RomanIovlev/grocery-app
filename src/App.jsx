import React, { useState } from 'react'
import LanguageSwitcher from './components/LanguageSwitcher'
import SelectionScreen from './components/SelectionScreen'
import NavigationScreen from './components/NavigationScreen'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  const [currentScreen, setCurrentScreen] = useState('selection')
  const [solution, setSolution] = useState(null)
  const [productsForSolution, setProductsForSolution] = useState(null)

  const handleSolve = (sol, products) => {
    setSolution(sol)
    setProductsForSolution(products)
    setCurrentScreen('navigation')
  }

  const handleBack = () => {
    setCurrentScreen('selection')
  }

  return (
    <LanguageProvider>
      <LanguageSwitcher />
      {currentScreen === 'selection' ? (
        <SelectionScreen onSolve={handleSolve} />
      ) : (
        <NavigationScreen 
          solution={solution}
          products={productsForSolution}
          onBack={handleBack}
        />
      )}
    </LanguageProvider>
  )
}

export default App

