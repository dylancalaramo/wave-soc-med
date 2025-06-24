import type { User } from "@supabase/supabase-js";
import Logo from '../../src/assets/Wave.svg?react'


const LoginPageContent = ({user, handleSignInSubmit, handleSignUpSubmit, handleSignInGoogle, login} : 
                            {user: User, handleSignInSubmit: () => void, handleSignUpSubmit: () => void, handleSignInGoogle: () => void, login: boolean }) => {
    return (
        <>
        {user ? 
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
                        onChange={(e) => setEmailInput(e.target.value)} required/>
                    <label htmlFor="email" className="text-gray-400">Email</label>
                    <input className="w-full h-fit pl-[10px] py-[10px] rounded-md border-1 border-[#3F7CAC] bg-white" type="password" id="password" 
                        onChange={(e) => setPasswordInput(e.target.value)} required/>
                    <label htmlFor="password" className="text-gray-400">Password</label>
                    <button type="button" 
                        className="w-[50%] max-w-[200px] h-[50px] text-[15px] rounded-sm text-white bg-blue-400 mx-auto mt-[10px] cursor-pointer"
                        onClick={() => login ? handleSignInSubmit() : handleSignUpSubmit()}
                        >{login ? "Sign in" : "Sign up"}</button>
                </form>
            </section>
            <hr className="w-[80%] h-[1px] border-none bg-[#3F7CAC] my-[10px] mx-auto"/>
            <section className="w-full h-full my-[20px] flex flex-col items-center">
                <div className="w-[50%] max-w-[200px] h-[50px] bg-red-100" onClick={signInWithGoogle}>
                    <GoogleBtn message={login ? "Sign in with Google": "Sign up with Google"} />
                </div>
            </section>
            <section className="w-fit h-fit pb-[10px] mx-auto">
                <button className="w-fit h-fit text-[#3F7CAC] m-auto cursor-pointer" onClick={() => setLogin(prev => !prev)}>{login ? "Click here to sign up" : "Back to sign in"}</button>
            </section>
            </>
        }
        </>
    )
}
