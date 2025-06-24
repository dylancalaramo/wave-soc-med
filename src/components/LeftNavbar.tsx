import '../assets/Fonts.css';
import '../assets/Animations.css';
import { useAuthContext } from '../context/AuthProvider';
import { Link } from 'react-router';
import NewPostsIcon from '../assets/NewPosts.svg?react';
import HomeIcon from '../assets/Home.svg?react';
import WaveIcon from '../assets/Wave.svg?react';
import TrendingIcon from '../assets/Trending.svg?react';
import CommunitiesIcon from '../assets/Find-Community.svg?react';

// interface props {
//     communityList: ReactNode[];
//     chatList: ReactNode[];
// }

const LeftNavbar = () => {
    const { session } = useAuthContext()
    return (
        <nav className='w-full h-full'>
            <div className='w-full h-fit flex flex-col items-end gap-[20px] min-h-screen border-[#3F7CAC] border-r-1 pt-[20px]'>
                <Link
                    to="/New"
                    className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                            pl-[10px] pr-auto py-[5px] mr-[20px]"
                >
                    <WaveIcon className="w-fit h-[30px] fill-[#3F7CAC] mr-[10px]"/>
                    <h1 className='antialiased fira-sans-black text-[#3F7CAC] text-2xl'>Wave</h1>
                </Link> 
                <Link
                    to="/New"
                    className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                            pl-[10px] pr-auto py-[5px] mr-[20px]"
                >
                    <NewPostsIcon className="w-fit h-[30px] mr-[10px]"/>
                    <h1 className='fira-sans-regular text-lg'>New Posts</h1>
                </Link>  
                {/* <div className='w-[80%] max-w-[250px] h-fit pr-[25px] ml-auto mt-[20px]'>
                    <LinkButton img="NewPosts" text="New Posts" link='/New'/>
                </div> */}
                { session && 
                    <Link
                        to="/Home"
                        className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                                pl-[10px] pr-auto py-[5px] mr-[20px]"
                    >
                        <HomeIcon className="w-fit h-[30px] mr-[10px]"/>
                        <h1 className='fira-sans-regular text-lg'>Home</h1>
                    </Link>  
                }
                <Link
                    to="/Trending"
                    className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                            pl-[10px] pr-auto py-[5px] mr-[20px]"
                >
                    <TrendingIcon className="w-fit h-[30px] mr-[10px]"/>
                    <h1 className='fira-sans-regular text-lg'>Trending</h1>
                </Link>  
                <Link
                    to="/Communities"
                    className="w-[200px] flex flex-row items-center h-fit rounded-md hover:bg-blue-200 transition duration-300 
                            pl-[10px] pr-auto py-[5px] mr-[20px]"
                >
                    <CommunitiesIcon className="w-fit h-[30px] mr-[10px]"/>
                    <h1 className='fira-sans-regular text-lg'>Communities</h1>
                </Link>  
            </div>
        </nav>
    )
}

export default LeftNavbar;