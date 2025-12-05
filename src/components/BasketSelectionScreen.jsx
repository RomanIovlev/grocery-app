import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useBasketSelection } from '../hooks/useBasketSelection'
import { solveTSP } from '../utils/tspSolver'
import { generateGroceryPlan } from '../utils/groceryPlanGenerator'
import { FRUITS_VEGETABLES } from '../constants/products'
import { getAvailableProducts } from '../utils/productUtils'

/**
 * BasketSelectionScreen component - allows users to select products in a basket
 */
function BasketSelectionScreen() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const {
    basket,
    addProduct,
    removeProduct,
    clearBasket,
    getBasketArray,
    totalItems,
  } = useBasketSelection()
  const handleFindRoute = () => {
    const basketItems = getBasketArray()
    if (basketItems.length === 0) {
      return
    }

    // Generate grocery plan
    const plan = generateGroceryPlan(basketItems)
    const products = plan.productLocations
    const solution = solveTSP(products)
    
    // Create products array with icons for navigation screen
    const productsWithIcons = products.map(([x, y]) => {
      const productType = plan.shelfPlan.get(`${x},${y}`) || FRUITS_VEGETABLES[0]
      return { coords: [x, y], icon: productType }
    })
    
    // Navigate directly to navigation screen
    navigate('/navigation', { 
      state: { 
        solution,
        products,
        productsWithIcons,
        from: '/basket'
      } 
    })
  }

  return (
    <div className="screen active">
      <div className="container">
        <div className="ah-header">
          <div className="ah-logo">AH</div>
          <h1>{t('basketModeTitle')}</h1>
        </div>

        <div className="input-section">
          <p>{t('basketSelectionDesc')}</p>

          <div className="basket-container">
            <div className="basket-products">
              {getAvailableProducts().map((product) => {
                const quantity = basket.get(product) || 0
                return (
                  <div key={product} className="basket-item">
                    <div className="basket-item-icon">{product}</div>
                    <div className="basket-item-controls">
                      <button
                        onClick={() => removeProduct(product)}
                        className="basket-btn"
                        type="button"
                        disabled={quantity === 0}
                      >
                        −
                      </button>
                      <span className="basket-quantity">{quantity}</span>
                      <button
                        onClick={() => addProduct(product)}
                        className="basket-btn"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="basket-summary">
              <p>
                {t('totalItems')}: <strong>{totalItems}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleFindRoute}
            className="ah-primary-btn"
            type="button"
            disabled={totalItems === 0}
          >
            {t('findRoute')}
          </button>
          <button
            onClick={clearBasket}
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


export default React.memo(BasketSelectionScreen)

