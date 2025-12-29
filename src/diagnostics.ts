import { supabase } from './lib/supabase';

/**
 * Diagnostic script to check Supabase connection and data
 * Run this to quickly identify issues
 */
export async function runDiagnostics() {
    console.log('🔍 Running RESPOND Diagnostics...\n');

    // 1. Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ FAILED: Missing Supabase environment variables');
        console.log('   Fix: Check .env.local file and restart dev server');
        return;
    }
    console.log('✅ PASSED: Environment variables found');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

    // 2. Check database connection
    console.log('\n2️⃣ Checking database connection...');
    try {
        const { data, error } = await supabase.from('volunteers').select('count');
        if (error) {
            console.error('❌ FAILED: Cannot connect to database');
            console.error('   Error:', error.message);
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                console.log('   Fix: Run the schema SQL in Supabase SQL Editor');
            } else if (error.message.includes('row-level security')) {
                console.log('   Fix: Check RLS policies in Supabase');
            }
            return;
        }
        console.log('✅ PASSED: Database connection successful');
    } catch (err) {
        console.error('❌ FAILED: Connection error');
        console.error('   Error:', err);
        return;
    }

    // 3. Check if tables exist
    console.log('\n3️⃣ Checking database tables...');
    const tables = ['volunteers', 'requests', 'assignments'];
    let allTablesExist = true;

    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('count');
            if (error) {
                console.error(`❌ FAILED: Table '${table}' does not exist or has issues`);
                console.error('   Error:', error.message);
                allTablesExist = false;
            } else {
                console.log(`✅ PASSED: Table '${table}' exists`);
            }
        } catch (err) {
            console.error(`❌ FAILED: Error checking table '${table}'`);
            console.error('   Error:', err);
            allTablesExist = false;
        }
    }

    if (!allTablesExist) {
        console.log('\n   Fix: Run supabase-schema.sql in Supabase SQL Editor');
        return;
    }

    // 4. Check data counts
    console.log('\n4️⃣ Checking data in tables...');

    const { data: volunteers, error: volError } = await supabase
        .from('volunteers')
        .select('*');

    if (volError) {
        console.error('❌ FAILED: Cannot read volunteers');
        console.error('   Error:', volError.message);
    } else {
        console.log(`✅ Volunteers: ${volunteers?.length || 0} records`);
        if (volunteers && volunteers.length > 0) {
            console.log('   Sample:', volunteers[0].full_name);
        } else {
            console.log('   ⚠️  WARNING: No volunteers found. Run seed script.');
        }
    }

    const { data: requests, error: reqError } = await supabase
        .from('requests')
        .select('*');

    if (reqError) {
        console.error('❌ FAILED: Cannot read requests');
        console.error('   Error:', reqError.message);
    } else {
        console.log(`✅ Requests: ${requests?.length || 0} records`);
        if (requests && requests.length > 0) {
            console.log('   Sample:', requests[0].title);
        } else {
            console.log('   ⚠️  WARNING: No requests found. Run seed script.');
        }
    }

    const { data: assignments, error: assignError } = await supabase
        .from('assignments')
        .select('*');

    if (assignError) {
        console.error('❌ FAILED: Cannot read assignments');
        console.error('   Error:', assignError.message);
    } else {
        console.log(`✅ Assignments: ${assignments?.length || 0} records`);
    }

    // 5. Test write permissions
    console.log('\n5️⃣ Testing write permissions...');
    const testVolunteer = {
        full_name: 'Test Diagnostic User',
        email: `test-${Date.now()}@example.com`,
        phone: '+91 99999 99999',
        location: 'Test City, Test State',
        latitude: 0,
        longitude: 0,
        skills: ['Testing'],
        verification_status: 'pending' as const,
        availability_status: 'available' as const,
    };

    const { data: createdVol, error: createError } = await supabase
        .from('volunteers')
        .insert(testVolunteer)
        .select()
        .single();

    if (createError) {
        console.error('❌ FAILED: Cannot create volunteer');
        console.error('   Error:', createError.message);
        if (createError.message.includes('row-level security')) {
            console.log('   Fix: Check RLS policies - run the policy SQL in Supabase');
        }
    } else {
        console.log('✅ PASSED: Can create volunteers');

        // Clean up test data
        await supabase.from('volunteers').delete().eq('id', createdVol.id);
        console.log('   (Test record cleaned up)');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(50));
    console.log('Environment: ✅');
    console.log('Connection: ✅');
    console.log('Tables: ' + (allTablesExist ? '✅' : '❌'));
    console.log('Data: ' + ((volunteers?.length || 0) > 0 ? '✅' : '⚠️'));
    console.log('Permissions: ' + (createError ? '❌' : '✅'));
    console.log('='.repeat(50));

    if (!createError && allTablesExist && (volunteers?.length || 0) > 0) {
        console.log('\n🎉 ALL SYSTEMS GO! Your app should be working!');
    } else {
        console.log('\n⚠️  ISSUES FOUND - Check the errors above and follow the fixes');
    }
}

// Uncomment to run diagnostics
// runDiagnostics();
