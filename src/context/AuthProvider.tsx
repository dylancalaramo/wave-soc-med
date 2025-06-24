import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../supabase-client";
import type { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface UserDataType { 
    id: string;
    user_name: string;
    profile_picture_url: string;
    email: string;
}


interface AuthContextType {
    // user: User | null;
    session: Session | null;
    queriedUserData: UserDataType | null | undefined;
    signInWithEmail: (emailInput: string, passwordInput: string) => void;
    signUpWithEmail: (usernameInput: string, emailInput: string, passwordInput: string) => void;
    signOut: () => void;
    error: string| null;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState<string | null>("");
    // const { data } = supabase.from('profiles').select('*').eq();
    // console.log(data);
    const queryClient = useQueryClient();
    
    const fetchUserData = async(): Promise<UserDataType | null> => {
        if(session) {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if(error) throw new Error(error.message);
            return data;
        }
        return null;
    }

    const { data: queriedUserData } = useQuery<UserDataType | null>({
        queryFn: fetchUserData,
        queryKey: ["userData", session?.user.id],
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false
    })

    useEffect(() => {
        if(error !== "") {
            setTimeout(() => {
                setError("");
            }, 1000)
        }
    }, [error])
    //set session from session token
    useEffect(() => {
        //validate session from token then set session in state
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        })

        const {data: listener} = supabase.auth.onAuthStateChange((__, session) => {
            queryClient.invalidateQueries({ queryKey:['userData'] });
            setSession(session);
        })

        return () => {
            listener.subscription.unsubscribe();
        }
    }, [queryClient])

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if(error) {
            setError(error.message);
            return { success: false, error };
        } else {
            return { success: true } 
        }
    }

    const signInWithEmail = async(emailInput:string, passwordInput:string) => {
        // console.log(emailInput, passwordInput);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailInput,
            password: passwordInput, 
            }
        )

        if(error) {
            setError(error.message);
            return { success: false, error };
        } else {
            // fetchSession();
            return { success: true, data };
        }
    }

    const signUpWithEmail = async(usernameInput: string, emailInput: string, passwordInput: string) => {
        const { data: checkUsername, error: checkUsernameError } = await supabase.from("profiles").select("*").eq("user_name", usernameInput).maybeSingle();
        if(checkUsernameError) throw new Error(checkUsernameError.message);

        if(!checkUsername) {
            const { data, error } = await supabase.auth.signUp({
                email: emailInput,
                password: passwordInput,
                options: {
                    data: {
                        username: usernameInput,
                    }
                }
            }, )
            
            if(error) {
                setError(error.message); 
                return { success: false, error };
            } else {
                setError("Confirm your email to activate your account")
                return { success: true, data };
            }
        }
        else {
            setError("Username is already taken");
            throw new Error("Username is already taken");
        }
    }

    return(
        <AuthContext.Provider value={{ session, queriedUserData, signUpWithEmail, signInWithEmail, signOut, error}}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
    const context = useContext(AuthContext); 
    if (context === undefined) {
        throw new Error("useAuthContext must be used within the Authprovider");
    }
    return context;
}