import { EventsRepository } from '../../services/repositories/interfaces';
import { Event } from '../../types';
import { supabase } from '../../services/supabase';

export class SupabaseEventsRepository implements EventsRepository {
  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }

    return (data || []).map(this.mapToEvent);
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }

    return data ? this.mapToEvent(data) : null;
  }

  async createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    // Get current authenticated user from Supabase session
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    // Use auth.uid() instead of event.createdBy to ensure RLS policy passes
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: event.title,
        description: event.description || null,
        created_by: authUser.id, // Use auth.uid() from Supabase session
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || 'Failed to create event';
      throw new Error(`Failed to create event: ${errorMessage}`);
    }

    return this.mapToEvent(data);
  }

  private mapToEvent(data: any): Event {
    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      createdAt: data.created_at,
      createdBy: data.created_by,
    };
  }
}
