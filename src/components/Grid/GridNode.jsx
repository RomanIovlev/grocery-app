import React from 'react'
import PropTypes from 'prop-types'
import { ENTRANCE_ICON, EXIT_ICON } from '../../constants/grid'

/**
 * GridNode component - represents a single node in the grid
 */
function GridNode({ x, y, nodeType, icon, label, onClick, className = '', position, useInputClass = false }) {
  const baseClass = useInputClass ? 'input-node' : 'node'
  const baseClassName = `${baseClass} ${nodeType} ${className}`.trim()

  const getContent = () => {
    if (nodeType === 'entrance') return ENTRANCE_ICON
    if (nodeType === 'exit') return EXIT_ICON
    if (nodeType === 'product' && icon) return icon
    return ''
  }

  const isClickable = onClick && nodeType !== 'entrance' && nodeType !== 'exit'

  const style = {
    cursor: isClickable ? 'pointer' : 'default',
  }

  if (position) {
    style.position = 'absolute'
    style.left = `${position.left}px`
    style.top = `${position.top}px`
  }

  return (
    <div
      className={baseClassName}
      data-x={x}
      data-y={y}
      onClick={isClickable ? () => onClick(x, y) : undefined}
      style={style}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(x, y)
              }
            }
          : undefined
      }
      aria-label={
        nodeType === 'entrance'
          ? 'Entrance'
          : nodeType === 'exit'
          ? 'Exit'
          : nodeType === 'product'
          ? `Product at ${x}, ${y}`
          : `Empty cell at ${x}, ${y}`
      }
    >
      {getContent()}
      {label && <div className="node-label">{label}</div>}
    </div>
  )
}

GridNode.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  nodeType: PropTypes.oneOf(['entrance', 'exit', 'product', 'empty']).isRequired,
  icon: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  position: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
  }),
  useInputClass: PropTypes.bool,
}

export default React.memo(GridNode)

