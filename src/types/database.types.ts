export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'agent' | 'customer'
export type TicketStatus = 'open' | 'pending' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password_hash: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          coverage_hours: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          coverage_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          coverage_hours?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      employees_teams: {
        Row: {
          employee_id: string
          team_id: string
          created_at: string
        }
        Insert: {
          employee_id: string
          team_id: string
          created_at?: string
        }
        Update: {
          employee_id?: string
          team_id?: string
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          subject: string
          description: string
          status: TicketStatus
          priority: TicketPriority
          customer_id: string | null
          assigned_employee_id: string | null
          assigned_team_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          subject: string
          description: string
          status?: TicketStatus
          priority?: TicketPriority
          customer_id?: string | null
          assigned_employee_id?: string | null
          assigned_team_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          subject?: string
          description?: string
          status?: TicketStatus
          priority?: TicketPriority
          customer_id?: string | null
          assigned_employee_id?: string | null
          assigned_team_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          closed_at?: string | null
        }
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          sender_type: UserRole
          content: string
          attachments: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_id: string
          sender_type: UserRole
          content: string
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_id?: string
          sender_type?: UserRole
          content?: string
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ticket_notes: {
        Row: {
          id: string
          ticket_id: string
          author_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      ticket_tags: {
        Row: {
          ticket_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          ticket_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          ticket_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          action: string
          changed_data: Json
          actor_id: string
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          action: string
          changed_data: Json
          actor_id: string
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          action?: string
          changed_data?: Json
          actor_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      ticket_status: TicketStatus
      ticket_priority: TicketPriority
    }
  }
} 