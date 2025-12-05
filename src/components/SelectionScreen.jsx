import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useProductSelection } from '../hooks/useProductSelection'
import { solveTSP } from '../utils/tspSolver'
import InteractiveGrid from './Grid/InteractiveGrid'

/**
 * SelectionScreen component - allows users to select products on the grid
 */
function SelectionScreen() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const {
    selectedProducts,
    toggleProduct,
    clearProducts,
    getProductsArray,
  } = useProductSelection()

  const handleSolve = () => {
    const products = getProductsArray()
    const solution = solveTSP(products)
    navigate('/navigation', { 
      state: { 
        solution,
        products,
        productsWithIcons: null,
        from: '/grid'
      } 
    })
  }

  return (
    <div className="screen active">
      <div className="container">
        <div className="ah-header">
          <div className="ah-logo">AH</div>
          <h1>{t('title')}</h1>
        </div>

        <div className="input-section">
          <p>{t('selectProductsDesc')}</p>

          <div className="input-grid-container">
            <InteractiveGrid
              selectedProducts={selectedProducts}
              onNodeClick={toggleProduct}
            />
          </div>

          <button onClick={handleSolve} className="ah-primary-btn" type="button">
            {t('findPath')}
          </button>
          <button
            onClick={clearProducts}
            className="ah-secondary-btn"
            type="button"
          >
            {t('clearAll')}
          </button>
        </div>
      </div>
    </div>
  )
}


export default React.memo(SelectionScreen)
