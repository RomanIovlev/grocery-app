import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { GRID_SIZE, ENTRANCE, EXIT } from '../../constants/grid'
import { getAllowedArcs } from '../../utils/tspSolver'
import { getAdjacentNodes } from '../../utils/gameUtils'
import { useGrid } from '../../hooks/useGrid'
import GridNode from './GridNode'
import SVGLine from './SVGLine'
import GridSVG from './GridSVG'

/**
 * InteractiveGrid component - renders an interactive grid for product selection
 */
function InteractiveGrid({ selectedProducts, onNodeClick, className = '', currentPosition, gameMode = false }) {
  const { getTotalSize, getNodePosition } = useGrid()

  const totalSize = useMemo(() => getTotalSize(), [getTotalSize])
  const allowedArcs = useMemo(() => getAllowedArcs(), [])

  // Get clickable nodes in game mode
  const clickableNodes = useMemo(() => {
    if (gameMode && currentPosition) {
      return new Set(
        getAdjacentNodes(currentPosition).map(([x, y]) => `${x},${y}`)
      )
    }
    return new Set()
  }, [gameMode, currentPosition])

  const getNodeType = (x, y) => {
    if (gameMode && currentPosition && currentPosition[0] === x && currentPosition[1] === y) {
      return 'current'
    }
    if (x === ENTRANCE[0] && y === ENTRANCE[1]) return 'entrance'
    if (x === EXIT[0] && y === EXIT[1]) return 'exit'
    if (selectedProducts.has(`${x},${y}`)) return 'product'
    return 'empty'
  }

  const getNodeIcon = (x, y) => {
    const product = selectedProducts.get(`${x},${y}`)
    if (product?.collected && gameMode) {
      // Show checkmark for collected products in game mode
      return '✓'
    }
    return product?.icon || null
  }
  
  const getNodeClassName = (x, y) => {
    const classes = []
    const product = selectedProducts.get(`${x},${y}`)
    if (product?.collected && gameMode) {
      classes.push('collected')
    }
    // Highlight clickable nodes in game mode
    if (gameMode && clickableNodes.has(`${x},${y}`)) {
      classes.push('clickable')
    }
    return classes.join(' ')
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
                onClick={onNodeClick}
                position={position}
                useInputClass={true}
                className={getNodeClassName(x, y)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

InteractiveGrid.propTypes = {
  selectedProducts: PropTypes.instanceOf(Map).isRequired,
  onNodeClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  currentPosition: PropTypes.arrayOf(PropTypes.number),
  gameMode: PropTypes.bool,
}

export default React.memo(InteractiveGrid)

