'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getUserProfile } from '@/lib/supabase/queries/profiles';
import type { User } from '@supabase/supabase-js';

export type AuthUser = {
    id: string;
    displayName: string | null;
    email: string | null;
};

type AuthContextType = {
    user: AuthUser | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = getSupabaseBrowserClient();

        async function fetchUserProfile(authUser: User | null) {
            if (!authUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const profile = await getUserProfile(supabase, authUser.id);

                const displayName = profile
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : authUser.user_metadata?.full_name || authUser.user_metadata?.displayName || null;

                setUser({
                    id: authUser.id,
                    email: authUser.email ?? null,
                    displayName: displayName || null
                });
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setUser({
                    id: authUser.id,
                    email: authUser.email ?? null,
                    displayName: authUser.user_metadata?.full_name || authUser.user_metadata?.displayName || null
                });
            } finally {
                setLoading(false);
            }
        }

        // Fetch initial user
        supabase.auth.getUser().then(({ data: { user: initialUser } }) => {
            fetchUserProfile(initialUser);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user || null;
            fetchUserProfile(currentUser);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
