import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header'
import SelectionScreen from './components/SelectionScreen'
import BasketSelectionScreen from './components/BasketSelectionScreen'
import NavigationScreen from './components/NavigationScreen'
import { LanguageProvider } from './contexts/LanguageContext'

/**
 * Navigation wrapper component to handle route-based navigation
 */
function NavigationWrapper() {
  const location = useLocation()

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/basket" replace />} />
        <Route
          path="/basket"
          element={<BasketSelectionScreen />}
        />
        <Route
          path="/grid"
          element={<SelectionScreen />}
        />
        <Route
          path="/navigation"
          element={
            <NavigationScreen
              solution={location.state?.solution}
              products={location.state?.products}
              productsWithIcons={location.state?.productsWithIcons}
            />
          }
        />
      </Routes>
    </>
  )
}

/**
 * Main App component
 */
function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <NavigationWrapper />
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
