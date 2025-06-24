import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import type { PostData } from "./interfaces/Interface";
import Post from "./Post";

// eslint-disable-next-line react-refresh/only-export-components
export const fetchNewPosts = async() : Promise<PostData[]> => {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", {ascending: false});
        
    // console.log(data);
    if(error) throw new Error(error.message);
    return data as PostData[];
}

const NewPostsWall = () => {
    const { data, error, isLoading } = useQuery<PostData[], Error>({
        queryKey: ["newPosts"],
        queryFn: fetchNewPosts
    })

    if(error) return (
        <div className="w-full h-fit min-h-screen flex flex-col">
            <div className="my-auto">
                <h1 className="text-center mt-10 fira-sans-bold">An error occured while getting the posts</h1>
            </div>
        </div>
    )
    
    return (
        <div className="w-full h-fit min-h-screen flex flex-col fira-sans-regular overflow-x-hidden pt-[10px]">
            {isLoading ? 
                <>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[50px]"/>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                </> 
                :
                data ?
                    data.length > 0 ?
                        <div>
                            {data.map((post) => <Post data={post} key={post.id}/>)}
                        </div>
                        :
                        <div className="my-auto">
                            <h1 className="fira-sans-bold text-center text-[30px] mt-[20px]">It sure is silent around here</h1>
                            <div className="text-[20px] text-center">There are no new posts to show. </div>
                            <div className="text-[20px] text-center"> Feel free to make a new post, be the first to Wave!</div>
                        </div>
                    :
                    <div className="w-full h-fit mt-[20px] text-center">There are no posts to show!</div>
            }
        </div>
    )
}

export default NewPostsWall;