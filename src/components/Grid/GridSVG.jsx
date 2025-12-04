import { useEffect, useRef, forwardRef } from 'react'
import PropTypes from 'prop-types'
import { SVG_LINE_COLORS } from '../../constants/grid'

/**
 * GridSVG component - renders SVG with markers and lines
 */
// eslint-disable-next-line prefer-arrow-callback
const GridSVG = forwardRef(function GridSVG({ children, width, height, className = '' }, ref) {
  const internalRef = useRef(null)
  const svgRef = ref || internalRef

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    // Initialize SVG markers (arrowhead)
    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.appendChild(defs)
    }

    // Check if marker already exists
    if (!defs.querySelector('#arrowhead')) {
      const marker = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'marker'
      )
      marker.setAttribute('id', 'arrowhead')
      marker.setAttribute('markerWidth', '8')
      marker.setAttribute('markerHeight', '8')
      marker.setAttribute('refX', '7')
      marker.setAttribute('refY', '4')
      marker.setAttribute('orient', 'auto')

      const polygon = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'polygon'
      )
      polygon.setAttribute('points', '0 0, 8 4, 0 8')
      polygon.setAttribute('fill', SVG_LINE_COLORS.PATH)
      marker.appendChild(polygon)
      defs.appendChild(marker)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      {children}
    </svg>
  )
})

GridSVG.propTypes = {
  children: PropTypes.node,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  className: PropTypes.string,
}

export default GridSVG

