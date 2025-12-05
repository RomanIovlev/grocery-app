import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { ENTRANCE, EXIT, ENTRANCE_ICON, EXIT_ICON } from '../constants/grid'
import { generateRandomProducts, calculateMinSteps, isMovementAllowed, getAdjacentNodes } from '../utils/gameUtils'
import { useGrid } from '../hooks/useGrid'
import InteractiveGrid from './Grid/InteractiveGrid'

/**
 * GameScreen component - game mode where user navigates by clicking nodes
 */
function GameScreen() {
  const { t } = useLanguage()
  const { getTotalSize } = useGrid()
  
  const [gameState, setGameState] = useState(null)
  const [currentPosition, setCurrentPosition] = useState(ENTRANCE)
  const [stepsTaken, setStepsTaken] = useState(0)
  const [collectedProducts, setCollectedProducts] = useState(new Set())
  const [gameStatus, setGameStatus] = useState('playing') // 'playing', 'won', 'lost'
  const [selectedProducts, setSelectedProducts] = useState(new Map())

  // Initialize game
  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = useCallback(() => {
    const gameData = generateRandomProducts()
    const minSteps = calculateMinSteps(gameData.products)
    
    // Create selected products map for display
    const productsMap = new Map()
    gameData.productIcons.forEach((item) => {
      productsMap.set(`${item.coords[0]},${item.coords[1]}`, {
        coords: item.coords,
        icon: item.icon,
      })
    })
    
    setGameState({
      products: gameData.products,
      productIcons: gameData.productIcons,
      shelfPlan: gameData.shelfPlan,
      minSteps,
    })
    setSelectedProducts(productsMap)
    setCurrentPosition(ENTRANCE)
    setStepsTaken(0)
    setCollectedProducts(new Set())
    setGameStatus('playing')
  }, [])

  // Play sound effects
  const playSound = useCallback((type) => {
    try {
      // Create audio context for sound generation
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      if (type === 'success') {
        // Success sound - pleasant chime
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } else if (type === 'failure') {
        // Failure sound - low buzz
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 200
        oscillator.type = 'sawtooth'
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      }
    } catch (error) {
      // Silently fail if audio is not available
      console.warn('Audio not available:', error)
    }
  }, [])

  const handleNodeClick = useCallback((x, y) => {
    if (gameStatus !== 'playing' || !gameState) return
    
    const targetPos = [x, y]
    const targetKey = `${x},${y}`
    
    // Check if movement is allowed
    if (!isMovementAllowed(currentPosition, targetPos)) {
      return
    }
    
    // Check if we have steps left
    const newSteps = stepsTaken + 1
    if (newSteps > gameState.minSteps) {
      // Game over - no steps left
      setGameStatus('lost')
      playSound('failure')
      return
    }
    
    setStepsTaken(newSteps)
    setCurrentPosition(targetPos)
    
    // Check if we collected a product
    const productIndex = gameState.products.findIndex(([px, py]) => px === x && py === y)
    if (productIndex !== -1 && !collectedProducts.has(targetKey)) {
      const newCollected = new Set(collectedProducts)
      newCollected.add(targetKey)
      setCollectedProducts(newCollected)
      playSound('success')
    }
    
    // Check win condition: at exit with all products collected
    if (x === EXIT[0] && y === EXIT[1] && collectedProducts.size === gameState.products.length) {
      setGameStatus('won')
      return
    }
    
    // Check if steps exhausted (lose condition)
    if (newSteps >= gameState.minSteps) {
      setGameStatus('lost')
      playSound('failure')
    }
  }, [currentPosition, stepsTaken, gameState, collectedProducts, gameStatus, playSound])

  // Update selected products to show collected ones differently
  const displayProducts = useMemo(() => {
    if (!gameState) return new Map()
    
    const displayMap = new Map()
    gameState.productIcons.forEach((item) => {
      const key = `${item.coords[0]},${item.coords[1]}`
      displayMap.set(key, {
        coords: item.coords,
        icon: item.icon,
        collected: collectedProducts.has(key),
      })
    })
    return displayMap
  }, [gameState, collectedProducts])

  if (!gameState) {
    return <div>Loading...</div>
  }

  return (
    <div className="screen active">
      <div className="container">
        <div className="ah-header">
          <div className="ah-logo">AH</div>
          <h1>{t('gameModeTitle')}</h1>
        </div>

        <div className="input-section">
          <div className="game-info">
            <div className="game-stat">
              <span className="stat-label">{t('minSteps')}:</span>
              <span className="stat-value">{gameState.minSteps}</span>
            </div>
            <div className="game-stat">
              <span className="stat-label">{t('stepsTaken')}:</span>
              <span className={`stat-value ${stepsTaken > gameState.minSteps ? 'warning' : ''}`}>
                {stepsTaken}
              </span>
            </div>
            <div className="game-stat">
              <span className="stat-label">{t('productsCollected')}:</span>
              <span className="stat-value">
                {collectedProducts.size} / {gameState.products.length}
              </span>
            </div>
          </div>

          {gameStatus === 'won' && (
            <div className="game-message success">
              <h2>{t('gameWon')}</h2>
              <p>{t('gameWonDesc')}</p>
            </div>
          )}

          {gameStatus === 'lost' && (
            <div className="game-message failure">
              <h2>{t('gameLost')}</h2>
              <p>{t('gameLostDesc')}</p>
            </div>
          )}

          <p>{t('gameInstructions')}</p>

          <div className="input-grid-container">
            <InteractiveGrid
              selectedProducts={displayProducts}
              onNodeClick={handleNodeClick}
              currentPosition={currentPosition}
              gameMode={true}
            />
          </div>

          <div className="game-actions">
            <button onClick={startNewGame} className="ah-primary-btn" type="button">
              {t('newGame')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(GameScreen)

