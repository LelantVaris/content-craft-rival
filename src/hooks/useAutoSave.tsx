
import { useEffect, useRef, useCallback } from 'react'
import { useDebounce } from './useDebounce'

interface UseAutoSaveProps {
  data: any
  onSave: (data: any) => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutoSave({ data, onSave, delay = 30000, enabled = true }: UseAutoSaveProps) {
  const debouncedData = useDebounce(data, 3000) // Increased to 3 seconds for less aggressive saving
  const lastSavedData = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const performSave = useCallback(async () => {
    if (!enabled || !data) return
    
    // Only save if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(lastSavedData.current)) {
      return
    }

    try {
      await onSave(data)
      lastSavedData.current = data
      console.log('Auto-saved article at', new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [data, onSave, enabled])

  // Save when data changes (debounced)
  useEffect(() => {
    if (debouncedData && enabled) {
      performSave()
    }
  }, [debouncedData, performSave, enabled])

  // Periodic auto-save every 30 seconds (only if enabled and content exists)
  useEffect(() => {
    if (!enabled) return

    intervalRef.current = setInterval(() => {
      if (data && JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
        performSave()
      }
    }, delay)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [performSave, delay, enabled, data])

  // Save on component unmount (only if there are changes)
  useEffect(() => {
    return () => {
      if (enabled && data && JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
        performSave()
      }
    }
  }, [])
}
