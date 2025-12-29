import { supabase } from './lib/supabase';

// Seed data for demo
export async function seedDatabase() {
    console.log('🌱 Seeding database...');

    // 1. Create sample volunteers
    const volunteers = [
        {
            full_name: 'Dr. Anjali Sharma',
            email: 'anjali.sharma@example.com',
            phone: '+91 98765 43210',
            location: 'Mumbai, Maharashtra',
            latitude: 19.0760,
            longitude: 72.8777,
            skills: ['Medical', 'Doctor', 'Emergency Care'],
            verification_status: 'verified' as const,
            availability_status: 'available' as const,
            rating: 4.9,
            tasks_completed: 24,
        },
        {
            full_name: 'Rajesh Kumar',
            email: 'rajesh.kumar@example.com',
            phone: '+91 98765 43211',
            location: 'Kochi, Kerala',
            latitude: 9.9312,
            longitude: 76.2673,
            skills: ['Driving', 'Logistics', 'Heavy Vehicle'],
            verification_status: 'verified' as const,
            availability_status: 'available' as const,
            rating: 4.7,
            tasks_completed: 18,
        },
        {
            full_name: 'Priya Menon',
            email: 'priya.menon@example.com',
            phone: '+91 98765 43212',
            location: 'Delhi, NCR',
            latitude: 28.7041,
            longitude: 77.1025,
            skills: ['Cooking', 'Food Safety', 'Chef'],
            verification_status: 'verified' as const,
            availability_status: 'available' as const,
            rating: 5.0,
            tasks_completed: 32,
        },
        {
            full_name: 'Amit Singh',
            email: 'amit.singh@example.com',
            phone: '+91 98765 43213',
            location: 'Bangalore, Karnataka',
            latitude: 12.9716,
            longitude: 77.5946,
            skills: ['First Aid', 'Nursing', 'Healthcare'],
            verification_status: 'verified' as const,
            availability_status: 'available' as const,
            rating: 4.8,
            tasks_completed: 21,
        },
        {
            full_name: 'Sneha Patel',
            email: 'sneha.patel@example.com',
            phone: '+91 98765 43214',
            location: 'Pune, Maharashtra',
            latitude: 18.5204,
            longitude: 73.8567,
            skills: ['Medical', 'Nursing', 'Emergency Care'],
            verification_status: 'verified' as const,
            availability_status: 'busy' as const,
            rating: 4.9,
            tasks_completed: 28,
        },
    ];

    const { data: createdVolunteers, error: volError } = await supabase
        .from('volunteers')
        .insert(volunteers)
        .select();

    if (volError) {
        console.error('Error creating volunteers:', volError);
        return;
    }

    console.log('✅ Created', createdVolunteers?.length, 'volunteers');

    // 2. Create sample requests
    const requests = [
        {
            organization_id: 'org_kerala_sdm',
            organization_name: 'Kerala State Disaster Management',
            title: 'Flood Relief - Doctors Needed',
            description: 'Urgent need for medical professionals to assist in flood-affected areas. Emergency medical care required.',
            location: 'Kochi, Kerala',
            latitude: 9.9312,
            longitude: 76.2673,
            skills_needed: ['Medical', 'Doctor', 'Emergency Care'],
            urgency: 'high' as const,
            volunteers_needed: 5,
            volunteers_assigned: 0,
            status: 'open' as const,
        },
        {
            organization_id: 'org_red_cross',
            organization_name: 'Red Cross India',
            title: 'Medical Camp - Nurses Required',
            description: 'Setting up medical camp for vaccination drive. Need experienced nurses.',
            location: 'Mumbai, Maharashtra',
            latitude: 19.0760,
            longitude: 72.8777,
            skills_needed: ['Nursing', 'First Aid', 'Healthcare'],
            urgency: 'medium' as const,
            volunteers_needed: 10,
            volunteers_assigned: 0,
            status: 'open' as const,
        },
        {
            organization_id: 'org_goonj',
            organization_name: 'Goonj NGO',
            title: 'Food Distribution - Drivers Needed',
            description: 'Need drivers with heavy vehicles for food distribution in remote areas.',
            location: 'Delhi, NCR',
            latitude: 28.7041,
            longitude: 77.1025,
            skills_needed: ['Driving', 'Logistics', 'Distribution'],
            urgency: 'low' as const,
            volunteers_needed: 15,
            volunteers_assigned: 0,
            status: 'open' as const,
        },
    ];

    const { data: createdRequests, error: reqError } = await supabase
        .from('requests')
        .insert(requests)
        .select();

    if (reqError) {
        console.error('Error creating requests:', reqError);
        return;
    }

    console.log('✅ Created', createdRequests?.length, 'requests');

    console.log('🎉 Database seeded successfully!');
    return { volunteers: createdVolunteers, requests: createdRequests };
}

// Run this function to seed the database
// seedDatabase(); // COMMENTED OUT - Uncomment to seed, then comment again
