import React, { useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { GRID_SIZE, ENTRANCE, EXIT, ANIMATION_INITIAL_DELAY } from '../constants/grid'
import { FRUITS_VEGETABLES } from '../constants/products'
import { getAllowedArcs, generateNavigationInstructions } from '../utils/tspSolver'
import { useGrid } from '../hooks/useGrid'
import { getNodeCenter } from '../utils/gridUtils'
import { usePathAnimation } from '../hooks/usePathAnimation'
import GridSVG from './Grid/GridSVG'

/**
 * NavigationScreen component - displays the calculated route with visualization
 */
function NavigationScreen({ solution, products, productsWithIcons }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const svgRef = useRef(null)
  const gridRef = useRef(null)
  const gridWrapperRef = useRef(null)
  const { getTotalSize, getNodePosition } = useGrid()
  const { animatePath } = usePathAnimation()

  // Get solution and products from location state if not provided as props
  const finalSolution = solution || location.state?.solution
  const finalProducts = products || location.state?.products
  const finalProductsWithIcons = productsWithIcons || location.state?.productsWithIcons

  const handleBack = () => {
    const from = location.state?.from || '/basket'
    navigate(from)
  }

  // Create product icon map
  const productIconMap = useMemo(() => {
    const map = new Map()
    if (finalProductsWithIcons && finalProductsWithIcons.length > 0) {
      // Use provided products with icons
      finalProductsWithIcons.forEach((item) => {
        const [x, y] = item.coords
        map.set(`${x},${y}`, item.icon)
      })
    } else if (finalProducts) {
      // Fallback to generating icons by index
      finalProducts.forEach(([x, y], index) => {
        map.set(`${x},${y}`, FRUITS_VEGETABLES[index % FRUITS_VEGETABLES.length])
      })
    }
    return map
  }, [finalProducts, finalProductsWithIcons])

  // Render grid and path
  useEffect(() => {
    if (!finalSolution || !finalProducts || !svgRef.current || !gridRef.current || !gridWrapperRef.current) {
      return
    }

    const svg = svgRef.current
    const grid = gridRef.current
    const gridWrapper = gridWrapperRef.current

    // Clear previous state
    grid.innerHTML = ''
    svg.innerHTML = ''

    // Set SVG and wrapper size
    const totalSize = getTotalSize()
    svg.setAttribute('width', totalSize)
    svg.setAttribute('height', totalSize)
    gridWrapper.style.width = `${totalSize}px`
    gridWrapper.style.height = `${totalSize}px`

    // Draw allowed arcs
    const allowedArcs = getAllowedArcs()
    allowedArcs.forEach(([from, to]) => {
      const fromCenter = getNodeCenter(from[0], from[1])
      const toCenter = getNodeCenter(to[0], to[1])
      const dx = toCenter.x - fromCenter.x
      const dy = toCenter.y - fromCenter.y
      const angle = Math.atan2(dy, dx)
      const radius = 15
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', fromCenter.x + Math.cos(angle) * radius)
      line.setAttribute('y1', fromCenter.y + Math.sin(angle) * radius)
      line.setAttribute('x2', toCenter.x - Math.cos(angle) * radius)
      line.setAttribute('y2', toCenter.y - Math.sin(angle) * radius)
      line.setAttribute('stroke', '#ccc')
      line.setAttribute('stroke-width', '1.5')
      line.setAttribute('opacity', '0.5')
      line.setAttribute('stroke-linecap', 'round')
      line.setAttribute('class', 'allowed-arc')
      svg.appendChild(line)
    })

    // Create nodes
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const position = getNodePosition(x, y)
        let nodeType = 'empty'
        let icon = null

        if (x === ENTRANCE[0] && y === ENTRANCE[1]) {
          nodeType = 'entrance'
        } else if (x === EXIT[0] && y === EXIT[1]) {
          nodeType = 'exit'
        } else if (productIconMap.has(`${x},${y}`)) {
          nodeType = 'product'
          icon = productIconMap.get(`${x},${y}`)
        }

        const node = document.createElement('div')
        node.className = `node ${nodeType}`
        node.dataset.x = x
        node.dataset.y = y
        node.style.position = 'absolute'
        node.style.left = `${position.left}px`
        node.style.top = `${position.top}px`

        if (nodeType === 'entrance') {
          node.textContent = '🛒'
        } else if (nodeType === 'exit') {
          node.textContent = '💰'
        } else if (icon) {
          node.textContent = icon
        }

        const label = document.createElement('div')
        label.className = 'node-label'
        label.textContent = `(${x},${y})`
        node.appendChild(label)

        grid.appendChild(node)
      }
    }

    // Draw path arcs
    if (finalSolution.path && finalSolution.path.length > 0) {
      finalSolution.path.forEach(([from, to], index) => {
        const fromCenter = getNodeCenter(from[0], from[1])
        const toCenter = getNodeCenter(to[0], to[1])
        const dx = toCenter.x - fromCenter.x
        const dy = toCenter.y - fromCenter.y
        const angle = Math.atan2(dy, dx)
        const radius = 15
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        line.setAttribute('x1', fromCenter.x + Math.cos(angle) * radius)
        line.setAttribute('y1', fromCenter.y + Math.sin(angle) * radius)
        line.setAttribute('x2', toCenter.x - Math.cos(angle) * radius)
        line.setAttribute('y2', toCenter.y - Math.sin(angle) * radius)
        line.setAttribute('stroke', '#00ADE6')
        line.setAttribute('stroke-width', '3')
        line.setAttribute('opacity', '0.4')
        line.setAttribute('class', 'path-arc')
        line.setAttribute('data-index', index)
        line.setAttribute('marker-end', 'url(#arrowhead)')
        line.setAttribute('stroke-linecap', 'round')
        svg.appendChild(line)
      })
    }

    // Start animation after a delay
    const timeoutId = setTimeout(() => {
      animatePath(svg, finalSolution.path?.length || 0)
    }, ANIMATION_INITIAL_DELAY)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [finalSolution, finalProducts, getTotalSize, getNodePosition, productIconMap, animatePath])

  const instructions = useMemo(() => {
    return finalSolution && finalProducts
      ? generateNavigationInstructions(finalSolution.path, finalProducts, t)
      : []
  }, [finalSolution, finalProducts, t])

  return (
    <div className="screen active">
      <div className="container">
        <div className="ah-header">
          <div className="ah-logo">AH</div>
          <h1>{t('navigationTitle')}</h1>
        </div>

        <button onClick={handleBack} className="ah-back-btn" type="button">
          {t('back')}
        </button>

        <div className="navigation-content">
          <div className="grid-container">
            <div className="grid-wrapper" ref={gridWrapperRef}>
              <GridSVG
                ref={svgRef}
                width={getTotalSize()}
                height={getTotalSize()}
                className="path-svg"
              />
              <div ref={gridRef} className="grid" style={{ position: 'relative', width: '100%', height: '100%' }} />
            </div>
          </div>

          <div className="instructions-section">
            <h2>{t('instructions')}</h2>
            <div className="instructions-list">
              {instructions.map((inst, index) => (
                <div key={`instruction-${index}`} className="instruction-item">
                  {inst}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

NavigationScreen.propTypes = {
  solution: PropTypes.shape({
    path: PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
    ),
    totalDistance: PropTypes.number,
  }),
  products: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  productsWithIcons: PropTypes.arrayOf(
    PropTypes.shape({
      coords: PropTypes.arrayOf(PropTypes.number),
      icon: PropTypes.string,
    })
  ),
}

export default React.memo(NavigationScreen)
