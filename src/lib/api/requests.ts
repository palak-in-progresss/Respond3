import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type Request = Database['public']['Tables']['requests']['Row'];
type RequestInsert = Database['public']['Tables']['requests']['Insert'];
type RequestUpdate = Database['public']['Tables']['requests']['Update'];

export async function createRequest(data: RequestInsert): Promise<Request | null> {
    const { data: request, error } = await supabase
        .from('requests')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('Error creating request:', error);
        return null;
    }

    return request;
}

export async function getRequests(filters?: {
    status?: string;
    urgency?: string;
    organizationId?: string;
}): Promise<Request[]> {
    let query = supabase.from('requests').select('*');

    if (filters?.status) {
        query = query.eq('status', filters.status);
    }
    if (filters?.urgency) {
        query = query.eq('urgency', filters.urgency);
    }
    if (filters?.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
    }

    const { data: requests, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching requests:', error);
        return [];
    }

    return requests || [];
}

export async function getRequestById(id: string): Promise<Request | null> {
    const { data: request, error } = await supabase
        .from('requests')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching request:', error);
        return null;
    }

    return request;
}

export async function updateRequestStatus(
    id: string,
    status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled'
): Promise<boolean> {
    const { error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating request status:', error);
        return false;
    }

    return true;
}

export async function updateRequest(id: string, updates: RequestUpdate): Promise<Request | null> {
    const { data: request, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating request:', error);
        return null;
    }

    return request;
}

export async function getOpenRequests(): Promise<Request[]> {
    return getRequests({ status: 'open' });
}
