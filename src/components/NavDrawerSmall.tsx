import { memo, useState } from 'react';
import type { NavDrawerItem, NavDrawerSmallProps  } from './interfaces/Interface';
import { Link } from 'react-router';

const NavDrawerSmall = (props : NavDrawerSmallProps) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const LinkedDrawerItem = (props : NavDrawerItem) => (
        <Link
            to={`${props.link}`}
            className="w-full h-full pl-[10px] flex flex-row items-center"
        >
            {props.picture && 
                <img src={`../../src/assets/dev-assets/${props.picture}.svg`}
                    className="w-[30px] h-[30px] mt-auto mb-auto mr-[10px]" 
                />
            }
            <span className="w-fit h-fit">{props.text}</span>
        </Link>
    )

    const UnlinkedDrawerItem = (props : NavDrawerItem) => (
        <div
            className="w-full h-full pl-[10px] flex flex-row items-center"
        >
            {props.picture && 
                <img src={`../../src/assets/dev-assets/${props.picture}.svg`}
                    className="w-[30px] h-[30px] mt-auto mb-auto mr-[10px]" 
                />
            }
            <span className="w-fit h-fit">{props.text}</span>
        </div>
    )

    return (
        <div className={`w-full h-fit flex justify-center items-center relative ${props.noHover? null: "hover:bg-sky-200 transition duration-300"}`} 
            onMouseEnter={() => setIsHovered(prev => !prev)} onMouseLeave={() => setIsHovered(prev => !prev)}
            onClick={() => setDrawerOpen(prev => !prev)}
            >
            <img src={`../../src/assets/${props.img}.svg`}
                className='w-[40px] h-[40px]'/>
            <div className={`w-[200px] absolute h-fit top-[45px] bg-sky-100 border-box pr-px rounded-md flex-col ${isHovered || drawerOpen ? "flex" : "hidden" }`}>
                <div className='w-[50%] h-[10px] absolute top-[-10px] left-[0] translate-x-[50%]'>
                    {/*Hover safezone, do not remove*/}
                </div>
                {props.drawerItems?.map(item => (
                    <div className="w-full h-[50px] hover:bg-sky-200 rounded-md transition duration-300 pl-[10px]"
                        onClick={() => item.function ?? item.function}
                        key={item.text}>
                        {item.link ?
                            <>
                                <LinkedDrawerItem text={item.text} picture={item.picture} link={item.link}/>
                            </>
                            :
                            <>
                                <UnlinkedDrawerItem text={item.text} picture={item.picture} />
                            </>
                        }
                    </div>
                    )
                )}
            </div>
        </div>
    )
}

export default memo(NavDrawerSmall)