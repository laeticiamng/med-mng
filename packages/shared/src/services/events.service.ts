import { supabase } from '@/lib/supabase'

export interface EventCategory {
  id: string
  name: string
  description?: string
  color: string
  iconName?: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  categoryId?: string
  eventType: 'event' | 'meeting' | 'task' | 'reminder'
  location?: string
  startDate: string
  endDate: string
  allDay: boolean
  organizerId: string
  teamId?: string
  isPrivate: boolean
  maxAttendees?: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  eventUrl?: string
  imageUrl?: string
  coverUrl?: string
  createdAt: string
  updatedAt: string
}

export interface EventAttendee {
  id: string
  eventId: string
  userId: string
  status: 'pending' | 'accepted' | 'declined' | 'maybe'
  role: 'organizer' | 'speaker' | 'attendee' | 'volunteer'
  rsvpDate?: string
  notes?: string
  createdAt: string
}

export interface EventReminder {
  id: string
  eventId: string
  userId: string
  reminderType: 'notification' | 'email' | 'sms'
  reminderTime: number // minutes before event
  isSent: boolean
  sentAt?: string
  createdAt: string
}

export interface EventComment {
  id: string
  eventId: string
  authorId: string
  content: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

// Event Categories
export async function getEventCategories(): Promise<EventCategory[]> {
  try {
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .order('name')

    if (error) throw error
    return (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      color: cat.color,
      iconName: cat.icon_name,
    }))
  } catch (error) {
    console.error('Get event categories error:', error)
    throw error
  }
}

// Event CRUD Operations
export async function createEvent(eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        category_id: eventData.categoryId,
        event_type: eventData.eventType || 'event',
        location: eventData.location,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        all_day: eventData.allDay || false,
        organizer_id: eventData.organizerId,
        team_id: eventData.teamId,
        is_private: eventData.isPrivate || false,
        max_attendees: eventData.maxAttendees,
        status: eventData.status || 'scheduled',
        event_url: eventData.eventUrl,
        image_url: eventData.imageUrl,
        cover_url: eventData.coverUrl,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      eventType: data.event_type,
      location: data.location,
      startDate: data.start_date,
      endDate: data.end_date,
      allDay: data.all_day,
      organizerId: data.organizer_id,
      teamId: data.team_id,
      isPrivate: data.is_private,
      maxAttendees: data.max_attendees,
      status: data.status,
      eventUrl: data.event_url,
      imageUrl: data.image_url,
      coverUrl: data.cover_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Create event error:', error)
    throw error
  }
}

export async function getEvent(eventId: string): Promise<CalendarEvent> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .is('deleted_at', null)
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      eventType: data.event_type,
      location: data.location,
      startDate: data.start_date,
      endDate: data.end_date,
      allDay: data.all_day,
      organizerId: data.organizer_id,
      teamId: data.team_id,
      isPrivate: data.is_private,
      maxAttendees: data.max_attendees,
      status: data.status,
      eventUrl: data.event_url,
      imageUrl: data.image_url,
      coverUrl: data.cover_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Get event error:', error)
    throw error
  }
}

export async function getUserEvents(userId: string, limit: number = 50, offset: number = 0): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`organizer_id.eq.${userId},id.in.(SELECT event_id FROM event_attendees WHERE user_id='${userId}')`)
      .is('deleted_at', null)
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return (data || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      categoryId: event.category_id,
      eventType: event.event_type,
      location: event.location,
      startDate: event.start_date,
      endDate: event.end_date,
      allDay: event.all_day,
      organizerId: event.organizer_id,
      teamId: event.team_id,
      isPrivate: event.is_private,
      maxAttendees: event.max_attendees,
      status: event.status,
      eventUrl: event.event_url,
      imageUrl: event.image_url,
      coverUrl: event.cover_url,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }))
  } catch (error) {
    console.error('Get user events error:', error)
    throw error
  }
}

export async function getUpcomingEvents(userId: string, limit: number = 10): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_upcoming_events', {
        p_user_id: userId,
        p_limit: limit,
      })

    if (error) throw error

    return (data || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: '',
      eventType: event.event_type,
      location: event.location,
      startDate: event.start_date,
      endDate: event.start_date,
      allDay: false,
      organizerId: event.organizer_id,
      isPrivate: false,
      status: 'scheduled',
      createdAt: event.start_date,
      updatedAt: event.start_date,
    }))
  } catch (error) {
    console.error('Get upcoming events error:', error)
    throw error
  }
}

export async function getCalendarEvents(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_calendar_events', {
        p_user_id: userId,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0],
      })

    if (error) throw error

    return (data || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      categoryId: event.category_id,
      eventType: event.event_type,
      location: event.location,
      startDate: event.start_date,
      endDate: event.end_date,
      allDay: event.all_day,
      organizerId: event.organizer_id,
      isPrivate: false,
      status: event.status,
      createdAt: event.start_date,
      updatedAt: event.start_date,
    }))
  } catch (error) {
    console.error('Get calendar events error:', error)
    throw error
  }
}

