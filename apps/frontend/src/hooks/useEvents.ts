import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEventCategories,
  createEvent,
  getEvent,
  getUserEvents,
  getUpcomingEvents,
  getCalendarEvents,
  updateEvent,
  deleteEvent,
  addEventAttendee,
  getEventAttendees,
  updateAttendeeStatus,
  removeEventAttendee,
  createEventReminder,
  getEventReminders,
  addEventComment,
  getEventComments,
  deleteEventComment,
  searchEvents,
  CalendarEvent,
  EventAttendee,
  EventReminder,
  EventComment,
  EventCategory,
} from '@shared/services/events.service'

// Event Categories
export function useFetchEventCategories() {
  return useQuery({
    queryKey: ['events', 'categories'],
    queryFn: () => getEventCategories(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Event Queries
export function useFetchEvent(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchUserEvents(userId: string, limit: number = 50) {
  return useQuery({
    queryKey: ['events', 'user', userId],
    queryFn: () => getUserEvents(userId, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFetchUpcomingEvents(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: ['events', 'upcoming', userId],
    queryFn: () => getUpcomingEvents(userId, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useFetchCalendarEvents(userId: string, startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ['events', 'calendar', userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: () => getCalendarEvents(userId, startDate, endDate),
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  })
}

export function useSearchEvents(query: string, limit: number = 50) {
  return useQuery({
    queryKey: ['events', 'search', query],
    queryFn: () => searchEvents(query, limit),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

// Event Attendees
export function useFetchEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'attendees'],
    queryFn: () => getEventAttendees(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2,
  })
}

// Event Reminders
export function useFetchEventReminders(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'reminders'],
    queryFn: () => getEventReminders(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
  })
}

// Event Comments
export function useFetchEventComments(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'comments'],
    queryFn: () => getEventComments(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2,
  })
}

// Event Mutations
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventData: Partial<CalendarEvent>) => createEvent(eventData),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'upcoming'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, updates }: { eventId: string; updates: Partial<CalendarEvent> }) =>
      updateEvent(eventId, updates),
    onSuccess: (updatedEvent, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] })
      queryClient.invalidateQueries({ queryKey: ['events', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'calendar'] })
    },
  })
}

// Event Attendee Mutations
export function useAddEventAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      status,
      role,
    }: {
      eventId: string
      userId: string
      status?: string
      role?: string
    }) => addEventAttendee(eventId, userId, status, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'attendees'] })
    },
  })
}

export function useUpdateAttendeeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      status,
    }: {
      eventId: string
      userId: string
      status: string
    }) => updateAttendeeStatus(eventId, userId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'attendees'] })
      queryClient.invalidateQueries({ queryKey: ['events', 'user'] })
    },
  })
}

export function useRemoveEventAttendee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, userId }: { eventId: string; userId: string }) =>
      removeEventAttendee(eventId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'attendees'] })
    },
  })
}

// Event Reminder Mutations
export function useCreateEventReminder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      reminderType,
      reminderTime,
    }: {
      eventId: string
      userId: string
      reminderType?: string
      reminderTime?: number
    }) => createEventReminder(eventId, userId, reminderType, reminderTime),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'reminders'] })
    },
  })
}

// Event Comment Mutations
export function useAddEventComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      authorId,
      content,
    }: {
      eventId: string
      authorId: string
      content: string
    }) => addEventComment(eventId, authorId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'comments'] })
    },
  })
}

export function useDeleteEventComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => deleteEventComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
