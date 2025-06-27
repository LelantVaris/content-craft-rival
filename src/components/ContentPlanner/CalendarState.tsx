
import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { format, parseISO } from 'date-fns'

export interface ScheduledArticle {
  id: string
  title: string
  content: string
  scheduledDate: Date
  status: 'draft' | 'scheduled' | 'published'
  webflowCollectionId?: string
  metaDescription?: string
  keywords?: string[]
}

export interface CalendarState {
  scheduledContent: Record<string, ScheduledArticle[]>
  selectedDate: Date | null
  viewMode: 'month' | 'week'
  currentMonth: Date
}

type CalendarAction =
  | { type: 'SET_SELECTED_DATE'; payload: Date | null }
  | { type: 'SET_VIEW_MODE'; payload: 'month' | 'week' }
  | { type: 'SET_CURRENT_MONTH'; payload: Date }
  | { type: 'ADD_SCHEDULED_CONTENT'; payload: { date: string; article: ScheduledArticle } }
  | { type: 'UPDATE_SCHEDULED_CONTENT'; payload: { articleId: string; updates: Partial<ScheduledArticle> } }
  | { type: 'REMOVE_SCHEDULED_CONTENT'; payload: { articleId: string } }
  | { type: 'RESCHEDULE_CONTENT'; payload: { articleId: string; newDate: Date } }

const initialState: CalendarState = {
  scheduledContent: {},
  selectedDate: null,
  viewMode: 'month',
  currentMonth: new Date()
}

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload }
    
    case 'ADD_SCHEDULED_CONTENT': {
      const { date, article } = action.payload
      const existing = state.scheduledContent[date] || []
      return {
        ...state,
        scheduledContent: {
          ...state.scheduledContent,
          [date]: [...existing, article]
        }
      }
    }
    
    case 'UPDATE_SCHEDULED_CONTENT': {
      const { articleId, updates } = action.payload
      const newScheduledContent = { ...state.scheduledContent }
      
      for (const date in newScheduledContent) {
        const articles = newScheduledContent[date].map(article =>
          article.id === articleId ? { ...article, ...updates } : article
        )
        newScheduledContent[date] = articles
      }
      
      return { ...state, scheduledContent: newScheduledContent }
    }
    
    case 'REMOVE_SCHEDULED_CONTENT': {
      const { articleId } = action.payload
      const newScheduledContent = { ...state.scheduledContent }
      
      for (const date in newScheduledContent) {
        newScheduledContent[date] = newScheduledContent[date].filter(
          article => article.id !== articleId
        )
        if (newScheduledContent[date].length === 0) {
          delete newScheduledContent[date]
        }
      }
      
      return { ...state, scheduledContent: newScheduledContent }
    }
    
    case 'RESCHEDULE_CONTENT': {
      const { articleId, newDate } = action.payload
      const newDateStr = format(newDate, 'yyyy-MM-dd')
      let articleToMove: ScheduledArticle | null = null
      const newScheduledContent = { ...state.scheduledContent }
      
      // Find and remove the article from its current date
      for (const date in newScheduledContent) {
        const index = newScheduledContent[date].findIndex(article => article.id === articleId)
        if (index !== -1) {
          articleToMove = { ...newScheduledContent[date][index], scheduledDate: newDate }
          newScheduledContent[date].splice(index, 1)
          if (newScheduledContent[date].length === 0) {
            delete newScheduledContent[date]
          }
          break
        }
      }
      
      // Add the article to the new date
      if (articleToMove) {
        const existing = newScheduledContent[newDateStr] || []
        newScheduledContent[newDateStr] = [...existing, articleToMove]
      }
      
      return { ...state, scheduledContent: newScheduledContent }
    }
    
    default:
      return state
  }
}

const CalendarContext = createContext<{
  state: CalendarState
  dispatch: React.Dispatch<CalendarAction>
} | null>(null)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(calendarReducer, initialState)
  
  return (
    <CalendarContext.Provider value={{ state, dispatch }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }
  return context
}
