import { createContext, useContext, useState, type ReactNode } from "react";
import type { PostDetailType } from "../components/interfaces/Interface";

interface PostDetailContextType {
    setPostData: React.Dispatch<React.SetStateAction<PostDetailType | null>>,
    postData: PostDetailType | null
}

const PostDetailsContext = createContext<PostDetailContextType | undefined>(undefined);

export const PostDetailsProvider = ({children} : {children: ReactNode}) => {
    const [postData, setPostData] = useState<PostDetailType | null>(null);

    return (
        <PostDetailsContext.Provider value={{setPostData, postData}}>
            {children}
        </PostDetailsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePostDetailsContext = () => {
    const context = useContext(PostDetailsContext);
    if(context === undefined) throw new Error("usePostDetailsContext must be used inside the PostDetailsProvider")
    return context
}