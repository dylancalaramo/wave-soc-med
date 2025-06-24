import { useQuery } from "@tanstack/react-query";
import type { PostData } from "./interfaces/Interface";
import { supabase } from "../supabase-client";
import { useCallback, useState } from "react";
import '../../src/assets/Animations.css';
import { Link } from "react-router";
import ReactPlayer from "react-player";
import { usePostDetailsContext } from "../context/PostDetailsContext";
import PostButtons from "./PostButtons";
import type { CommunityData } from "./CommunityList";
import { ChevronCompactRight } from "react-bootstrap-icons";
import AnonIcon from "../assets/Anonymous.svg?react"

// eslint-disable-next-line react-refresh/only-export-components
export const getCommunityDataFromId = async(communityId : number | null):Promise<CommunityData | null> => {
    if(!communityId) return null;
    // console.log(communityId)
    const { data } = await supabase.from("communities").select("name, image").eq("id", communityId).single();
    return data as CommunityData
}

const Post = (props: {data: PostData}) => {
    const postDate = useState(new Date(Date.parse(props.data.created_at)).toLocaleDateString("en-US", {hour:"numeric", minute:"numeric"}));
    const { setPostData } = usePostDetailsContext();

    // const fetchNumberOfComments = useCallback(async():Promise<{id: number}[]> => {
    //     const { data, error } = await supabase.from("profiles").select('id').eq("id", props.data.posterUID)
    //     // console.log(props.data.posterUID);
    //     // console.log(props.data.posterUID);
    //     // console.log(data);
    //     if(error) throw new Error(error.message);
    //     return data;
    // },[props.data.posterUID])

    // const { data: commentsData } = useQuery<{id: number}[]>({
    //     queryFn: fetchNumberOfComments,
    //     queryKey:["commentsData", props.data.id]
    // }) 

    const validClicks = useCallback((elementId: string) => {
        let isValid = true;
        const invalidClicks = ["like-btn", "community-id"];
        invalidClicks.forEach((id) => {
            if(elementId.includes(id)) isValid = false
        })

        return isValid
    }, [])

    const { data: communityData } = useQuery({
        queryFn: () => getCommunityDataFromId(props.data.community_id),
        queryKey: ["community", props.data.community_id]
    })
    
    // useEffect(() => {
    //     console.log(communityData);
    //     console.log(props.data.community_id);
    // }, [communityData])

    const fetchPosterData = useCallback(async():Promise<{user_name: string, profile_picture_url: string}> => {
        const { data, error } = await supabase.from("profiles").select('user_name, profile_picture_url').eq("id", props.data.posterUID).single()
        // console.log(props.data.posterUID);
        // console.log(props.data.posterUID);
        // console.log(data);
        if(error) throw new Error(error.message);
        return data;
    },[props.data.posterUID])
    

    const { data: posterData, isLoading: posterDataLoading } = useQuery<{user_name: string, profile_picture_url: string}>({
        queryFn: fetchPosterData,
        queryKey:["posterData", props.data.posterUID]
    }) 

    const handlePostDetail = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        console.log(e.target)
        if(e.target instanceof HTMLElement && validClicks(e.target.id) ) {
            setPostData({
                postData: props.data,
                posterData: {
                    user_name: posterData!.user_name,
                    profile_picture_url: posterData!.profile_picture_url
                }
            })
        }  
    },[posterData, props.data, setPostData, validClicks])

    return (
        <div className="w-full m-auto h-fit border-t border-[#3F7CAC]">
            <div className="w-[100%] h-fit m-auto hover:bg-sky-50 hover:shadow-md shadow-blue-100 cursor-pointer p-3 my-[10px] rounded-lg transition-all duration-300 md:w-[80%]"
                onClick={(e) => handlePostDetail(e)}
                id="post-boundary"
            >
                <header className="w-[80%] h-fit mx-auto flex flex-col">
                    {posterDataLoading ?
                        <div className="loading-bg-anim w-[90%] max-w-[200px] h-[15px] my-[10px] rounded-md" />
                        :
                        <div className="flex flex-row items-center">
                            <Link
                                to={`/Profile/${posterData? posterData.user_name: ""}`}
                                className="flex flex-row w-fit items-center"
                            >
                                {(posterData && posterData?.profile_picture_url !== "") ?
                                    <img src={posterData!.profile_picture_url} 
                                    className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]"
                                    />
                                    :
                                    <AnonIcon className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]" />
                                }
                                <span className="leading-none text-[15px] mr-[10px]">{posterData ? posterData.user_name: ""}</span>
                                <span className="leading-none text-[13px] text-gray-500">
                                    {postDate[0]}
                                </span>
                            </Link>
                            {communityData ? 
                                <Link className="flex flex-row items-center max-w-[60%]"
                                    to={`/Communities/${communityData.name}`}
                                >
                                    <ChevronCompactRight className="mx-[10px]"/>
                                    <div 
                                        className="flex flex-row items-center">
                                        <img src={communityData.image} 
                                            className="w-[30px] h-[30px] rounded-full border-blue-300 mr-[10px]"
                                            id="community-id"
                                        />
                                        <span className="text-[15px]"
                                        id="community-id"
                                        >
                                            {communityData.name}
                                        </span>
                                    </div>
                                </Link>
                                : 
                                null
                            }
                        </div>
                        }
                    <h2 className="text-[20px] select-none mt-[10px] whitespace-pre-line">{props.data.title}</h2>
                </header>
                <section className="w-[80%] min-w-[60%] h-fit flex flex-col items-center justify-center m-auto mt-[10px]">
                    {props.data.mediaURL ?
                        <div className="w-full h-fit flex flex-col items-center justify-center rounded-lg border-blue-100 border-2 picture-container">
                            {props.data.mediaType === 'image' ? 
                            <img src={props.data.mediaURL} 
                                className="w-fit h-fit max-h-[300px] aspect-auto"
                            />
                            :
                            <div id="video"
                                className="w-full h-fit select-none pointer-events-none aspect-video">
                                <ReactPlayer 
                                    url={props.data.mediaURL}
                                    width='100%'
                                    height='100%'
                                    controls={true}
                                    id="video"
                                />
                            </div>
                            }
                        </div> :
                        null
                    }
                    {props.data.content.length !== 0 && 
                    <div className={`w-[100%] h-fit p-2 rounded-lg m-auto whitespace-pre-line break-all ${!props.data.mediaType ? "bg-gray-100" : "mt-[5px]"}`}>
                        {props.data.content}
                    </div>
                    }
                </section>
                <div className="w-[80%] h-fit mx-auto mt-[10px]">
                    <PostButtons postId={props.data.id}/>
                </div>
            </div>
        </div>
    )
}

export default Post