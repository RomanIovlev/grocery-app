import { NODE_SPACING, GRID_PADDING } from '../constants/grid'
import { FRUITS_VEGETABLES } from '../constants/products'

/**
 * Get node center coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {{x: number, y: number}} Center coordinates
 */
export function getNodeCenter(x, y) {
  const centerX = GRID_PADDING + x * NODE_SPACING
  const centerY = GRID_PADDING + y * NODE_SPACING
  return { x: centerX, y: centerY }
}

/**
 * Get a random fruit/vegetable icon
 * @returns {string} Random emoji icon
 */
export function getRandomFruitIcon() {
  return FRUITS_VEGETABLES[Math.floor(Math.random() * FRUITS_VEGETABLES.length)]
}

