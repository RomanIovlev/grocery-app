// Node size constants
export const NODE_SIZE = 30
export const NODE_SPACING = 100
export const GRID_PADDING = 50

// Get node center coordinates
export function getNodeCenter(x, y) {
  const centerX = GRID_PADDING + x * NODE_SPACING
  const centerY = GRID_PADDING + y * NODE_SPACING
  return { x: centerX, y: centerY }
}

// Fruits and vegetables for products
export const FRUITS_VEGETABLES = ['🍎', '🍌', '🥕', '🍇', '🥒', '🍊', '🥬', '🍓', '🥑', '🍑', '🥝', '🍅', '🌽', '🥦', '🫐', '🍐']

export function getRandomFruitIcon() {
  return FRUITS_VEGETABLES[Math.floor(Math.random() * FRUITS_VEGETABLES.length)]
}

