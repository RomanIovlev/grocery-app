import { GRID_SIZE, ENTRANCE, EXIT } from '../constants/grid'
import { FRUITS_VEGETABLES } from '../constants/products'
import { getAvailableProducts } from './productUtils'

/**
 * Generate a grocery plan by assigning products to shelves
 * Each shelf (node) gets a product type, and products from basket are assigned to shelves
 * @param {string[]} basketItems - Array of product types (icons) from basket
 * @returns {Object} - { shelfPlan: Map of shelf coords to product type, productLocations: Array of [x, y] for selected products }
 */
export function generateGroceryPlan(basketItems) {
  // Create a map of available shelves (excluding entrance and exit)
  const availableShelves = []
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if ((x !== ENTRANCE[0] || y !== ENTRANCE[1]) && (x !== EXIT[0] || y !== EXIT[1])) {
        availableShelves.push([x, y])
      }
    }
  }

  // Shuffle shelves for randomness
  const shuffledShelves = [...availableShelves].sort(() => Math.random() - 0.5)

  // We have exactly 14 shelves (16 total positions - 2 for entrance/exit)
  const NUM_SHELVES = 14
  
  // Get the 14 available products and shuffle them (one for each shelf)
  const availableProducts = getAvailableProducts()
  const shuffledProducts = [...availableProducts].sort(() => Math.random() - 0.5)

  // Assign product types to shelves - every shelf gets a unique product type
  const shelfPlan = new Map()
  const productLocations = []
  
  // Assign one product type to each shelf
  shuffledShelves.forEach(([x, y], index) => {
    const productType = shuffledProducts[index]
    shelfPlan.set(`${x},${y}`, productType)
  })

  // If no basket items, return plan with all shelves but no selected products
  if (basketItems.length === 0) {
    return {
      shelfPlan,
      productLocations: [],
    }
  }

  // Now, assign basket items to shelves that have matching product types
  // Count how many of each product type we need
  const productCounts = new Map()
  basketItems.forEach((productType) => {
    productCounts.set(productType, (productCounts.get(productType) || 0) + 1)
  })

  // Find shelves with matching product types and assign them
  productCounts.forEach((count, productType) => {
    const matchingShelves = shuffledShelves.filter(([x, y]) => {
      return shelfPlan.get(`${x},${y}`) === productType
    })

    // If we have enough shelves with this product type, use them
    // Otherwise, assign to any available shelves
    const shelvesToUse = matchingShelves.length >= count
      ? matchingShelves.slice(0, count)
      : [
          ...matchingShelves,
          ...shuffledShelves
            .filter(([x, y]) => !matchingShelves.some(([mx, my]) => mx === x && my === y))
            .slice(0, count - matchingShelves.length),
        ]

    shelvesToUse.forEach(([x, y]) => {
      productLocations.push([x, y])
    })
  })

  return {
    shelfPlan,
    productLocations,
  }
}

