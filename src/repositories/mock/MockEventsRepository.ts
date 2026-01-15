import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventsRepository } from '../../services/repositories/interfaces';
import { Event } from '../../types';

const STORAGE_KEY = 'mock_events';

export class MockEventsRepository implements EventsRepository {
  private async getEvents(): Promise<Event[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  }
  
  private async saveEvents(events: Event[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
  
  async getAllEvents(): Promise<Event[]> {
    return this.getEvents();
  }
  
  async getEventById(eventId: string): Promise<Event | null> {
    const events = await this.getEvents();
    return events.find(e => e.id === eventId) || null;
  }
  
  async createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const events = await this.getEvents();
    const newEvent: Event = {
      ...event,
      id: 'event-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    await this.saveEvents(events);
    return newEvent;
  }
}
