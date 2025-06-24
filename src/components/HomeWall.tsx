import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import type { PostData } from "./interfaces/Interface";
import Post from "./Post";
import { useAuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router";

// eslint-disable-next-line react-refresh/only-export-components
export const fetchPosts = async(userId: string) : Promise<PostData[]> => {
    if(!userId) throw new Error("User ID not found")
    const { data, error } = await supabase.rpc("get_posts_from_joined_communities", {user_id: userId});
        
    // console.log(data);
    if(error) throw new Error(error.message);
    return data as PostData[];
}

const HomeWall = () => {
    const { session } = useAuthContext();
    const toLogin = useNavigate();
    const { data, error, isLoading} = useQuery<PostData[]>({
        queryKey: ["posts"],
        queryFn: () => fetchPosts(session!.user.id)
    })

    if(error) return (
        <div className="w-full h-fit min-h-screen flex flex-col">
            <div className="my-auto">
                <h1 className="text-center mt-10 fira-sans-bold">An error occured while getting the posts</h1>
            </div>
        </div>
    )

    if(!session) (
        toLogin("/Login", {replace: true})
    )
    // console.log(data);
    
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
                            <h1 className="fira-sans-bold text-center text-[30px]">It sure is silent around here</h1>
                            <div className="text-[20px] text-center">There are no posts to show. </div>
                            <div className="text-[20px] text-center"> Try joining a community, or make a new post on your joined communities!</div>
                        </div>
                    :
                    <div className="w-full h-fit mt-[20px] text-center">There are no posts to show!</div>
            }
        </div>
    )
}

export default HomeWall;