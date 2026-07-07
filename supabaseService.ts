import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Memory {
  id?: number;
  user_input: string;
  ai_response: string;
  created_at?: string;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private isConfigured = false;
  // Fallback in-memory storage on the server if Supabase is not connected
  private memoryFallback: Memory[] = [];

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY') {
      try {
        this.client = createClient(supabaseUrl, supabaseAnonKey);
        this.isConfigured = true;
        console.log('🤖 Supabase client successfully initialized for CYBER AI.');
      } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
      }
    } else {
      console.log('⚠️ Supabase credentials missing or default. CYBER AI running in local memory mode.');
    }
  }

  getIsConfigured(): boolean {
    return this.isConfigured;
  }

  async saveMemory(userInput: string, aiResponse: string): Promise<Memory> {
    const newMemory: Memory = {
      user_input: userInput,
      ai_response: aiResponse,
      created_at: new Date().toISOString()
    };

    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('memory')
          .insert([
            { user_input: userInput, ai_response: aiResponse }
          ])
          .select();

        if (error) {
          console.error('❌ Supabase insert error:', error.message);
          throw error;
        }

        if (data && data[0]) {
          return data[0] as Memory;
        }
      } catch (err) {
        console.warn('⚠️ Supabase save failed, saving to local server memory fallback.');
      }
    }

    // Fallback: save to server-side array
    const memoryWithId = { ...newMemory, id: Date.now() };
    this.memoryFallback.push(memoryWithId);
    // Keep fallback reasonable size (last 100 memories)
    if (this.memoryFallback.length > 100) {
      this.memoryFallback.shift();
    }
    return memoryWithId;
  }

  async getMemories(limit = 20): Promise<Memory[]> {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('memory')
          .select('*')
          .order('id', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('❌ Supabase fetch error:', error.message);
          throw error;
        }

        return (data || []) as Memory[];
      } catch (err) {
        console.warn('⚠️ Supabase fetch failed, returning local server memory fallback.');
      }
    }

    // Fallback: return server-side memories in descending order of creation (most recent first)
    return [...this.memoryFallback].reverse().slice(0, limit);
  }

  async clearMemories(): Promise<boolean> {
    if (this.isConfigured && this.client) {
      try {
        const { error } = await this.client
          .from('memory')
          .delete()
          .not('id', 'is', null); // Delete all rows

        if (error) {
          console.error('❌ Supabase delete error:', error.message);
          throw error;
        }

        return true;
      } catch (err) {
        console.warn('⚠️ Supabase clear failed, clearing local server memory.');
      }
    }

    this.memoryFallback = [];
    return true;
  }
}

export const supabaseService = new SupabaseService();
