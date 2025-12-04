// Grid constants
export const GRID_SIZE = 4
export const ENTRANCE = [0, 0]
export const EXIT = [3, 0]

// Check if horizontal movement is allowed
export function canMoveHorizontally(y) {
  return y === 0 || y === 3
}

// Calculate distance between two points considering constraints
export function distance(p1, p2) {
  const [x1, y1] = p1
  const [x2, y2] = p2
  
  // If on same vertical line - can move vertically
  if (x1 === x2) {
    return Math.abs(y2 - y1)
  }
  
  // If on same horizontal line and can move horizontally
  if (y1 === y2 && canMoveHorizontally(y1)) {
    return Math.abs(x2 - x1)
  }
  
  // Need to reach a horizontal line where horizontal movement is allowed
  // Find the nearest horizontal line (y=0 or y=3)
  const horizontalLines = [0, 3]
  let minDist = Infinity
  
  for (const hLine of horizontalLines) {
    // Distance from p1 to horizontal line
    const distToLine1 = Math.abs(y1 - hLine)
    // Distance from p2 to horizontal line
    const distToLine2 = Math.abs(y2 - hLine)
    // Horizontal distance
    const horizontalDist = Math.abs(x2 - x1)
    // Total distance
    const totalDist = distToLine1 + horizontalDist + distToLine2
    minDist = Math.min(minDist, totalDist)
  }
  
  return minDist
}

// Build path between two points
export function buildPathBetween(p1, p2) {
  const [x1, y1] = p1
  const [x2, y2] = p2
  const path = []
  
  // If on same vertical line
  if (x1 === x2) {
    const step = y2 > y1 ? 1 : -1
    for (let y = y1; y !== y2; y += step) {
      path.push([[x1, y], [x1, y + step]])
    }
    return path
  }
  
  // If on same horizontal line and can move horizontally
  if (y1 === y2 && canMoveHorizontally(y1)) {
    const step = x2 > x1 ? 1 : -1
    for (let x = x1; x !== x2; x += step) {
      path.push([[x, y1], [x + step, y1]])
    }
    return path
  }
  
  // General case: need to reach a horizontal line
  const horizontalLines = [0, 3]
  let bestPath = null
  let minDist = Infinity
  
  for (const hLine of horizontalLines) {
    const dist1 = Math.abs(y1 - hLine)
    const dist2 = Math.abs(y2 - hLine)
    const horizontalDist = Math.abs(x2 - x1)
    const totalDist = dist1 + horizontalDist + dist2
    
    if (totalDist < minDist) {
      minDist = totalDist
      const tempPath = []
      
      // Movement from p1 to horizontal line
      const step1 = hLine > y1 ? 1 : -1
      for (let y = y1; y !== hLine; y += step1) {
        tempPath.push([[x1, y], [x1, y + step1]])
      }
      
      // Horizontal movement
      const step2 = x2 > x1 ? 1 : -1
      for (let x = x1; x !== x2; x += step2) {
        tempPath.push([[x, hLine], [x + step2, hLine]])
      }
      
      // Movement from horizontal line to p2
      const step3 = y2 > hLine ? 1 : -1
      for (let y = hLine; y !== y2; y += step3) {
        tempPath.push([[x2, y], [x2, y + step3]])
      }
      
      bestPath = tempPath
    }
  }
  
  return bestPath
}

