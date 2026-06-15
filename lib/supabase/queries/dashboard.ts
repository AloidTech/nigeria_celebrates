import { SupabaseClient } from '@supabase/supabase-js';

// --- DATA TYPES ---
export type DashboardStats = {
    pending: number;
    approved: number;
    total: number;
};

export type BarChartData = {
    date: string;
    submissions: number;
    approved: number;
    pending: number;
};

export type PieChartData = {
    name: string;
    value: number;
    fill: string;
};

export type DashboardData = {
    stats: DashboardStats;
    barData: BarChartData[];
    pieData: PieChartData[];
    recentPending: any[];
};

// --- COLOR MAP FOR PIE CHART ---
const CATEGORY_COLORS: Record<string, string> = {
    'Music / Songs': '#8B5CF6',       // Purple
    'Football Freestyle': '#3B82F6',  // Blue
    'Basketball Freestyle': '#F97316',// Orange
    'Comedy Skits': '#EAB308',        // Yellow
    'Artwork (Handmade Only)': '#EC4899', // Pink
    'Fashion Showcase': '#14B8A6',    // Teal
    'My Nigeria Story': '#10B981',    // Green
    'Photography': '#6366F1',         // Indigo
    'Tech Innovation': '#06B6D4',     // Cyan
    'Logo Design': '#F43F5E',         // Rose
    'General': '#94A3B8',             // Slate
};

// --- DATA FETCHING & TRANSFORMING ---
export async function fetchDashboardData(supabase: SupabaseClient): Promise<DashboardData> {
    
    // 1. Fetch all submissions (we need all of them to build charts properly)
    const { data: allSubmissions, error } = await supabase
        .from('submissions')
        .select('id, title, category, created_at, is_approved, media_url')
        .order('created_at', { ascending: false });

    if (error || !allSubmissions) {
        console.error("Failed to fetch dashboard data:", error);
        return {
            stats: { pending: 0, approved: 0, total: 0 },
            barData: [],
            pieData: [],
            recentPending: []
        };
    }

    // 2. Compute Stats
    let pendingCount = 0;
    let approvedCount = 0;
    
    // 3. Prepare structures for Charts
    const categoryCounts: Record<string, number> = {};
    const dateCounts: Record<string, { submissions: number, approved: number, pending: number }> = {};
    
    // Create a scaffold for the last 7 days so days with 0 submissions still show up
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        // Format as "5 Jul"
        const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        dateCounts[dateStr] = { submissions: 0, approved: 0, pending: 0 };
    }

    // 4. Process all submissions
    const recentPending: any[] = [];

    allSubmissions.forEach(sub => {
        // Stats
        if (sub.is_approved) {
            approvedCount++;
        } else {
            pendingCount++;
            if (recentPending.length < 5) {
                recentPending.push(sub);
            }
        }

        // Pie Chart (Category Distribution)
        const cat = sub.category || 'General';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

        // Bar Chart (Submissions by Date)
        const subDate = new Date(sub.created_at);
        const dateStr = subDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        
        // Only increment if it's within our 7-day window
        if (dateCounts[dateStr]) {
            dateCounts[dateStr].submissions++;
            if (sub.is_approved) {
                dateCounts[dateStr].approved++;
            } else {
                dateCounts[dateStr].pending++;
            }
        }
    });

    // 5. Finalize Chart Data Arrays
    const barData = Object.keys(dateCounts).map(date => ({
        date,
        ...dateCounts[date]
    }));

    const pieData = Object.keys(categoryCounts).map(cat => ({
        name: cat,
        value: categoryCounts[cat],
        fill: CATEGORY_COLORS[cat] || CATEGORY_COLORS['General']
    })).sort((a, b) => b.value - a.value); // Sort biggest slices first

    return {
        stats: {
            pending: pendingCount,
            approved: approvedCount,
            total: allSubmissions.length
        },
        barData,
        pieData,
        recentPending
    };
}
