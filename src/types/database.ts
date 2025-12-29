export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            volunteers: {
                Row: {
                    id: string
                    created_at: string
                    full_name: string
                    email: string
                    phone: string
                    location: string
                    latitude: number | null
                    longitude: number | null
                    skills: string[]
                    certifications: Json
                    verification_status: 'pending' | 'verified' | 'rejected'
                    availability_status: 'available' | 'busy' | 'offline'
                    availability_schedule: Json
                    rating: number
                    tasks_completed: number
                    profile_image_url: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    full_name: string
                    email: string
                    phone: string
                    location: string
                    latitude?: number | null
                    longitude?: number | null
                    skills: string[]
                    certifications?: Json
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    availability_status?: 'available' | 'busy' | 'offline'
                    availability_schedule?: Json
                    rating?: number
                    tasks_completed?: number
                    profile_image_url?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    full_name?: string
                    email?: string
                    phone?: string
                    location?: string
                    latitude?: number | null
                    longitude?: number | null
                    skills?: string[]
                    certifications?: Json
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    availability_status?: 'available' | 'busy' | 'offline'
                    availability_schedule?: Json
                    rating?: number
                    tasks_completed?: number
                    profile_image_url?: string | null
                }
            }
            requests: {
                Row: {
                    id: string
                    created_at: string
                    organization_id: string
                    organization_name: string
                    title: string
                    description: string
                    location: string
                    latitude: number | null
                    longitude: number | null
                    skills_needed: string[]
                    urgency: 'low' | 'medium' | 'high'
                    volunteers_needed: number
                    volunteers_assigned: number
                    status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled'
                    escalated: boolean
                    escalation_count: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    organization_id: string
                    organization_name: string
                    title: string
                    description: string
                    location: string
                    latitude?: number | null
                    longitude?: number | null
                    skills_needed: string[]
                    urgency?: 'low' | 'medium' | 'high'
                    volunteers_needed: number
                    volunteers_assigned?: number
                    status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled'
                    escalated?: boolean
                    escalation_count?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    organization_id?: string
                    organization_name?: string
                    title?: string
                    description?: string
                    location?: string
                    latitude?: number | null
                    longitude?: number | null
                    skills_needed?: string[]
                    urgency?: 'low' | 'medium' | 'high'
                    volunteers_needed?: number
                    volunteers_assigned?: number
                    status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled'
                    escalated?: boolean
                    escalation_count?: number
                }
            }
            assignments: {
                Row: {
                    id: string
                    created_at: string
                    request_id: string
                    volunteer_id: string
                    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
                    accepted_at: string | null
                    started_at: string | null
                    completed_at: string | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    request_id: string
                    volunteer_id: string
                    status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
                    accepted_at?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    request_id?: string
                    volunteer_id?: string
                    status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
                    accepted_at?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    notes?: string | null
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
            [_ in never]: never
        }
    }
}
