import '../assets/Fonts.css';
import '../assets/Animations.css';
import CreatePostIcon from '../../src/assets/CreatePost.svg?react';
import NewPostsIcon from '../assets/NewPosts.svg?react';
import HomeIcon from '../assets/Home.svg?react';
import TrendingIcon from '../assets/Trending.svg?react';
import CommunitiesIcon from '../assets/Find-Community.svg?react';
import AnonIcon from '../assets/Anonymous.svg?react';
import { useAuthContext } from '../context/AuthProvider';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { getCommunityDataFromName } from '../pages/Community';
import { useQuery } from '@tanstack/react-query';
import type { CommunityData } from './CommunityList';

const RightNavbar = ({setShowAddPost}: {setShowAddPost: React.Dispatch<React.SetStateAction<boolean>>}) => {
    const { session, queriedUserData } = useAuthContext();
    const location = useLocation();
    const locationParams = useParams();

    const toLogin = useNavigate();

    const { data } = useQuery<CommunityData | null>({
        queryFn: () => getCommunityDataFromName(locationParams.communityName),
        queryKey: ["communityData"]
    })

    // useEffect(() => {
    //     console.log(queriedUserData);
    // }, [queriedUserData])

    return (
        <nav className="w-full h-fit min-h-screen text-black border-box pb-[110px] border-[#3F7CAC] border-l-1 pt-[20px] relative">
            <div className='w-[80%] min-w-[225px] max-w-[400px] h-fit pl-[35px] mr-auto'>
                {!session ?
                    <Link
                        to="/Login"
                        className="flex flex-row w-fit items-center"
                    >
                        <AnonIcon className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]"/>
                        <span className='fira-sans-regular text-[18px]'>Anonymous</span>
                    </Link> 
                    :
                    queriedUserData ? 
                        <Link
                            to={`/Profile/${queriedUserData.user_name}`}
                            className="flex flex-row w-fit items-center"
                        >
                            {(queriedUserData.profile_picture_url && queriedUserData.profile_picture_url !== "") ? 
                                <div>
                                <img src={queriedUserData.profile_picture_url+`?${Date()}`} 
                                    className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]"
                                />
                                </div> 
                                :
                                <AnonIcon className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]"/>
                            } 
                            <span className='fira-sans-regular text-[18px]'>{queriedUserData.user_name}</span>
                        </Link> 
                        : 
                        <div className='loading-bg-anim w-[90%] max-w-[250px] h-[40px] rounded-md ml-[10px]'></div>
                }
            </div>
            <div className='w-[80%] min-w-[225px] max-w-[250px] h-fit pl-[25px] mr-auto mt-[20px] md:block lg:hidden'>
                <Link
                    to="/New"
                    className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                            pl-[10px] pr-auto py-[5px] mr-[20px] mt-[10px]"
                >
                    <NewPostsIcon className="w-fit h-[30px] mr-[10px]"/>
                    <h1 className='fira-sans-regular text-lg'>New Posts</h1>
                </Link>  
            </div> 
            { session && 
                <div className='w-[80%] min-w-[225px] max-w-[250px] h-fit pl-[25px] mr-auto mt-[20px] md:block lg:hidden'>
                    <Link
                    to="/New"
                    className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                            pl-[10px] pr-auto py-[5px] mr-[20px] mt-[10px]"
                >
                    <HomeIcon className="w-fit h-[30px] mr-[10px]"/>
                    <h1 className='fira-sans-regular text-lg'>Home</h1>
                </Link>
                </div>
            }
            <div className='w-[80%] min-w-[225px] max-w-[250px] h-fit pl-[25px] mr-auto mt-[20px] md:block lg:hidden'>
                <Link
                    to="/Trending"
                    className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                            pl-[10px] pr-auto py-[5px] mr-[20px]"
                >
                    <TrendingIcon className="w-fit h-[30px] mr-[10px]"/>
                    <h1 className='fira-sans-regular text-lg'>Trending</h1>
                </Link>  
            </div>  
            <div className='w-[80%] min-w-[225px] max-w-[250px] h-fit pl-[25px] mr-auto mt-[20px] md:block lg:hidden'>
                <Link
                    to="/Communities"
                    className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                            pl-[10px] pr-auto py-[5px] mr-[20px]"
                >
                    <CommunitiesIcon className="w-fit h-[30px] mr-[10px]"/>
                    <h1 className='fira-sans-regular text-lg'>Communities</h1>
                </Link>  
            </div>
            {/* <div className='w-[80%] h-fit m-auto mb-[20px]'>
                <NavDrawer drawerItems={chatList}>
                    <ChatIcon className="w-[30px] h-[30px] fill-[#3F7CAC] mr-[10px] border-[#3F7CAC]"/>
                    <span className="w-fit h-[30px] text-center text-lg antialiased fira-sans-regular cursor-default select-none">Chat</span>
                </NavDrawer>
            </div> */}
            {locationParams.communityName &&
                 <div className='w-[80%] min-w-[225px] max-w-[400px] h-fit 
                                px-[25px] py-[10px] ml-[25px] mt-[10px] bg-gray-100
                                flex flex-col rounded-lg overflow-hidden'>
                    <span className='fira-sans-bold text-balance break-all'>{locationParams.communityName}</span>
                    <span className='w-full h-fit fira-sans-regular'>{data?.description}</span>
                </div>
            }
            <div className='w-full h-[60px]'>
                {/*Buffer space for create post button*/}
            </div>
            {location.pathname !== "/Communities" ?
                <div 
                    className='w-[80%] max-w-[250px] h-fit absolute bottom-[10px] left-[25px] pl-[10px] py-[5px] 
                                rounded-md hover:bg-blue-200 transition duration-300
                                flex flex-row items-center text-lg antialiased fira-sans-regular select-none cursor-pointer'
                    onClick={() => session ? setShowAddPost(true) : toLogin('Login', {replace: true})}      
                >
                    <CreatePostIcon 
                        className='w-fit h-[30px] fill-[#3F7CAC] mr-[10px]'
                    />
                Create post
                </div> :
                null
            }
        </nav>
    )
}

export default RightNavbar;