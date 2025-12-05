import { useState, useCallback, useMemo } from 'react'

/**
 * Custom hook for managing basket-based product selection
 */
export function useBasketSelection() {
  const [basket, setBasket] = useState(() => new Map())

  const addProduct = useCallback((productType, quantity = 1) => {
    setBasket((prev) => {
      const newMap = new Map(prev)
      const currentQty = newMap.get(productType) || 0
      newMap.set(productType, currentQty + quantity)
      return newMap
    })
  }, [])

  const removeProduct = useCallback((productType, quantity = 1) => {
    setBasket((prev) => {
      const newMap = new Map(prev)
      const currentQty = newMap.get(productType) || 0
      const newQty = Math.max(0, currentQty - quantity)
      if (newQty === 0) {
        newMap.delete(productType)
      } else {
        newMap.set(productType, newQty)
      }
      return newMap
    })
  }, [])

  const clearBasket = useCallback(() => {
    setBasket(new Map())
  }, [])

  const getBasketArray = useCallback(() => {
    const result = []
    basket.forEach((quantity, productType) => {
      for (let i = 0; i < quantity; i++) {
        result.push(productType)
      }
    })
    return result
  }, [basket])

  const totalItems = useMemo(() => {
    let total = 0
    basket.forEach((quantity) => {
      total += quantity
    })
    return total
  }, [basket])

  return {
    basket,
    addProduct,
    removeProduct,
    clearBasket,
    getBasketArray,
    totalItems,
  }
}

