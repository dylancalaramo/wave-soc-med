import { type SetStateAction } from 'react';
import { useAuthContext } from '../context/AuthProvider';
import { Link, useNavigate } from 'react-router';
import CreatePostIcon from '../assets/CreatePost.svg?react';
import WaveIcon from '../assets/Wave.svg?react';
import HomeIcon from '../assets/Home.svg?react';
import TrendingIcon from '../assets/Trending.svg?react';
import CommunitiesIcon from '../assets/Find-Community.svg?react';
import AnonIcon from '../assets/Anonymous.svg?react';

const MobileNavbar = ({setShowAddPost} : {setShowAddPost: React.Dispatch<SetStateAction<boolean>>}) => {
    const { session, queriedUserData } = useAuthContext();
    const toLogin = useNavigate();
    return (
        <nav className='w-vh height-[50px] border-[#3F7CAC] border-b'>
            <div className='w-full h-fit flex flex-row justify-center align-center'>
                <Link className='w-[50px] h-[50px] mr-auto flex justify-center items-center align-center'
                    to="/"
                    >
                    <WaveIcon className="w-fit h-[30px] fill-[#3F7CAC] pointer-events-none"/>
                </Link> 
                <Link className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center items-center align-center mr-[10px] hover:bg-sky-200 transition duration-300'
                    to="/Trending"
                    >
                    <TrendingIcon className='w-fit h-[30px] select-none pointer-events-none'/>
                </Link> 
                { session && 
                    <Link className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center items-center align-center mr-[10px] hover:bg-sky-200 transition duration-300'
                        to="/Home"
                        >
                        <HomeIcon className='w-fit h-[30px] select-none pointer-events-none'/>
                    </Link> 
                }
                <Link className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center items-center align-center mr-[10px] hover:bg-sky-200 transition duration-300'
                    to="/Communities"
                    >
                    <CommunitiesIcon className='w-fit h-[30px] select-none pointer-events-none'/>
                </Link> 
                {location.pathname !== "/Communities" ? 
                    <div className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center items-center align-center mr-[10px] hover:bg-sky-200 transition duration-300'
                        onClick={() => session ? setShowAddPost(true) : toLogin('Login')}
                        >
                        <CreatePostIcon 
                            className='w-fit h-[30px] select-none pointer-events-none'
                        />
                    </div> : null
                }
                <div className={`w-[40px] h-[40px] ml-auto mr-[5px] my-auto flex justify-center items-center fira-sans-regular`}>
                    {!session ?
                    <Link className='w-[50px] h-[50px] rounded-full mt-auto mb-auto flex justify-center items-center mr-[10px]'
                        to="/Login"
                        >
                        <AnonIcon className='w-fit h-[30px] select-none pointer-events-none rounded-full border-1 border-[#3F7CAC]'/>
                    </Link> 
                    :
                    queriedUserData ? 
                        <Link
                            to={`/Profile/${queriedUserData.user_name}`}
                            className="flex flex-row w-fit items-center  flex justify-center items-center"
                        >
                            {(queriedUserData.profile_picture_url && queriedUserData.profile_picture_url !== "") ? 
                                <img src={queriedUserData.profile_picture_url} 
                                    className="w-[30px] h-[30px] border-1 rounded-full border-sky-300"
                                />
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