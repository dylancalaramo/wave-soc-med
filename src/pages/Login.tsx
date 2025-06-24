import { memo, useState, useCallback, useEffect} from "react";
import Logo from '../assets/Wave.svg?react'
import { useAuthContext } from "../context/AuthProvider";
import ToastMessageBox from "../components/ToastMessageBox";
import { useNavigate } from "react-router";
import { supabase } from "../supabase-client";

const Login = () => {
    const { session, signInWithEmail, signUpWithEmail, error } = useAuthContext();
    const [login, setLogin] = useState<boolean>(true);
    const [emailInput, setEmailInput] = useState<string>("");
    const [passwordInput, setPasswordInput] = useState<string>("");
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [toastMessage, setToastMessage] = useState<string>("");
    const [showToast, setShowToast] = useState<boolean>(false);
    const redirect = useNavigate();

    useEffect (() => {  
        const {data: listener} = supabase.auth.onAuthStateChange((__, session) => {
            if(session) {
                setTimeout(() => {
                    redirect("/");
                }, 1500)
            } 
        })

        return () => {
            listener.subscription.unsubscribe();
        }
    }, [redirect])

    useEffect(() => {
        if(error && error !== "") {
            setToastMessage(error);
            setShowToast(true);
        }
    }, [error])

    const handleSignInSubmit = useCallback(() => {
        signInWithEmail(emailInput, passwordInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emailInput, passwordInput])

    const handleSignUpSubmit = useCallback(() => {
        signUpWithEmail(usernameInput, emailInput, passwordInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usernameInput, emailInput, passwordInput])

    const handleSwitchMethod = useCallback(() => {
        setEmailInput("");
        setPasswordInput("");
        setUsernameInput("");
        setLogin(prev => !prev);
    }, [])


    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-[80%] max-w-[400px] h-[fit] fixed top-[50px] left-[50%] translate-x-[-50%]">
                <ToastMessageBox message={toastMessage} showToast={showToast} setShowToast={setShowToast}/>
            </div>
            <div className="w-[80%] max-w-[600px] h-fit border-1 border-[#3F7CAC] flex flex-col relative bg-white shadow-[10px_10px_1px_1px] shadow-blue-300">
                { session ? 
                    <div className="text-center m-auto p-[50px]">Hang on tight, we are logging you in. You'll be redirected shortly</div> :
                    <>
                        <div className="w-full max-w-[600px] h-fit flex flex-row items-center absolute top-[-40px] select-none text-[#3F7CAC]">
                            <Logo className="fill-[#3F7CAC] w-[30px] h-[30px] mr-[10px]"/>
                            <h1 className="antialiased fira-sans-black text-2xl select-none">Wave</h1>
                            <h2 className="text-xl antialiased fira-sans-black w-fit text-center ml-auto text-[#3F7CAC]">{login ? "Sign In": "Sign Up"}</h2>
                        </div>
                        <section className="w-[80%] h-fit ml-auto mr-auto py-[10px] mt-[10px]">
                            <form className="text-lg antialiased fira-sans-regular flex flex-col" autoComplete="true">
                                {!login &&
                                    <>
                                        <input className={`w-full h-fit pl-[10px] py-[10px] rounded-md border-1 border-[#3F7CAC] inset-shadow-sm`} type="text" id="username" 
                                        value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} required/>
                                        <label htmlFor="email" className={`text-gray-400`}>Username</label>
                                    </>
                                }
                                <input className="w-full h-fit pl-[10px] py-[10px] rounded-md border-1 border-[#3F7CAC] inset-shadow-sm" type="email" id="email" 
                                    value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required/>
                                <label htmlFor="email" className="text-gray-400">Email</label>
                                <input className="w-full h-fit pl-[10px] py-[10px] rounded-md border-1 border-[#3F7CAC] bg-white" type="password" id="password" 
                                    value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required/>
                                <label htmlFor="password" className="text-gray-400">Password</label>
                                <button type="button" 
                                    className="w-[50%] max-w-[200px] h-[50px] text-[15px] rounded-sm text-white bg-blue-400 mx-auto mt-[10px] cursor-pointer"
                                    onClick={() => login ? handleSignInSubmit() : handleSignUpSubmit()}
                                    >{login ? "Sign in" : "Sign up"}</button>
                            </form>
                        </section>
                        <section className="w-fit h-fit pb-[10px] mx-auto">
                            <button className="w-fit h-fit text-[#3F7CAC] m-auto cursor-pointer" onClick={handleSwitchMethod}>{login ? "Click here to sign up" : "Back to sign in"}</button>
                        </section>
                    </>
                }
            </div>
        </div>
    )
    
}

export default memo(Login);