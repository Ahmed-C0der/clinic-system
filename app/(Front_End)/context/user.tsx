"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/lib/models";

interface UserContextType {
    user: AuthContext | null;
    setUser: (user: AuthContext | null) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
    isLoading: true,
});

export default function UserContextProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (err) {
                console.error("Auth fetch failed:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, isLoading }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);