export async function updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        title: updates.title,
        description: updates.description,
        category_id: updates.categoryId,
        event_type: updates.eventType,
        location: updates.location,
        start_date: updates.startDate,
        end_date: updates.endDate,
        all_day: updates.allDay,
        team_id: updates.teamId,
        is_private: updates.isPrivate,
        max_attendees: updates.maxAttendees,
        status: updates.status,
        event_url: updates.eventUrl,
        image_url: updates.imageUrl,
        cover_url: updates.coverUrl,
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      categoryId: data.category_id,
      eventType: data.event_type,
      location: data.location,
      startDate: data.start_date,
      endDate: data.end_date,
      allDay: data.all_day,
      organizerId: data.organizer_id,
      teamId: data.team_id,
      isPrivate: data.is_private,
      maxAttendees: data.max_attendees,
      status: data.status,
      eventUrl: data.event_url,
      imageUrl: data.image_url,
      coverUrl: data.cover_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Update event error:', error)
    throw error
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', eventId)

    if (error) throw error
  } catch (error) {
    console.error('Delete event error:', error)
    throw error
  }
}

// Event Attendees
export async function addEventAttendee(
  eventId: string,
  userId: string,
  status: string = 'pending',
  role: string = 'attendee'
): Promise<EventAttendee> {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: userId,
        status,
        role,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      status: data.status,
      role: data.role,
      rsvpDate: data.rsvp_date,
      notes: data.notes,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('Add event attendee error:', error)
    throw error
  }
}

export async function getEventAttendees(eventId: string): Promise<EventAttendee[]> {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((attendee: any) => ({
      id: attendee.id,
      eventId: attendee.event_id,
      userId: attendee.user_id,
      status: attendee.status,
      role: attendee.role,
      rsvpDate: attendee.rsvp_date,
      notes: attendee.notes,
      createdAt: attendee.created_at,
    }))
  } catch (error) {
    console.error('Get event attendees error:', error)
    throw error
  }
}

export async function updateAttendeeStatus(
  eventId: string,
  userId: string,
  status: string
): Promise<EventAttendee> {
  try {
    const { data, error } = await supabase
      .from('event_attendees')
      .update({
        status,
        rsvp_date: new Date().toISOString(),
      })
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      status: data.status,
      role: data.role,
      rsvpDate: data.rsvp_date,
      notes: data.notes,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('Update attendee status error:', error)
    throw error
  }
}

export async function removeEventAttendee(eventId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Remove event attendee error:', error)
    throw error
  }
}

// Event Reminders
export async function createEventReminder(
  eventId: string,
  userId: string,
  reminderType: string = 'notification',
  reminderTime: number = 15
): Promise<EventReminder> {
  try {
    const { data, error } = await supabase
      .from('event_reminders')
      .insert({
        event_id: eventId,
        user_id: userId,
        reminder_type: reminderType,
        reminder_time: reminderTime,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      reminderType: data.reminder_type,
      reminderTime: data.reminder_time,
      isSent: data.is_sent,
      sentAt: data.sent_at,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('Create event reminder error:', error)
    throw error
  }
}

export async function getEventReminders(eventId: string): Promise<EventReminder[]> {
  try {
    const { data, error } = await supabase
      .from('event_reminders')
      .select('*')
      .eq('event_id', eventId)

    if (error) throw error

    return (data || []).map((reminder: any) => ({
      id: reminder.id,
      eventId: reminder.event_id,
      userId: reminder.user_id,
      reminderType: reminder.reminder_type,
      reminderTime: reminder.reminder_time,
      isSent: reminder.is_sent,
      sentAt: reminder.sent_at,
      createdAt: reminder.created_at,
    }))
  } catch (error) {
    console.error('Get event reminders error:', error)
    throw error
  }
}

// Event Comments
export async function addEventComment(
  eventId: string,
  authorId: string,
  content: string
): Promise<EventComment> {
  try {
    const { data, error } = await supabase
      .from('event_comments')
      .insert({
        event_id: eventId,
        author_id: authorId,
        content,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      eventId: data.event_id,
      authorId: data.author_id,
      content: data.content,
      isDeleted: data.is_deleted,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Add event comment error:', error)
    throw error
  }
}

export async function getEventComments(eventId: string): Promise<EventComment[]> {
  try {
    const { data, error } = await supabase
      .from('event_comments')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((comment: any) => ({
      id: comment.id,
      eventId: comment.event_id,
      authorId: comment.author_id,
      content: comment.content,
      isDeleted: comment.is_deleted,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    }))
  } catch (error) {
    console.error('Get event comments error:', error)
    throw error
  }
}

export async function deleteEventComment(commentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_comments')
      .update({ is_deleted: true })
      .eq('id', commentId)

    if (error) throw error
  } catch (error) {
    console.error('Delete event comment error:', error)
    throw error
  }
}

// Event Search
export async function searchEvents(
  query: string,
  limit: number = 50,
  offset: number = 0
): Promise<CalendarEvent[]> {
  try {
    const cleanQuery = query.trim()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,location.ilike.%${cleanQuery}%`)
      .is('deleted_at', null)
      .order('start_date', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return (data || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      categoryId: event.category_id,
      eventType: event.event_type,
      location: event.location,
      startDate: event.start_date,
      endDate: event.end_date,
      allDay: event.all_day,
      organizerId: event.organizer_id,
      teamId: event.team_id,
      isPrivate: event.is_private,
      maxAttendees: event.max_attendees,
      status: event.status,
      eventUrl: event.event_url,
      imageUrl: event.image_url,
      coverUrl: event.cover_url,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    }))
  } catch (error) {
    console.error('Search events error:', error)
    throw error
  }
}
