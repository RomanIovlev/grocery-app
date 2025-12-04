import React from 'react'
import PropTypes from 'prop-types'
import { getNodeCenter } from '../../utils/gridUtils'
import { NODE_SIZE } from '../../constants/grid'
import {
  SVG_LINE_COLORS,
  SVG_LINE_OPACITY,
  SVG_LINE_WIDTH,
} from '../../constants/grid'

/**
 * SVGLine component - renders a line in SVG
 */
function SVGLine({ from, to, isPathArc = false, arcIndex = -1 }) {
  const fromCenter = getNodeCenter(from[0], from[1])
  const toCenter = getNodeCenter(to[0], to[1])

  const dx = toCenter.x - fromCenter.x
  const dy = toCenter.y - fromCenter.y
  const angle = Math.atan2(dy, dx)
  const radius = NODE_SIZE / 2

  const startX = fromCenter.x + Math.cos(angle) * radius
  const startY = fromCenter.y + Math.sin(angle) * radius
  const endX = toCenter.x - Math.cos(angle) * radius
  const endY = toCenter.y - Math.sin(angle) * radius

  const stroke = isPathArc ? SVG_LINE_COLORS.PATH : SVG_LINE_COLORS.ALLOWED
  const strokeWidth = isPathArc
    ? SVG_LINE_WIDTH.PATH_DEFAULT
    : SVG_LINE_WIDTH.ALLOWED
  const opacity = isPathArc
    ? SVG_LINE_OPACITY.PATH_DEFAULT
    : SVG_LINE_OPACITY.ALLOWED

  return (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke={stroke}
      strokeWidth={strokeWidth}
      opacity={opacity}
      strokeLinecap="round"
      className={isPathArc ? 'path-arc' : 'allowed-arc'}
      data-index={isPathArc ? arcIndex : undefined}
      markerEnd={isPathArc ? 'url(#arrowhead)' : undefined}
    />
  )
}

SVGLine.propTypes = {
  from: PropTypes.arrayOf(PropTypes.number).isRequired,
  to: PropTypes.arrayOf(PropTypes.number).isRequired,
  isPathArc: PropTypes.bool,
  arcIndex: PropTypes.number,
}

export default React.memo(SVGLine)

