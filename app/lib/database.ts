import { createClient } from "./supabase/server";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
  token_count?: number;
  model?: string;
}

export class DatabaseService {
  // Get Supabase client instance
  private static async getSupabase() {
    return await createClient();
  }

  // Conversation methods
  static async createConversation(
    userId: string,
    title?: string
  ): Promise<Conversation> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title: title || "New Conversation",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getConversations(userId: string): Promise<Conversation[]> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async getConversation(
    conversationId: string,
    userId: string
  ): Promise<Conversation | null> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(error.message);
    }
    return data;
  }

  static async updateConversation(
    conversationId: string,
    userId: string,
    updates: Partial<Pick<Conversation, "title" | "is_archived">>
  ): Promise<Conversation> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("conversations")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", conversationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  }

  // Message methods
  static async addMessage(
    message: Omit<Message, "id" | "created_at">
  ): Promise<Message> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("messages")
      .insert(message)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  static async deleteMessage(messageId: string): Promise<void> {
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) throw new Error(error.message);
  }

  // User methods (these will now use Supabase Auth user data)
  static async getUserProfile(userId: string) {
    const supabase = await this.getSupabase();
    
    // First get the auth user
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser.user) {
      throw new Error('User not authenticated');
    }

    // If you have a separate profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(error.message);
    }
    return data;
  }

  static async updateUserProfile(
    userId: string,
    updates: { name?: string; avatar_url?: string }
  ) {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Helper method to verify user ownership
  static async verifyUserOwnership(userId: string): Promise<boolean> {
    const supabase = await this.getSupabase();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }
    
    return user.id === userId;
  }
}