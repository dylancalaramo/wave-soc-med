import { Link, useNavigate } from "react-router"
import type { PostDetailType } from "./interfaces/Interface"
import { useCallback, useRef } from "react";
import ReactPlayer from "react-player";
import PostButtons from "./PostButtons";
import CommentSection from "./CommentsSection";
import { ChevronCompactRight, X } from "react-bootstrap-icons";
import { useQuery } from "@tanstack/react-query";
import { getCommunityDataFromId } from "./Post";
import AnonIcon from '../assets/Anonymous.svg?react'
import { usePostDetailsContext } from "../context/PostDetailsContext";


const PostDetails = ({post}: {post: PostDetailType}) => {
    const postDate = useRef<string | null>(null);
    const { setPostData } = usePostDetailsContext();
    const navigate = useNavigate();
    postDate.current = post ? new Date(Date.parse(post?.postData.created_at)).toLocaleDateString("en-US", {hour:"numeric", minute:"numeric"}) : "";

    const { data: communityData } = useQuery({
        queryFn: () => getCommunityDataFromId(post.postData.community_id),
        queryKey: ["community", post.postData.community_id]
    })

    const handleNavigate = useCallback(() => {
        setPostData(null);
        navigate(`/Communities/${communityData?.name}`)
    }, [communityData?.name, navigate, setPostData])

    return (
        <div className="w-fit max-w-[1000px] sm:w-screen max-sm:w-screen h-fit p-[10px]
            flex flex-col items-center justify-center 
            antialiased fira-sans-regular
            bg-white border-[#3F7CAC] border-1
            shadow-[5px_5px_1px_1px] shadow-blue-300"
            
        >
            <div className="w-full h-fit flex flex-row justify-space-between">
                <header className="w-full h-fit mx-auto flex flex-col pl-1">
                    <div className="flex flex-row items-center">
                        <Link
                            to={`/Profile/${post.posterData.user_name}`}
                            className="flex flex-row w-fit items-center"
                        >
                            {(post.posterData.profile_picture_url && post.posterData.profile_picture_url !== "") ? 
                                <div>
                                <img src={post.posterData.profile_picture_url} 
                                    className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]"
                                />
                                </div> 
                                :
                                <AnonIcon className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]"/>
                            }
                            <span className="mr-[10px]">{post.posterData.user_name}</span>
                            <span className="leading-none text-[13px] text-gray-500">
                                {postDate.current}
                            </span> 
                        </Link> 
                        {communityData ? 
                            <div className="flex flex-row items-center max-w-[60%] cursor-pointer"
                                onClick={handleNavigate}
                            >
                                <ChevronCompactRight className="mx-[10px]"/>
                                <img src={communityData.image} 
                                className="w-[30px] h-[30px] rounded-full border-blue-300 mr-[10px]"
                                />
                                <span className="text-[15px]">{communityData.name}</span>
                            </div>
                            : 
                            null
                        }
                    </div>
                    <h2 className={`text-[20px] select-none mt-[10px]`}>{post?.postData.title}</h2>
                </header>
                <button className="w-[25px] h-[25px] bg-red-400 flex items-center justify-center rounded-full"
                        id="close-btn">
                    <X className="w-[25px] h-[25px] select-none pointer-events-none fill-white" />
                </button>
            </div>
            <section className="w-fit min-w-[400px] h-fit flex flex-col items-center justify-center mt-[10px]">
                {post?.postData.mediaURL ?
                    <div className="w-full h-fit flex flex-col items-center justify-center rounded-lg border-2 border-blue-100">
                        {post?.postData.mediaType === 'image' ? 
                        <img src={post?.postData.mediaURL} 
                            className="w-fit h-fit max-h-[300px] aspect-auto"
                        />
                        :
                        <div id="video"
                            className="w-full h-fit aspect-video">
                            <ReactPlayer 
                                url={post.postData.mediaURL}
                                width='100%'
                                height='100%'
                                controls={true}
                                id="video"
                            />
                        </div>}
                    </div> :
                    null
                }
                {post?.postData.content.length !== 0 && 
                    <div className={`w-full h-fit p-2 rounded-sm m-auto whitespace-pre-line break-all ${!post.postData.mediaType ? "bg-gray-100" : "mt-[5px]"}`}>
                        {post?.postData.content}
                    </div>
                }
                <div className="w-fit h-fit m-auto flex flex-row items-center mt-[10px]">
                    <PostButtons postId={post? post.postData.id : 0}/>
                </div>
            </section>
            <section className="w-full h-fit mx-auto flex flex-col justify-center">
                <div className="w-full">
                    <CommentSection postId={post.postData.id}/>
                </div>
            </section>
        </div>
    )
}

export default PostDetails