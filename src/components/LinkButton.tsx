import type { LinkButtonProps } from "./interfaces/Interface";
import { Link } from "react-router";
import { memo } from 'react';

const LinkButton = (props : LinkButtonProps) => {
    // console.log(props)
    // console.log("name", props.text);
    // console.log("img", props.img);
    return (
        <div className={`w-full h-full m-auto flex items-center pt-[5px] pb-[5px]  ${props.noHover? null: "rounded-md hover:bg-blue-200 transition duration-300"}`}>
            <Link 
                to={`${props.link}`}
                className={`w-full h-fit flex flex-row 
                text-lg antialiased fira-sans-regular items-center ${props.centered? "justify-center": "pl-[10px]"}`}            
                >
                {props.img && 
                    <img 
                        src={props.picHasOutsideSource ? props.img : `../../src/assets/${props.img}.svg`}
                        className={`w-fit h-[30px] fill-[#3F7CAC] ${props.text ? "mr-[10px]" : null} ${props.picIsRounded ? "rounded-full" : null}`}
                        referrerPolicy="no-referrer"
                    />
                }
                {props.text &&
                    <span className="w-fit h-full truncate">{props.text}</span>
                }   
            </Link>
        </div>
    )
}

export default memo(LinkButton);