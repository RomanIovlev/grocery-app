import { useCallback } from 'react'
import { GRID_SIZE, NODE_SIZE, NODE_SPACING, GRID_PADDING } from '../constants/grid'
import { getNodeCenter } from '../utils/gridUtils'

/**
 * Custom hook for grid-related calculations
 */
export function useGrid() {
  const getTotalSize = useCallback(() => {
    return (GRID_SIZE - 1) * NODE_SPACING + 2 * GRID_PADDING
  }, [])

  const getNodePosition = useCallback((x, y) => {
    const center = getNodeCenter(x, y)
    return {
      left: center.x - NODE_SIZE / 2,
      top: center.y - NODE_SIZE / 2,
    }
  }, [])

  return {
    getTotalSize,
    getNodePosition,
    gridSize: GRID_SIZE,
    nodeSize: NODE_SIZE,
  }
}

