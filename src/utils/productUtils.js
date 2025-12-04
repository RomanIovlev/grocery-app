import { FRUITS_VEGETABLES } from '../constants/products'

// We have exactly 14 shelves, so we need exactly 14 product types
const NUM_AVAILABLE_PRODUCTS = 14

/**
 * Get the available products for the store (14 products, one for each shelf)
 * This ensures consistency - the same 14 products are always available
 * @returns {string[]} Array of 14 product icons
 */
export function getAvailableProducts() {
  // Return the first 14 products (or we could shuffle once and cache)
  return FRUITS_VEGETABLES.slice(0, NUM_AVAILABLE_PRODUCTS)
}

