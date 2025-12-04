import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { GRID_SIZE, ENTRANCE, EXIT, getAllowedArcs, generateNavigationInstructions } from '../utils/tspSolver'
import { NODE_SIZE, NODE_SPACING, GRID_PADDING, getNodeCenter, FRUITS_VEGETABLES } from '../utils/gridUtils'

function NavigationScreen({ solution, products, onBack }) {
  const { t, currentLanguage } = useLanguage()
  const svgRef = useRef(null)
  const gridRef = useRef(null)
  const gridWrapperRef = useRef(null)
  const [selectedProductsMap] = useState(() => {
    // Create a map from products to maintain icon consistency
    const map = new Map()
    if (products) {
      products.forEach(([x, y], index) => {
        map.set(`${x},${y}`, FRUITS_VEGETABLES[index % FRUITS_VEGETABLES.length])
      })
    }
    return map
  })

  const initSvgMarkers = useCallback((svg) => {
    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.appendChild(defs)
    }
    
    // Check if marker already exists
    if (!defs.querySelector('#arrowhead')) {
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
      marker.setAttribute('id', 'arrowhead')
      marker.setAttribute('markerWidth', '8')
      marker.setAttribute('markerHeight', '8')
      marker.setAttribute('refX', '7')
      marker.setAttribute('refY', '4')
      marker.setAttribute('orient', 'auto')
      
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
      polygon.setAttribute('points', '0 0, 8 4, 0 8')
      polygon.setAttribute('fill', '#00ADE6')
      marker.appendChild(polygon)
      defs.appendChild(marker)
    }
  }, [])

  const drawLine = useCallback((svg, from, to, isPathArc = false, arcIndex = -1) => {
    const fromCenter = getNodeCenter(from[0], from[1])
    const toCenter = getNodeCenter(to[0], to[1])
    
    // Calculate points on node boundaries
    const dx = toCenter.x - fromCenter.x
    const dy = toCenter.y - fromCenter.y
    const angle = Math.atan2(dy, dx)
    const radius = NODE_SIZE / 2
    
    const startX = fromCenter.x + Math.cos(angle) * radius
    const startY = fromCenter.y + Math.sin(angle) * radius
    const endX = toCenter.x - Math.cos(angle) * radius
    const endY = toCenter.y - Math.sin(angle) * radius
    
    // Create line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', startX)
    line.setAttribute('y1', startY)
    line.setAttribute('x2', endX)
    line.setAttribute('y2', endY)
    
    if (isPathArc) {
      line.setAttribute('stroke', '#00ADE6')
      line.setAttribute('stroke-width', '3')
      line.setAttribute('opacity', '0.4')
      line.setAttribute('class', 'path-arc')
      line.setAttribute('data-index', arcIndex)
      line.setAttribute('marker-end', 'url(#arrowhead)')
    } else {
      line.setAttribute('stroke', '#ccc')
      line.setAttribute('stroke-width', '1.5')
      line.setAttribute('opacity', '0.5')
      line.setAttribute('class', 'allowed-arc')
    }
    
    line.setAttribute('stroke-linecap', 'round')
    svg.appendChild(line)
    
    return line
  }, [])

  const renderGrid = useCallback((products, path) => {
    const grid = gridRef.current
    const svg = svgRef.current
    const gridWrapper = gridWrapperRef.current
    
    if (!grid || !svg || !gridWrapper) return
    
    // Clear previous state
    grid.innerHTML = ''
    svg.innerHTML = ''
    
    // Set SVG and wrapper size
    const totalSize = (GRID_SIZE - 1) * NODE_SPACING + 2 * GRID_PADDING
    svg.setAttribute('width', totalSize)
    svg.setAttribute('height', totalSize)
    gridWrapper.style.width = `${totalSize}px`
    gridWrapper.style.height = `${totalSize}px`
    
    // Initialize SVG markers
    initSvgMarkers(svg)
    
    // Get all allowed arcs
    const allowedArcs = getAllowedArcs()
    
    // Draw all allowed arcs (light gray)
    allowedArcs.forEach(([from, to]) => {
      drawLine(svg, from, to, false)
    })
    
    // Create product map with fruits (use saved icons)
    const productMap = new Map()
    let tempFruitIndex = 0
    products.forEach(([x, y]) => {
      const key = `${x},${y}`
      if (selectedProductsMap.has(key)) {
        productMap.set(key, selectedProductsMap.get(key))
      } else {
        // If product not in selectedProductsMap, use icon by order
        productMap.set(key, FRUITS_VEGETABLES[tempFruitIndex % FRUITS_VEGETABLES.length])
        tempFruitIndex++
      }
    })
    
    // Create nodes
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const node = document.createElement('div')
        node.className = 'node'
        node.dataset.x = x
        node.dataset.y = y
        
        const center = getNodeCenter(x, y)
        node.style.left = `${center.x - NODE_SIZE / 2}px`
        node.style.top = `${center.y - NODE_SIZE / 2}px`
        
        // Check node type
        if (x === ENTRANCE[0] && y === ENTRANCE[1]) {
          node.classList.add('entrance')
          node.textContent = '🛒'
        } else if (x === EXIT[0] && y === EXIT[1]) {
          node.classList.add('exit')
          node.textContent = '💰'
        } else if (productMap.has(`${x},${y}`)) {
          node.classList.add('product')
          node.textContent = productMap.get(`${x},${y}`)
        } else {
          node.classList.add('empty')
        }
        
        const label = document.createElement('div')
        label.className = 'node-label'
        label.textContent = `(${x},${y})`
        node.appendChild(label)
        
        grid.appendChild(node)
      }
    }
    
    // Draw path arcs (blue with arrows)
    if (path && path.length > 0) {
      path.forEach(([from, to], index) => {
        drawLine(svg, from, to, true, index)
      })
    }
  }, [selectedProductsMap, initSvgMarkers, drawLine])

  const animatePath = useCallback((path, products) => {
    if (!path || path.length === 0) return
    
    let currentIndex = 0
    const svg = svgRef.current
    
    if (!svg) return
    
    // First make all path arcs semi-transparent
    document.querySelectorAll('.path-arc').forEach(arc => {
      arc.setAttribute('opacity', '0.3')
      arc.setAttribute('stroke-width', '2')
    })
    
    function animateStep() {
      if (currentIndex >= path.length) {
        // Animation complete - make all arcs bright
        document.querySelectorAll('.path-arc').forEach(arc => {
          arc.setAttribute('opacity', '0.6')
          arc.setAttribute('stroke-width', '3')
        })
        return
      }
      
      // Remove highlight from previous arc
      if (currentIndex > 0) {
        const prevArc = svg.querySelector(`.path-arc[data-index="${currentIndex - 1}"]`)
        if (prevArc) {
          prevArc.setAttribute('opacity', '0.6')
          prevArc.setAttribute('stroke-width', '3')
        }
      }
      
      // Highlight current arc
      const currentArc = svg.querySelector(`.path-arc[data-index="${currentIndex}"]`)
      if (currentArc) {
        currentArc.setAttribute('opacity', '1')
        currentArc.setAttribute('stroke-width', '5')
        currentArc.setAttribute('stroke', '#00ADE6')
      }
      
      currentIndex++
      
      setTimeout(animateStep, 500)
    }
    
    animateStep()
  }, [])

  useEffect(() => {
    if (solution && products) {
      renderGrid(products, solution.path)
      setTimeout(() => {
        animatePath(solution.path, products)
      }, 500)
    }
  }, [solution, products, renderGrid, animatePath])

  useEffect(() => {
    // Re-render when language changes to update instructions (instructions are computed in render)
    // The grid doesn't need to re-render, only instructions update
  }, [currentLanguage])

  const instructions = useMemo(() => {
    return solution && products 
      ? generateNavigationInstructions(solution.path, products, t)
      : []
  }, [solution, products, t, currentLanguage])

  return (
    <div className="screen active">
      <div className="container">
        <div className="ah-header">
          <div className="ah-logo">AH</div>
          <h1>{t('navigationTitle')}</h1>
        </div>
        
        <button onClick={onBack} className="ah-back-btn">
          {t('back')}
        </button>
        
        <div className="navigation-content">
          <div className="grid-container">
            <div className="grid-wrapper" ref={gridWrapperRef}>
              <svg ref={svgRef} className="path-svg"></svg>
              <div ref={gridRef} className="grid"></div>
            </div>
          </div>

          <div className="instructions-section">
            <h2>{t('instructions')}</h2>
            <div className="instructions-list">
              {instructions.map((inst, index) => (
                <div key={index} className="instruction-item">
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

export default NavigationScreen

