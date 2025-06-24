import Handshake from "../assets/Handshake.svg?react"
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../context/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import '../assets/Animations.css'
import { Chat } from "react-bootstrap-icons";

const PostButtons = ({postId} : {postId: number}) => {
    const toLogin = useNavigate();
    const { session } = useAuthContext();
    const [isHandshaked, setIsHandshaked] = useState<boolean>(false);
    const queryClient = useQueryClient();

    const fetchNumberOfComments = useCallback(async():Promise<{id: number}[]> => {
        //get all comments ids of the post by selecting all comment ids that is under the postId prop  
        const { data, error } = await supabase.from("post_comments").select('id').eq("post_id", postId)
        if(error) throw new Error(error.message);
        return data;
    },[postId])

    const { data: commentsData, isFetched: commentCountLoading } = useQuery<{id: number}[]>({
        queryFn: fetchNumberOfComments,
        queryKey: ["commentsCount", postId]
    }) 

    //function of query to get all the users that handshaked the post
    const getHandshakes = useCallback(async():Promise<{user_id : string}[]> => {
        const { data, error } = await supabase.from("post_handshakes").select("user_id").eq("post_id", postId);
        if(error) throw new Error(error.message);
        return data as {user_id : string}[];
    }, [postId])

    const { data: handShakeData, isFetched: handshakeLoading, isRefetching } = useQuery<{user_id : string}[]>({
        queryFn: getHandshakes,
        queryKey: ["handshakes", postId],
        refetchOnWindowFocus: false,
        // refetchInterval: 15000
    })

    // set the isHandshaked state of component to true or false
    // if the queried data from getHandshakes contains the id of the user session 
    useEffect(() => {
        let foundHandshake = false;
        if(handShakeData){
            handShakeData.map((handshake) => {
                if(handshake.user_id === session?.user.id) {
                    foundHandshake = true;
                }
            })
        }

        if(foundHandshake) {
            setIsHandshaked(true);
        } else {
            setIsHandshaked(false);
        }
        // console.log(handShakeData);
        // console.log(isHandshaked);
    }, [handShakeData, isHandshaked, session?.user.id])

    const setHandshake = useCallback(async(postId: number, userId: string) => {
        //check if user already voted
        const { data: foundHandshake, error: findIdError} = await supabase.from("post_handshakes").select("user_id").eq("post_id", postId).eq("user_id", session?.user.id).maybeSingle();
        if(findIdError) throw new Error(findIdError.message);

        //if user has already handshaked post
        if(foundHandshake) {
            const { error } = await supabase.from("post_handshakes").delete().eq("post_id", postId).eq("user_id", session?.user.id);
            if (error) throw new Error(error.message)

        } else {
            const { error } = await supabase.from("post_handshakes").insert({post_id: postId, user_id: userId});
            if(error) throw new Error(error.message);
        } 
    }, [session?.user.id])

    const { mutate: postHandshake, isPending } = useMutation({
        mutationFn: () => {
            if(!session) {
                toLogin("/Login", {replace: false});
            }
            return setHandshake(postId, session!.user.id)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["handshakes", postId]})
        }
    })

    return (
        <div className="w-fit h-[30px] flex flex-row gap-[10px]">
            {!handshakeLoading ? 
                <div className="loading-bg-anim w-[50px] h-full rounded-full px-2 py-1"></div> 
                :
                <button className={`w-fit h-full px-2 py-1 cursor-pointer transition-color duration-150 ease-out
                                  rounded-full flex flex-row justify-center disabled:bg-gray-500 disabled:text-white disabled:cursor-not-allowed ${isHandshaked ? "bg-blue-600 text-white fill-white" : "bg-gray-200"}`}
                    id="like-btn"
                    onClick={() => {return postHandshake()}}
                    disabled={isPending || isRefetching ? true : false}
                >
                    <span className={`select-none pointer-events-none ${handShakeData? "mr-[5px]" : null}`}>{handShakeData?.length}</span>
                    <Handshake className={`w-fit h-full select-none pointer-events-none ${isHandshaked || isPending || isRefetching ? "fill-white" : null}`}/>
                </button>
            }
            {!commentCountLoading  ? 
                <div className="loading-bg-anim w-[50px] h-full rounded-full px-2 py-1"></div> 
                :
                <button className={`w-fit h-full px-2 py-1 cursor-pointer
                                  rounded-full flex flex-row justify-center bg-gray-200`}
                >
                    <span className={`select-none pointer-events-none mr-[5px]`}>{commentsData?.length || 0}</span>
                    <Chat className="w-fit h-[20px] my-auto select-none pointer-events-none fill-black"/>
                </button>
            }
        </div>
    )
}

export default PostButtons