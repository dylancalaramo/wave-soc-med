import { useEffect } from "react"

const ToastMessageBox = (props: {message: string, showToast: boolean, setShowToast: React.Dispatch<React.SetStateAction<boolean>>}) => {
    const { message, showToast, setShowToast} = props;
    useEffect(() => {
        if(showToast) {
            setTimeout(() => {
                setShowToast(false);
            }, 3000)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showToast])


    return (
        <div className={`w-full h-full flex justify-center align-center bg-gray-500 rounded-md select-none transition-all p-[10px]  ${showToast ? "opacity-100 duration-300" : "opacity-0 duration-1000"}`}>
            <span className="text-lg fira-sans-regular text-white">
                {message}
            </span>
        </div>
    )
}

export default ToastMessageBox