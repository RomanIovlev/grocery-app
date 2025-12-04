import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { GRID_SIZE, ENTRANCE, EXIT } from '../../constants/grid'
import { getAllowedArcs } from '../../utils/tspSolver'
import { useGrid } from '../../hooks/useGrid'
import GridNode from './GridNode'
import SVGLine from './SVGLine'
import GridSVG from './GridSVG'

/**
 * GroceryPlanGrid component - displays the grocery plan with all shelves showing their product types
 */
function GroceryPlanGrid({ shelfPlan, selectedProducts, className = '' }) {
  const { getTotalSize, getNodePosition } = useGrid()

  const totalSize = useMemo(() => getTotalSize(), [getTotalSize])
  const allowedArcs = useMemo(() => getAllowedArcs(), [])

  const getNodeType = (x, y) => {
    if (x === ENTRANCE[0] && y === ENTRANCE[1]) return 'entrance'
    if (x === EXIT[0] && y === EXIT[1]) return 'exit'
    if (selectedProducts && selectedProducts.has(`${x},${y}`)) return 'product'
    // Show all shelves with their product types
    if (shelfPlan && shelfPlan.has(`${x},${y}`)) return 'product'
    return 'empty'
  }

  const getNodeIcon = (x, y) => {
    // If it's a selected product location, show it
    if (selectedProducts && selectedProducts.has(`${x},${y}`)) {
      return selectedProducts.get(`${x},${y}`)?.icon || null
    }
    // Otherwise, show the shelf's product type
    if (shelfPlan && shelfPlan.has(`${x},${y}`)) {
      return shelfPlan.get(`${x},${y}`)
    }
    return null
  }

  return (
    <div
      className={`grid-wrapper ${className}`.trim()}
      style={{ width: `${totalSize}px`, height: `${totalSize}px` }}
    >
      <GridSVG width={totalSize} height={totalSize} className="input-svg">
        {allowedArcs.map(([from, to], index) => (
          <SVGLine key={`arc-${index}`} from={from} to={to} />
        ))}
      </GridSVG>
      <div className="input-grid" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => {
            const position = getNodePosition(x, y)
            const nodeType = getNodeType(x, y)
            const icon = getNodeIcon(x, y)

            return (
              <GridNode
                key={`node-${x}-${y}`}
                x={x}
                y={y}
                nodeType={nodeType}
                icon={icon}
                label={`(${x},${y})`}
                onClick={undefined}
                position={position}
                useInputClass={true}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

GroceryPlanGrid.propTypes = {
  shelfPlan: PropTypes.instanceOf(Map),
  selectedProducts: PropTypes.instanceOf(Map),
  className: PropTypes.string,
}

export default React.memo(GroceryPlanGrid)

