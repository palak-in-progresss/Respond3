import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type Assignment = Database['public']['Tables']['assignments']['Row'];
type AssignmentInsert = Database['public']['Tables']['assignments']['Insert'];
type AssignmentUpdate = Database['public']['Tables']['assignments']['Update'];

export async function createAssignment(data: AssignmentInsert): Promise<Assignment | null> {
    const { data: assignment, error } = await supabase
        .from('assignments')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating assignment:', error);
        return null;
    }

    // Update request volunteers_assigned count
    const { data: request } = await supabase
        .from('requests')
        .select('volunteers_assigned')
        .eq('id', data.request_id)
        .single();

    if (request) {
        await supabase
            .from('requests')
            .update({ volunteers_assigned: (request.volunteers_assigned || 0) + 1 })
            .eq('id', data.request_id);
    }

    return assignment;
}

export async function getAssignmentsByVolunteer(volunteerId: string): Promise<Assignment[]> {
    const { data: assignments, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching volunteer assignments:', error);
        return [];
    }

    return assignments || [];
}

export async function getAssignmentsByRequest(requestId: string): Promise<Assignment[]> {
    const { data: assignments, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching request assignments:', error);
        return [];
    }

    return assignments || [];
}

export async function updateAssignmentStatus(
    id: string,
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
): Promise<boolean> {
    const updates: AssignmentUpdate = { status };

    if (status === 'accepted') {
        updates.accepted_at = new Date().toISOString();
    } else if (status === 'in_progress') {
        updates.started_at = new Date().toISOString();
    } else if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating assignment status:', error);
        return false;
    }

    return true;
}

export async function getActiveAssignments(): Promise<Assignment[]> {
    const { data: assignments, error } = await supabase
        .from('assignments')
        .select('*')
        .in('status', ['accepted', 'in_progress'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching active assignments:', error);
        return [];
    }

    return assignments || [];
}
