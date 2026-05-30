'use client';

import { useEffect, useState } from 'react';

export type AuthUser = {
    displayName: string | null;
    email: string | null;
};

const AUTH_STORAGE_KEY = 'naija-vibe-auth-user';

function readStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        const parsedUser = JSON.parse(rawUser) as AuthUser;

        return {
            displayName: parsedUser.displayName ?? null,
            email: parsedUser.email ?? null
        };
    } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function storeAuthUser(user: AuthUser | null) {
    if (typeof window === 'undefined') {
        return;
    }

    if (!user) {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const syncUser = () => {
            setUser(readStoredUser());
            setLoading(false);
        };

        syncUser();

        window.addEventListener('storage', syncUser);

        return () => window.removeEventListener('storage', syncUser);
    }, []);

    return { user, loading };
}
