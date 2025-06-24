import '../assets/Fonts.css';
import '../assets/Animations.css';
import WaveLogoBtn from './WaveLogoBtn';
import LinkButton from './LinkButton';
import { useAuthContext } from '../context/AuthProvider';

// interface props {
//     communityList: ReactNode[];
//     chatList: ReactNode[];
// }

const LeftNavbar = () => {
    const { session } = useAuthContext()
    return (
        <nav className='w-full h-full'>
            <div className='w-full h-fit min-h-screen border-[#3F7CAC] border-r-1 pt-[20px]'>
                <div className='w-[80%] max-w-[250px] h-fit pr-[25px] ml-auto'>
                    <WaveLogoBtn />
                </div>
                <div className='w-[80%] max-w-[250px] h-fit pr-[25px] ml-auto mt-[20px]'>
                    <LinkButton img="NewPosts" text="New Posts" link='/New'/>
                </div>
                { session && 
                    <div className='w-[80%] max-w-[250px] h-fit pr-[25px] ml-auto mt-[20px]'>
                        <LinkButton img="Home" text="Home" link='/Home'/>
                    </div>
                }
                <div className='w-[80%] max-w-[250px] h-fit pr-[25px] ml-auto mt-[20px]'>
                    <LinkButton img="Trending" text="Trending" link='Trending'/>
                </div>
                <div className='w-[80%] max-w-[250px] h-fit pr-[25px] ml-auto mt-[20px]'>
                    <LinkButton img="Find-Community" text="Find community" link='Communities'/>
                </div>  
            </div>
        </nav>
    )
}

export default LeftNavbar;