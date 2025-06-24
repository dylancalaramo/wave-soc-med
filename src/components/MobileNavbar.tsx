import { type SetStateAction } from 'react';
import WaveLogoBtn from './WaveLogoBtn';
import LinkButton from './LinkButton';
import { useAuthContext } from '../context/AuthProvider';
import { Link, useNavigate } from 'react-router';
import CreatePostIcon from '../assets/CreatePost.svg?react';
import AnonIcon from '../assets/Anonymous.svg?react'

const MobileNavbar = ({setShowAddPost} : {setShowAddPost: React.Dispatch<SetStateAction<boolean>>}) => {
    const { session, queriedUserData } = useAuthContext();
    const toLogin = useNavigate();
    return (
        <nav className='w-vh height-[50px] border-[#3F7CAC] border-b'>
            <div className='w-full h-fit flex flex-row justify-center align-center'>
                <div className='w-fit h-[50px] fixed left-[10px] flex justify-center'>
                    <WaveLogoBtn />
                </div>
                <div className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center align-center mr-[10px] hover:bg-sky-200 transition duration-300'>
                    <LinkButton img="NewPosts" link='/New' centered={true} noHover={true}/>
                </div>
                { session && 
                    <div className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center align-center mr-[10px] hover:bg-sky-200 transition duration-300'>
                        <LinkButton img="Home" link='/Home' centered={true} noHover={true}/>
                    </div>
                }
                <div className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center align-center mr-[10px] hover:bg-sky-200 transition duration-300'>
                    <LinkButton link={"Communities"} img={"Find-Community"} centered={true} noHover={true}/>
                </div>
                {location.pathname !== "/Communities" ? 
                    <div className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center items-center align-center mr-[10px] hover:bg-sky-200 transition duration-300'
                        onClick={() => session ? setShowAddPost(true) : toLogin('Login')}
                        >
                        <CreatePostIcon 
                            className='w-fit h-[30px] select-none pointer-events-none'
                        />
                    </div> : null
                }
                <div className={`w-[40px] h-[40px] fixed right-[15px] top-[5px] flex justify-center items-center fira-sans-regular`}>
                    {!session ?
                    <LinkButton link='Profile/' 
                        img="Anonymous"
                        noHover={true}
                        picIsRounded={true}        
                    /> 
                    :
                    queriedUserData ? 
                        <Link
                            to={`/Profile/${queriedUserData.user_name}`}
                            className="flex flex-row w-fit items-center"
                        >
                            {(queriedUserData.profile_picture_url && queriedUserData.profile_picture_url !== "") ? 
                                <div>
                                <img src={queriedUserData.profile_picture_url} 
                                    className="w-[30px] h-[30px] border-1 rounded-full border-sky-300"
                                />
                                </div> 
                                :
                                <AnonIcon className="w-[30px] h-[30px] border-1 rounded-full border-sky-300"/>
                            } 
                        </Link> 
                        : 
                        <div className='loading-bg-anim w-[90%] max-w-[250px] h-[40px] rounded-md ml-[10px]'></div>
                }
                </div>
            </div>
        </nav>
    )
}

export default MobileNavbar;