// Solve TSP using brute force
export function solveTSP(products) {
  if (products.length === 0) {
    // Just path from entrance to exit
    return {
      path: buildPathBetween(ENTRANCE, EXIT),
      totalDistance: distance(ENTRANCE, EXIT)
    }
  }
  
  // Generate all permutations of products
  function permute(arr) {
    if (arr.length <= 1) return [arr]
    const result = []
    for (let i = 0; i < arr.length; i++) {
      const rest = [...arr.slice(0, i), ...arr.slice(i + 1)]
      const perms = permute(rest)
      for (const perm of perms) {
        result.push([arr[i], ...perm])
      }
    }
    return result
  }
  
  const permutations = permute(products)
  let bestPath = null
  let minDistance = Infinity
  
  for (const perm of permutations) {
    let totalDist = distance(ENTRANCE, perm[0])
    for (let i = 0; i < perm.length - 1; i++) {
      totalDist += distance(perm[i], perm[i + 1])
    }
    totalDist += distance(perm[perm.length - 1], EXIT)
    
    if (totalDist < minDistance) {
      minDistance = totalDist
      
      // Build full path
      const fullPath = []
      
      // From entrance to first product
      fullPath.push(...buildPathBetween(ENTRANCE, perm[0]))
      
      // Between products
      for (let i = 0; i < perm.length - 1; i++) {
        fullPath.push(...buildPathBetween(perm[i], perm[i + 1]))
      }
      
      // From last product to exit
      fullPath.push(...buildPathBetween(perm[perm.length - 1], EXIT))
      
      bestPath = fullPath
    }
  }
  
  // Find optimal order
  let optimalOrder = [ENTRANCE, ...products, EXIT]
  if (products.length > 0) {
    const optimalPerm = permutations.find(p => {
      let dist = distance(ENTRANCE, p[0])
      for (let i = 0; i < p.length - 1; i++) {
        dist += distance(p[i], p[i + 1])
      }
      dist += distance(p[p.length - 1], EXIT)
      return dist === minDistance
    })
    if (optimalPerm) {
      optimalOrder = [ENTRANCE, ...optimalPerm, EXIT]
    }
  }
  
  return {
    path: bestPath,
    totalDistance: minDistance,
    order: optimalOrder
  }
}

// Get all allowed arcs (where movement is allowed)
export function getAllowedArcs() {
  const arcs = []
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      // Vertical movement always allowed
      if (y < GRID_SIZE - 1) {
        arcs.push([[x, y], [x, y + 1]])
      }
      if (y > 0) {
        arcs.push([[x, y], [x, y - 1]])
      }
      
      // Horizontal movement allowed only on y=0 and y=3
      if (canMoveHorizontally(y)) {
        if (x < GRID_SIZE - 1) {
          arcs.push([[x, y], [x + 1, y]])
        }
        if (x > 0) {
          arcs.push([[x, y], [x - 1, y]])
        }
      }
    }
  }
  
  return arcs
}

// Generate navigation instructions
export function generateNavigationInstructions(path, products, t) {
  if (!path || path.length === 0) return []
  
  const instructions = []
  let stepNumber = 1
  let currentDirection = 'east' // Initial direction - facing east (right)
  
  // Product map for checking
  const productMap = new Map()
  products.forEach(([x, y]) => {
    productMap.set(`${x},${y}`, true)
  })
  
  for (let i = 0; i < path.length; i++) {
    const [from, to] = path[i]
    const [x1, y1] = from
    const [x2, y2] = to
    
    // Determine movement direction
    const dx = x2 - x1
    const dy = y2 - y1
    
    let moveDirection = ''
    if (dx > 0) moveDirection = 'east'
    else if (dx < 0) moveDirection = 'west'
    else if (dy > 0) moveDirection = 'south'
    else if (dy < 0) moveDirection = 'north'
    
    // Determine if turning is needed
    if (moveDirection !== currentDirection) {
      // Turn needed
      if ((currentDirection === 'east' && moveDirection === 'south') ||
          (currentDirection === 'south' && moveDirection === 'west') ||
          (currentDirection === 'west' && moveDirection === 'north') ||
          (currentDirection === 'north' && moveDirection === 'east')) {
        instructions.push(`${stepNumber}. ${t('turnRight')}`)
        stepNumber++
      } else if ((currentDirection === 'east' && moveDirection === 'north') ||
                 (currentDirection === 'north' && moveDirection === 'west') ||
                 (currentDirection === 'west' && moveDirection === 'south') ||
                 (currentDirection === 'south' && moveDirection === 'east')) {
        instructions.push(`${stepNumber}. ${t('turnLeft')}`)
        stepNumber++
      }
      currentDirection = moveDirection
    }
    
    // Add forward movement
    instructions.push(`${stepNumber}. ${t('goForward')}`)
    stepNumber++
    
    // Check if we reached a product
    const toKey = `${x2},${y2}`
    if (productMap.has(toKey)) {
      instructions.push(`${stepNumber}. ${t('collectProduct')} at (${x2},${y2})`)
      stepNumber++
    }
    
    // Check if we reached checkout
    if (x2 === EXIT[0] && y2 === EXIT[1]) {
      instructions.push(`${stepNumber}. ${t('reachCheckout')}`)
    }
  }
  
  return instructions
}

