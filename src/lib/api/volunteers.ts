import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type Volunteer = Database['public']['Tables']['volunteers']['Row'];
type VolunteerInsert = Database['public']['Tables']['volunteers']['Insert'];
type VolunteerUpdate = Database['public']['Tables']['volunteers']['Update'];

export async function createVolunteer(data: VolunteerInsert): Promise<Volunteer | null> {
    const { data: volunteer, error } = await supabase
        .from('volunteers')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating volunteer:', error);
        return null;
    }

    return volunteer;
}

export async function getVolunteerById(id: string): Promise<Volunteer | null> {
    const { data: volunteer, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching volunteer:', error);
        return null;
    }

    return volunteer;
}

export async function updateVolunteer(id: string, updates: VolunteerUpdate): Promise<Volunteer | null> {
    const { data: volunteer, error } = await supabase
        .from('volunteers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating volunteer:', error);
        return null;
    }

    return volunteer;
}

export async function updateAvailability(
    id: string,
    status: 'available' | 'busy' | 'offline'
): Promise<boolean> {
    const { error } = await supabase
        .from('volunteers')
        .update({ availability_status: status })
        .eq('id', id);

    if (error) {
        console.error('Error updating availability:', error);
        return false;
    }

    return true;
}

export async function getVerifiedVolunteers(): Promise<Volunteer[]> {
    const { data: volunteers, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('verification_status', 'verified');

    if (error) {
        console.error('Error fetching verified volunteers:', error);
        return [];
    }

    return volunteers || [];
}
