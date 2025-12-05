import { useCallback, useRef, useEffect } from 'react'
import {
  SVG_LINE_OPACITY,
  SVG_LINE_WIDTH,
  SVG_LINE_COLORS,
  ANIMATION_DELAY,
} from '../constants/grid'

/**
 * Custom hook for animating path visualization
 */
export function usePathAnimation() {
  const animationTimeoutRef = useRef(null)

  const animatePath = useCallback(
    (svgElement, pathLength) => {
      if (!svgElement || !pathLength || pathLength === 0) return

      // Clear any existing animation
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }

      // First make all path arcs semi-transparent
      const pathArcs = svgElement.querySelectorAll('.path-arc')
      pathArcs.forEach((arc) => {
        arc.setAttribute('opacity', SVG_LINE_OPACITY.PATH_DIM.toString())
        arc.setAttribute('stroke-width', SVG_LINE_WIDTH.PATH_DIM.toString())
      })

      let currentIndex = 0

      const animateStep = () => {
        if (currentIndex >= pathLength) {
          // Animation complete - make all arcs bright
          pathArcs.forEach((arc) => {
            arc.setAttribute('opacity', SVG_LINE_OPACITY.PATH_DEFAULT.toString())
            arc.setAttribute('stroke-width', SVG_LINE_WIDTH.PATH_DEFAULT.toString())
          })
          return
        }

        // Remove highlight from previous arc
        if (currentIndex > 0) {
          const prevArc = svgElement.querySelector(
            `.path-arc[data-index="${currentIndex - 1}"]`
          )
          if (prevArc) {
            prevArc.setAttribute('opacity', SVG_LINE_OPACITY.PATH_DEFAULT.toString())
            prevArc.setAttribute('stroke-width', SVG_LINE_WIDTH.PATH_DEFAULT.toString())
          }
        }

        // Highlight current arc
        const currentArc = svgElement.querySelector(
          `.path-arc[data-index="${currentIndex}"]`
        )
        if (currentArc) {
          currentArc.setAttribute('opacity', SVG_LINE_OPACITY.PATH_HIGHLIGHT.toString())
          currentArc.setAttribute('stroke-width', SVG_LINE_WIDTH.PATH_HIGHLIGHT.toString())
          currentArc.setAttribute('stroke', SVG_LINE_COLORS.PATH)
        }

        currentIndex++
        animationTimeoutRef.current = setTimeout(animateStep, ANIMATION_DELAY)
      }

      animateStep()
    },
    []
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  return { animatePath }
}

