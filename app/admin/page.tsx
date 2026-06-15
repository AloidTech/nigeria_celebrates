'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { fetchDashboardData, DashboardData } from '@/lib/supabase/queries/dashboard';
import { Check, Loader2, Folder, LayoutDashboard, Video, Image as ImageIcon, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const loadData = async () => {
        const result = await fetchDashboardData(supabase);
        setData(result);
        setLoading(false);
    };

    useEffect(() => {
        loadData();

        // 🟢 Live Realtime Updates
        const channel = supabase
            .channel('dashboard-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
                console.log("Realtime event received! Refreshing dashboard...");
                loadData(); // Re-fetch the live data silently
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleApprove = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setApprovingId(id);
        try {
            const { error } = await supabase
                .from('submissions')
                .update({ is_approved: true })
                .eq('id', id);

            if (error) throw error;
            // The realtime listener will automatically pick this up and refresh the data!
            // But we can eagerly update it locally for a snappier feel.
            if (data) {
                 setData({
                    ...data,
                    stats: {
                        ...data.stats,
                        pending: data.stats.pending - 1,
                        approved: data.stats.approved + 1
                    },
                    recentPending: data.recentPending.filter(sub => sub.id !== id)
                 });
            }
        } catch (err) {
            console.error(err);
            alert('Failed to approve submission.');
        } finally {
            setApprovingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getIconForCategory = (category: string) => {
        if (category?.includes('Artwork') || category?.includes('Photography') || category?.includes('Logo')) {
            return <ImageIcon className="h-5 w-5 text-blue-500" />;
        }
        return <Video className="h-5 w-5 text-blue-600" />;
    };

    if (loading || !data) {
        return (
            <main className='min-h-screen p-6 md:p-10 bg-[#FAFAFA] flex items-center justify-center'>
                <div className='flex flex-col items-center'>
                    <Loader2 className='h-10 w-10 animate-spin text-[#1A3C2E]' />
                    <p className='mt-4 font-semibold text-gray-500'>Compiling Dashboard Analytics...</p>
                </div>
            </main>
        );
    }

    return (
        <main className='min-h-screen p-6 md:p-10 bg-[#FAFAFA] text-[#1A1A1A]'>
            <div className='max-w-7xl mx-auto space-y-6'>
                
                <h1 className='text-3xl font-bold text-[#1A1A1A] mb-2'>Dashboard</h1>
                
                {/* 1. Quick Access Stats (Slim Horizontal Cards) */}
                <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between'>
                        <div className='flex items-center gap-2 text-gray-500 text-sm font-medium mb-3'>
                            <Users className='h-4 w-4' /> Total Submissions
                        </div>
                        <div className='flex items-end justify-between'>
                            <span className='text-3xl font-bold tracking-tight'>{data.stats.total}</span>
                            <span className='text-sm font-bold text-green-600 flex items-center'>↗ Active</span>
                        </div>
                    </div>

                    <div className='bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between'>
                        <div className='flex items-center gap-2 text-gray-500 text-sm font-medium mb-3'>
                            <Check className='h-4 w-4 text-green-600' /> Total Approved
                        </div>
                        <div className='flex items-end justify-between'>
                            <span className='text-3xl font-bold tracking-tight'>{data.stats.approved}</span>
                            <span className='text-sm font-bold text-green-600 flex items-center'>Live feed</span>
                        </div>
                    </div>

                    <div className='bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between'>
                        <div className='flex items-center gap-2 text-gray-500 text-sm font-medium mb-3'>
                            <Folder className='h-4 w-4 text-amber-500' /> Total Pending
                        </div>
                        <div className='flex items-end justify-between'>
                            <span className='text-3xl font-bold tracking-tight'>{data.stats.pending}</span>
                            {data.stats.pending > 0 ? (
                                <span className='text-sm font-bold text-red-500 flex items-center'>Needs review</span>
                            ) : (
                                <span className='text-sm font-bold text-gray-400 flex items-center'>All clear</span>
                            )}
                        </div>
                    </div>
                    
                    <div className='bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between'>
                        <div className='flex items-center gap-2 text-gray-500 text-sm font-medium mb-3'>
                            <LayoutDashboard className='h-4 w-4 text-blue-500' /> Categories Used
                        </div>
                        <div className='flex items-end justify-between'>
                            <span className='text-3xl font-bold tracking-tight'>{data.pieData.length}</span>
                        </div>
                    </div>
                </section>

                {/* 2. Large Top Bar Chart */}
                <section className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm'>
                    <div className='flex items-center justify-between mb-8'>
                        <h2 className='text-lg font-bold text-[#1A1A1A]'>Submission Volume (Last 7 Days)</h2>
                        <div className='flex items-center gap-4 text-sm font-semibold'>
                            <div className='flex items-center gap-2'><div className='w-3 h-3 rounded-full bg-[#1A3C2E]'></div> Approved</div>
                            <div className='flex items-center gap-2'><div className='w-3 h-3 rounded-full bg-[#D4A017]'></div> Pending</div>
                        </div>
                    </div>
                    <div className='h-80 w-full mt-4'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1A3C2E" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#1A3C2E" stopOpacity={0.6}/>
                                    </linearGradient>
                                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4A017" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#D4A017" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1.5 }} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1.5 }} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }} 
                                    dx={-10} 
                                />
                                <Tooltip 
                                    cursor={{ fill: '#F9FAFB' }} 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Bar dataKey="approved" fill="url(#colorApproved)" name="Approved" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="pending" fill="url(#colorPending)" name="Pending" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* 3. Bottom Grid: Donut Chart & Recent Uploads */}
                <section className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    
                    {/* Donut Chart (1 Column) */}
                    <div className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col'>
                        <h2 className='text-lg font-bold text-[#1A1A1A] mb-2'>Submissions by Category</h2>
                        
                        {data.pieData.length > 0 ? (
                            <div className='flex-1 flex flex-col'>
                                <div className='h-56 w-full -ml-4'>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {data.pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className='grid grid-cols-2 gap-y-3 gap-x-2 mt-4'>
                                    {data.pieData.map((item, i) => (
                                        <div key={i} className='flex items-center gap-2 text-xs font-semibold text-gray-700'>
                                            <div className='w-3 h-3 rounded-full flex-shrink-0' style={{ backgroundColor: item.fill }}></div>
                                            <span className='truncate'>{item.name}</span>
                                            <span className='text-gray-400 ml-auto'>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className='flex-1 flex items-center justify-center text-sm text-gray-400'>
                                No category data yet.
                            </div>
                        )}
                    </div>

                    {/* Recent Uploads Table (2 Columns) */}
                    <div className='lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden'>
                        <div className='p-6 flex items-center justify-between border-b border-gray-100'>
                            <h2 className='text-lg font-bold text-[#1A1A1A]'>Recent Pending Uploads</h2>
                        </div>

                        <div className='flex-1 overflow-x-auto'>
                            {data.recentPending.length === 0 ? (
                                <div className='h-full flex items-center justify-center p-10 text-gray-500'>
                                    No pending uploads at the moment. You're all caught up!
                                </div>
                            ) : (
                                <table className='w-full text-left border-collapse min-w-[500px]'>
                                    <thead>
                                        <tr className='text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100'>
                                            <th className='px-6 py-4'>Name</th>
                                            <th className='px-6 py-4'>Category</th>
                                            <th className='px-6 py-4'>Date</th>
                                            <th className='px-6 py-4 text-right'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentPending.map((sub) => (
                                            <tr 
                                                key={sub.id} 
                                                onClick={() => router.push(`/admin/submissions/${sub.id}`)}
                                                className='group border-b border-gray-50 hover:bg-gray-50/80 transition cursor-pointer'
                                            >
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-3'>
                                                        {getIconForCategory(sub.category)}
                                                        <span className='font-semibold text-sm text-gray-900'>{sub.title}</span>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <span className='inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-600'>
                                                        {sub.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className='px-6 py-4 text-xs font-medium text-gray-500'>
                                                    {formatDate(sub.created_at)}
                                                </td>
                                                <td className='px-6 py-4 text-right'>
                                                    <button
                                                        onClick={(e) => handleApprove(e, sub.id)}
                                                        disabled={approvingId === sub.id}
                                                        className='inline-flex items-center justify-center rounded-lg bg-green-50 px-4 py-2 text-xs font-bold text-green-700 transition hover:bg-green-600 hover:text-white disabled:opacity-50'
                                                    >
                                                        {approvingId === sub.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                </section>
            </div>
        </main>
    );
}