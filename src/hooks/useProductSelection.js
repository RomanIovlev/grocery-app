import { useState, useCallback, useMemo } from 'react'
import { getRandomFruitIcon } from '../utils/gridUtils'

/**
 * Custom hook for managing product selection
 */
export function useProductSelection() {
  const [selectedProducts, setSelectedProducts] = useState(() => new Map())

  const toggleProduct = useCallback((x, y) => {
    const key = `${x},${y}`
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      if (newMap.has(key)) {
        newMap.delete(key)
      } else {
        newMap.set(key, {
          coords: [x, y],
          icon: getRandomFruitIcon(),
        })
      }
      return newMap
    })
  }, [])

  const clearProducts = useCallback(() => {
    setSelectedProducts(new Map())
  }, [])

  const getProductsArray = useCallback(() => {
    return Array.from(selectedProducts.values()).map((item) => item.coords)
  }, [selectedProducts])

  const hasProduct = useCallback(
    (x, y) => {
      return selectedProducts.has(`${x},${y}`)
    },
    [selectedProducts]
  )

  const getProductIcon = useCallback(
    (x, y) => {
      const product = selectedProducts.get(`${x},${y}`)
      return product?.icon || null
    },
    [selectedProducts]
  )

  const productCount = useMemo(() => selectedProducts.size, [selectedProducts])

  return {
    selectedProducts,
    toggleProduct,
    clearProducts,
    getProductsArray,
    hasProduct,
    getProductIcon,
    productCount,
  }
}

