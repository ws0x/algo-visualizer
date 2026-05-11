import { useState, useEffect, useRef, useCallback } from 'react'

export function useAnimator(steps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(2)
  const intervalRef = useRef(null)
  const stepsRef = useRef(steps)

  useEffect(() => { stepsRef.current = steps }, [steps])

  useEffect(() => {
    setCurrentStep(0)
    setIsPlaying(false)
    clearInterval(intervalRef.current)
  }, [steps])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(s => {
          if (s >= stepsRef.current.length - 1) {
            setIsPlaying(false)
            clearInterval(intervalRef.current)
            return s
          }
          return s + 1
        })
      }, 1000 / speed)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed])

  const play = useCallback(() => {
    if (currentStep >= stepsRef.current.length - 1) setCurrentStep(0)
    setIsPlaying(true)
  }, [currentStep])

  const pause = useCallback(() => setIsPlaying(false), [])

  const reset = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const stepForward = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, stepsRef.current.length - 1))
    setIsPlaying(false)
  }, [])

  const stepBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0))
    setIsPlaying(false)
  }, [])

  const goToEnd = useCallback(() => {
    setCurrentStep(stepsRef.current.length - 1)
    setIsPlaying(false)
  }, [])

  return {
    currentStep,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    reset,
    stepForward,
    stepBack,
    goToEnd,
    totalSteps: steps.length,
    progress: steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0,
    isDone: currentStep >= steps.length - 1,
  }
}
