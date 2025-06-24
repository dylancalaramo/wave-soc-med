import { useCallback, useEffect, useState } from "react";
import CreateCommunity from "../components/CreateCommunity";
import CreateCommunityIcon from "../assets/Add-Community.svg?react"
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router";
import CommunityList from "../components/CommunityList";

const Communities = () => {
    const [showCreateCommunity, setShowCreateCommunity] = useState<boolean>(false);
    const {session} = useAuthContext();
    const toLogin = useNavigate();

        const handleCreateCommunity = useCallback(() => {
            if(!session) {
                toLogin("/Login", {replace: false});
            } else {
                setShowCreateCommunity(true);
            }
        }, [session, toLogin])

        const handleOutsideClick = useCallback((e: MouseEvent) => {
            // console.log(e.target);
            if(e.target instanceof Element && (e.target.id === "floating-window-boundary" || e.target.id === "close-btn")) {
                setShowCreateCommunity(false);
            }
        }, [setShowCreateCommunity])
        
        useEffect(() => {
            if(showCreateCommunity) {
                document.addEventListener('click', handleOutsideClick, true);
            }
            return () => {
                document.removeEventListener('click', handleOutsideClick, true);
            }
        }, [handleOutsideClick, showCreateCommunity])
      
    return (
        <div className="w-full h-fit min-h-screen flex flex-col items-center pt-[10px] fira-sans-regular relative">
            <section className="w-full h-full max-h-[85%] flex flex-col items-center justify-center">
                <h1 className="fira-sans-bold text-[30px] black">Top Communities</h1>
                <div className="mt-[10px] w-full h-fit">
                    <CommunityList />
                </div>
            </section>
            <button className="absolute bottom-3 right-3 flex flex-row items-center bg-gray-200 p-2 gap-[5px] mt-[10px] rounded-full cursor-pointer"
                    onClick={handleCreateCommunity}>
                <CreateCommunityIcon />
                {!session ? 
                    <span>You must <span className="text-blue-400">log-in</span> to create a community</span>
                    :
                    "Create Community"
                }
            </button>
            {showCreateCommunity &&
            <div className= {`w-screen h-screen bg-[rgba(244,244,244,0.8)]
                fixed top-0 left-0 z-1 overflow-y-auto [scrollbar-width:none]
                grid auto-cols-auto justify-center items-center`} 
                id="floating-window-boundary" 
            >
                <CreateCommunity setShowCreateCommunity={setShowCreateCommunity}/>
            </div>
            }
        </div>
    )
}

export default Communities;