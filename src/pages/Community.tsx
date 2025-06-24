import { useNavigate, useParams } from "react-router";
import type { CommunityData } from "../components/CommunityList";
import { supabase } from "../supabase-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronBarDown } from "react-bootstrap-icons";
import type { PostData } from "../components/interfaces/Interface";
import Post from "../components/Post";
import { useAuthContext } from "../context/AuthProvider";

// eslint-disable-next-line react-refresh/only-export-components
export const getCommunityDataFromName = async(communityName: string | undefined):Promise<CommunityData | null> => {
    if(!communityName) return null

    const { data, error } = await supabase.from("communities").select("id, name, image, description").eq("name", communityName).single();
    if(error) return null

    return data as CommunityData
}

const getJoinStatusFromName = async(userId: string, communityId: number | undefined):Promise<boolean | null> => {
    if(!userId || !communityId) return null;

    const { data: isJoined, error: isJoinedError } = await supabase.rpc("get_join_community_status", {user_id: userId, community_id: communityId});
    if(isJoinedError) return null;
    // console.log(isJoined);
    return isJoined as boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const getCommunityPosts = async(communityId: number | undefined): Promise<PostData[] | null> => {
    
    if(!communityId) return null
    const {data, error} = await supabase.from("posts").select("*").eq("community_id", communityId);
    if(error) return null;

    return data as PostData[];
}

const mutateJoinCommunity =async(joinStatus: boolean, userId: string, communityId: number) => {
    // console.log(joinStatus, profileId, communityId);
    // console.log("test");
    if(joinStatus === null ||
        joinStatus === undefined ||
        !userId ||
        !communityId
    ) {
        console.log("missing required data to mutate");
        return
    }

    if(joinStatus) {
        const { error } = await supabase.from("joined_communities").delete().eq("user_id", userId).eq("community_id", communityId);
        if(error) throw new Error(error.message);
    } else {
        const { error } = await supabase.from("joined_communities").insert({community_id: communityId, user_id: userId});
        if(error) throw new Error(error.message);
    }
}


const Community = () => {
    const params = useParams();
    const [showDesc, setShowDesc] = useState<boolean>(false);
    const { session } = useAuthContext();
    const toLogin = useNavigate();
    const queryClient = useQueryClient();
    
    const { data: communityData, isLoading: communityDataLoading} = useQuery<CommunityData | null>({
        queryFn: () => getCommunityDataFromName(params.communityName),
        queryKey: ["communityData"]
    });

    const { data: communityPosts, isLoading: postsLoading} = useQuery<PostData[] | null>({
        queryFn: () => getCommunityPosts(communityData?.id),
        queryKey: ["communityPosts", communityData?.id]
    });

    const { data: isJoined, isLoading: isJoinedLoading } = useQuery<boolean | null>({
        queryFn: () => {
            if(params.communityName && session) {
                return getJoinStatusFromName(session?.user.id, communityData?.id)
            }
            else return false;
        },
        queryKey: ["joinStatus", communityData?.name]
    });


    const { mutate: join, isPending } = useMutation({
        mutationFn: () => mutateJoinCommunity(isJoined!, session!.user.id, communityData!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["joinStatus", communityData?.name]});
        }
    })


    // console.log(communityData?.description)

    // useEffect(()=>{
    //     console.log(communityPosts);
    //     console.log(communityPosts);
    // }, [communityPosts])

    return (
        <div className="w-full h-screen fira-sans-regular">
            {communityDataLoading ? 
                <>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[50px]"/>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                </> :
                <>
                <div className={`w-full h-full max-h-fit flex items-center border-[#3F7CAC]
                                md:flex-row md:border-[0] md:m-[0]
                                max-sm:flex-col max-sm:w-screen max-sm:border-t-1 max-sm:mt-[10px]
                                sm:flex-col sm:border-t-1 sm:mt-[10px] pb-[10px]`}>
                    <div className="w-full flex flex-col">
                        <div className="bg-linear-to-r from-blue-500 to-sky-500 top-0 left-0 w-full h-[75px] z-[-1]" />
                        <div className="w-full h-fit flex flex-row relative">
                            <img src={communityData?.image} 
                            className="w-fit h-[80px] rounded-full mr-[20px] aspect-square 
                                    absolute top-[-40px] left-[20px] bg-white"
                            />
                            <div className="w-full h-fit flex flex-row justify-between pr-[20px] mt-[10px]">
                                <h1 className="text-[19px] w-full fira-sans-bold whitespace-pre-wrap self-end ml-[120px] lg:ml-[120px]">{communityData?.name}</h1>
                                <button className={`w-fit h-fit whitespace-nowrap cursor-pointer rounded-full px-3 ${isJoined ? "bg-blue-500" : "bg-gray-300"} ${isJoinedLoading ? "hidden" : "block"}`}
                                        disabled={(isJoinedLoading || isPending) ? true : false }
                                        onClick={() => {
                                            if(!session) {
                                                toLogin("/Login");
                                            } else {
                                                return join()
                                            }
                                        }}
                                >
                                    {isJoined ? "Joined" : "+ Join"}
                                </button>
                            </div>
                            
                        </div>
                    </div>
                    <div className="w-full h-fit flex flex-col items-center justify-center md:hidden">
                        <div className={`w-full text-center transition-all transition-discrete duration-150 mt-[20px] ease ${showDesc ? "opacity-100 h-[100%]" : "opacity-0 select-none pointer-events-none h-[0px]"}`}>
                        {communityData?.description}
                        </div>
                        <button className="w-fit h-fit mt-[10px] text-[14px] text-blue-700 cursor-pointer mb-[10px]" 
                        onClick={() => setShowDesc(prev => !prev)}> 
                            {showDesc ? "Hide" : "Show description"}
                            <ChevronBarDown className={`w-fit h-[15px] mx-auto ${showDesc ? "rotate-180" : null}`}/>
                        </button>
                    </div>
                </div>
                <div className="w-full h-fit flex flex-col items-center ">
                    {postsLoading ? 
                        <>
                            <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[50px]"/>
                            <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                            <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                        </> 
                        :
                        communityPosts && communityPosts.length > 0 ?
                            communityPosts.map((post) => <Post data={post} key={post.id}/>)    
                            :
                            <div className="w-full h-fit mt-[20px] text-center">There are no posts to show!</div>
                    }
                </div>
                </>
            }
        </div>
    )
}

export default Community;