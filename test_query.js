
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zpkikvgmmbtekbcuqahf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwa2lrdmdtbWJ0ZWtiY3VxYWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMDAyOTgsImV4cCI6MjA4NTY3NjI5OH0.DNoapjLC7cSoaBZVH_cnee4VjQSI-oovvZrCSa5HlV4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    const today = "2026-02-06";
    console.log("Testing query for date:", today);

    console.log("---------------------------------------------------");
    console.log("Attempt 6: status.not.eq.Yes");
    try {
        const { data, error, count } = await supabase
            .from('checklist')
            .select('*', { count: 'exact', head: true })
            .or('status.is.null,status.not.eq.Yes')
            .gte('task_start_date', `${today}T00:00:00`)
            .lte('task_start_date', `${today}T23:59:59`);

        if (error) {
            console.error("Attempt 6 FAILED:", error);
        } else {
            console.log("Attempt 6 SUCCESS! Count:", count);
        }
    } catch (e) {
        console.error("Attempt 6 Exception:", e);
    }

    console.log("---------------------------------------------------");
    console.log("Attempt 7: status.not.ilike.Yes");
    try {
        const { data, error, count } = await supabase
            .from('checklist')
            .select('*', { count: 'exact', head: true })
            .or('status.is.null,status.not.ilike.Yes')
            .gte('task_start_date', `${today}T00:00:00`)
            .lte('task_start_date', `${today}T23:59:59`);

        if (error) {
            console.error("Attempt 7 FAILED:", error);
        } else {
            console.log("Attempt 7 SUCCESS! Count:", count);
        }
    } catch (e) {
        console.error("Attempt 7 Exception:", e);
    }

    console.log("---------------------------------------------------");
    console.log("Attempt 8: status.neq.Yes (quoted inside wrapper?)");
    try {
        // Try creating the filter string carefully
        const { data, error, count } = await supabase
            .from('checklist')
            .select('*', { count: 'exact', head: true })
            .or('status.is.null,status.neq.Yes')
            .gte('task_start_date', `${today}T00:00:00`)
            .lte('task_start_date', `${today}T23:59:59`);

        if (error) {
            console.error("Attempt 8 FAILED (Repro):", error);
        } else {
            // If this works randomly..
            console.log("Attempt 8 SUCCESS! Count:", count);
        }
    } catch (e) {
        console.error("Attempt 8 Exception:", e);
    }
}

testQuery();
