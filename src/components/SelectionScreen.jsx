import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { GRID_SIZE, ENTRANCE, EXIT, getAllowedArcs, solveTSP } from '../utils/tspSolver'
import { NODE_SIZE, NODE_SPACING, GRID_PADDING, getNodeCenter, getRandomFruitIcon, FRUITS_VEGETABLES } from '../utils/gridUtils'

function SelectionScreen({ onSolve }) {
  const { t } = useLanguage()
  const [selectedProducts, setSelectedProducts] = useState(new Map())
  const inputSvgRef = useRef(null)
  const inputGridRef = useRef(null)
  const inputGridWrapperRef = useRef(null)

  const drawInputLine = useCallback((svg, from, to) => {
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
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', startX)
    line.setAttribute('y1', startY)
    line.setAttribute('x2', endX)
    line.setAttribute('y2', endY)
    line.setAttribute('stroke', '#ccc')
    line.setAttribute('stroke-width', '1.5')
    line.setAttribute('opacity', '0.5')
    line.setAttribute('stroke-linecap', 'round')
    svg.appendChild(line)
  }, [])

  const createInputGrid = useCallback(() => {
    const inputGrid = inputGridRef.current
    const inputSvg = inputSvgRef.current
    const inputGridWrapper = inputGridWrapperRef.current
    
    if (!inputGrid || !inputSvg || !inputGridWrapper) return
    
    // Clear
    inputGrid.innerHTML = ''
    inputSvg.innerHTML = ''
    
    // Set size
    const totalSize = (GRID_SIZE - 1) * NODE_SPACING + 2 * GRID_PADDING
    inputSvg.setAttribute('width', totalSize)
    inputSvg.setAttribute('height', totalSize)
    inputGridWrapper.style.width = `${totalSize}px`
    inputGridWrapper.style.height = `${totalSize}px`
    
    // Draw allowed arcs
    const allowedArcs = getAllowedArcs()
    allowedArcs.forEach(([from, to]) => {
      drawInputLine(inputSvg, from, to)
    })
    
    // Create nodes
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const node = document.createElement('div')
        node.className = 'input-node'
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
        } else {
          node.classList.add('empty')
          // Check if there's a product at this node
          const key = `${x},${y}`
          if (selectedProducts.has(key)) {
            node.classList.add('product')
            node.textContent = selectedProducts.get(key).icon
          }
        }
        
        const label = document.createElement('div')
        label.className = 'node-label'
        label.textContent = `(${x},${y})`
        node.appendChild(label)
        
        // Add click handler (only for non-entrance and non-exit)
        if (!(x === ENTRANCE[0] && y === ENTRANCE[1]) && !(x === EXIT[0] && y === EXIT[1])) {
          node.addEventListener('click', () => toggleProduct(x, y))
          node.style.cursor = 'pointer'
        }
        
        inputGrid.appendChild(node)
      }
    }
  }, [selectedProducts, drawInputLine])

  useEffect(() => {
    createInputGrid()
  }, [createInputGrid, selectedProducts])

  const toggleProduct = (x, y) => {
    const key = `${x},${y}`
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      if (newMap.has(key)) {
        newMap.delete(key)
      } else {
        newMap.set(key, {
          coords: [x, y],
          icon: getRandomFruitIcon()
        })
      }
      return newMap
    })
  }

  const getProductsArray = () => {
    return Array.from(selectedProducts.values()).map(item => item.coords)
  }

  const handleSolve = () => {
    const products = getProductsArray()
    const solution = solveTSP(products)
    onSolve(solution, products)
  }

  const handleClear = () => {
    setSelectedProducts(new Map())
  }

  return (
    <div className="screen active">
      <div className="container">
        <div className="ah-header">
          <div className="ah-logo">AH</div>
          <h1>{t('title')}</h1>
        </div>
        
        <div className="input-section">
          <p>{t('selectProductsDesc')}</p>
          
          <div className="input-grid-container">
            <div className="input-grid-wrapper" ref={inputGridWrapperRef}>
              <svg ref={inputSvgRef} className="input-svg"></svg>
              <div ref={inputGridRef} className="input-grid"></div>
            </div>
          </div>
          
          <button onClick={handleSolve} className="ah-primary-btn">
            {t('findPath')}
          </button>
          <button onClick={handleClear} className="ah-secondary-btn">
            {t('clearAll')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectionScreen

