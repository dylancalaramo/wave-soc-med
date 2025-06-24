import { useState, memo } from "react";
import type { NavDrawerItem, NavDrawerProps } from "./interfaces/Interface";
import ArrowIcon from "../assets/Arrow.svg?react"
import "../assets/Animations.css"
import { Link } from "react-router";

const NavDrawer = (props : NavDrawerProps) => {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(props.isOpen? props.isOpen : false);
    // console.log(props.drawerItems)

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
        <div onClick={()=> setDrawerOpen(prev => !prev)} className="w-[100%] h-[100%]">
            <div className={`w-full h-[50px] flex flex-row pl-[10px] items-center box-border rounded-t-md 
                hover:bg-blue-200 transition duration-300 
                text-lg antialiased fira-sans-regular cursor-default select-none
                ${drawerOpen ? "no-bottom-border-anim rounded-md" : "bottom-border-anim"}` } >
                <div className=" flex flex-row ">
                    {props.children}
                </div>
                <ArrowIcon className={`w-[30px] h-[30px] ml-auto select-none ${drawerOpen ? "arrow-up-anim" : "arrow-down-anim"}`}/> 
            </div>
            <div className={`w-full flex flex-col text-black fira-sans-regular border-b border-[#3F7CAC] 
                ${drawerOpen ? "max-h-screen opacity-[1]" : "max-h-0 opacity-[0] pointer-events-none select-none"} transition-height ease-in duration-300`}>
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
                )
            }
            </div>
        </div>
    )
}

export default memo(NavDrawer);