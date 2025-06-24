import { Link } from "react-router";
import Logo from '../assets/Wave.svg?react'

const WaveLogoBtn = () => {
    return (
        <Link to="/New" className="w-full h-full flex flex-row text-2xl items-center pl-[3%]">
            <Logo className="fill-[#3F7CAC] w-[30px] h-fit mr-[10px]"/>
            <h1 className="antialiased fira-sans-black text-[#3F7CAC]">Wave</h1>
        </Link>
    )
}

export default WaveLogoBtn