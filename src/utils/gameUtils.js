import { GRID_SIZE, ENTRANCE, EXIT } from '../constants/grid'
import { getAvailableProducts } from './productUtils'
import { generateGroceryPlan } from './groceryPlanGenerator'
import { solveTSP, distance, canMoveHorizontally } from './tspSolver'

/**
 * Generate random products for the game (2-5 products)
 */
export function generateRandomProducts() {
  const numProducts = Math.floor(Math.random() * 4) + 2 // 2-5 products
  const availableProducts = getAvailableProducts()
  
  // Generate random basket items
  const basketItems = []
  for (let i = 0; i < numProducts; i++) {
    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)]
    basketItems.push(randomProduct)
  }
  
  // Generate grocery plan
  const plan = generateGroceryPlan(basketItems)
  
  return {
    products: plan.productLocations,
    productIcons: plan.productLocations.map(([x, y]) => {
      const productType = plan.shelfPlan.get(`${x},${y}`)
      return { coords: [x, y], icon: productType }
    }),
    shelfPlan: plan.shelfPlan,
  }
}

/**
 * Calculate minimum steps needed for the optimal path
 * Steps are only movement through arcs (not turns or picking up items)
 */
export function calculateMinSteps(products) {
  const solution = solveTSP(products)
  return solution.totalDistance
}

/**
 * Check if movement from one node to another is allowed
 */
export function isMovementAllowed(from, to) {
  const [x1, y1] = from
  const [x2, y2] = to
  
  // Same position
  if (x1 === x2 && y1 === y2) return false
  
  // Vertical movement always allowed
  if (x1 === x2) {
    return Math.abs(y2 - y1) === 1
  }
  
  // Horizontal movement only allowed on y=0 or y=3
  if (y1 === y2 && canMoveHorizontally(y1)) {
    return Math.abs(x2 - x1) === 1
  }
  
  return false
}

/**
 * Get all adjacent nodes that can be reached from current position
 */
export function getAdjacentNodes(currentPos) {
  const [x, y] = currentPos
  const adjacent = []
  
  // Check vertical movements (always allowed)
  if (y > 0) adjacent.push([x, y - 1])
  if (y < GRID_SIZE - 1) adjacent.push([x, y + 1])
  
  // Check horizontal movements (only on y=0 or y=3)
  if (canMoveHorizontally(y)) {
    if (x > 0) adjacent.push([x - 1, y])
    if (x < GRID_SIZE - 1) adjacent.push([x + 1, y])
  }
  
  return adjacent
}

