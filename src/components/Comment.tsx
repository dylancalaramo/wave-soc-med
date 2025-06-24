import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CommentTreeType, CommentType } from "./CommentsSection";
import { useCallback, useRef, useState } from "react";
import { supabase } from "../supabase-client";
import "../assets/Animations.css";
import { Link, useNavigate } from "react-router";
import { useAuthContext } from "../context/AuthProvider";
import { Hourglass } from "react-bootstrap-icons";
import AnonIcon from "../assets/Anonymous.svg?react";

const Comment = ({commentData} : {commentData: CommentTreeType}) => {
    const commentDate = useRef<string | null>(null);
    commentDate.current = new Date(Date.parse(commentData!.created_at)).toLocaleDateString("en-US", {hour:"numeric", minute:"numeric"});
    const [showReplyField, setShowReplyField] = useState<boolean>(false);
    const [showReplies, setShowReplies] = useState<boolean>((commentData.children && commentData.children.length > 0) ? true: false);
    const [newReply, setNewReply] = useState<string>("");
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const { session } = useAuthContext();
    const toLogin = useNavigate();
    const queryClient = useQueryClient();

    const fetchParentCommentUserData = useCallback(async(): Promise<{user_name: string, profile_picture_url: string}> => {
        const { data, error } = await supabase.from("profiles").select("user_name, profile_picture_url").eq("id", commentData.user_id).single();
        if(error) throw new Error(error.message);
        
        return data
    }, [commentData.user_id])

    const { data: parentCommentUserData, isFetched} = useQuery({
        queryFn: fetchParentCommentUserData,
        queryKey: ["parentCommentUserData", commentData.user_id],
        refetchOnWindowFocus: false
    })

    const postReply = useCallback(async({comment_text, parent_comment_id, user_id} : CommentType) => {
        if(!user_id) throw new Error("Please login before making a comment");
        if(!comment_text) throw new Error("Your comment must not be empty");

        const { error } = await supabase.from("post_comments").insert({
            post_id: commentData.post_id,
            comment_text: comment_text,
            user_id: user_id,
            parent_comment_id: parent_comment_id
        })

        if(error) throw new Error(error.message);
     }, [commentData.post_id])


    const { mutate, isPending } = useMutation({
        mutationFn: ({comment_text, parent_comment_id, user_id} : CommentType) => 
            postReply({
                comment_text, 
                parent_comment_id, 
                user_id, 
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["comments", commentData.post_id]});
            queryClient.invalidateQueries({queryKey: ["commentsCount", commentData.post_id]});
            setNewReply("");
            setShowReplyField(false);
            setShowReplies(true);
            textAreaRef.current!.style.height = "50px";
            console.log(commentData.children);
        }
    })

    const handleSubmit = useCallback((e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!newReply || !session) return

        mutate({
            comment_text: newReply, 
            parent_comment_id: commentData.id, 
            user_id: session?.user.id, 
        })
    }, [newReply, session, mutate, commentData.id])

    const handleReplyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if(textAreaRef.current instanceof Node) {
            textAreaRef.current.style.height = "50px";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }    
        setNewReply(e.target.value)
    },[])
    
    return (
        <div className="w-full h-fit flex flex-col mb-[10px] bg-blue-50 p-2 rounded-lg">
            {/* Commenter info*/}
            <header className="w-fit h-[20px] my-[10px]">
                {!isFetched ? 
                    <div className="loading-bg-anim w-[100px] h-[35px] rounded-lg"/>
                    :
                    <Link
                        to={`Profile/${parentCommentUserData? parentCommentUserData.user_name: ""}`}
                        className="flex flex-row w-fit items-center mr-[20px]"
                    >
                        {parentCommentUserData?.profile_picture_url ?
                            <img src={parentCommentUserData? parentCommentUserData.profile_picture_url : ""} 
                                className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]"
                            /> :
                            <AnonIcon className="w-[30px] h-[30px] border-1 rounded-full border-sky-300 mr-[10px]"/>
                        }
                        <span className="leading-none text-[15px] mr-[10px]">{parentCommentUserData? parentCommentUserData.user_name: ""}</span>
                        <span className="leading-none text-[12.5px] text-gray-500">
                            {commentDate.current}
                        </span>
                    </Link>
                }
            </header>
            {/* Comment text*/}
            <section className="w-full h-fit mt-[5px] flex">
                <div className="w-full h-fit flex items-center whitespace-pre-line wrap-anywhere">
                    {commentData.comment_text}
                </div>
            </section>
            {/* Reply section*/}
            <section>
                <div className="w-fit h-fit flex flex-row gap-3 items-center">
                    <button className={`text-[13px] cursor-pointer ${!showReplyField ? "text-blue-500": "text-red-500"}`}
                        onClick={() => {
                            if(!session) toLogin("/Login", {replace: false})
                            setShowReplyField(prev => !prev)
                        }}>
                    {!showReplyField ? "Reply" : "Cancel"}
                    </button>
                    {commentData.children && commentData.children.length > 0 &&
                        <button className={`text-[13px] cursor-pointer ${!showReplies ? "text-blue-500": "text-green-500"}`}
                            onClick={() => {
                                setShowReplies(prev => !prev)
                            }}>
                            {!showReplies ? "Show replies" : "Hide Replies"}{` (${commentData.children.length})`}
                        </button>
                    }
                </div>
                {showReplyField &&
                    <form onSubmit={handleSubmit}
                        className="w-[50%] flex flex-row rounded-2xl inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400"
                    >
                        <textarea placeholder="Add a reply" 
                            value={newReply}
                            onChange={handleReplyChange}
                            className="w-full h-[50px] p-[10px] bg-gray-300 rounded-s-2xl inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400
                                        resize-none focus:outline-none overflow-hidden"
                            ref={textAreaRef}
                            id="content"
                            maxLength={400}>
                        </textarea>
                        <button className={`w-fit min-w-[50px] px-2 bg-blue-100 rounded-e-2xl 
                                inset-shadow-blue-200 
                                cursor-pointer inset-shadow-[0px_-3px_0px_0px] transition-all duration-200
                                disabled:bg-gray-400 disabled:cursor-not-allowed disabled:inset-shadow-gray-500 disabled:inset-shadow-[0px_3px_0px_0px] `}
                                type="submit"
                                disabled={isPending ? true : false}
                        >
                            {isPending ? <Hourglass className="m-auto fill-yellow-100 h-[20px] w-fit"/> : "Send"}
                        </button>
                    </form>
                }
                {showReplies &&
                    <div className="w-full h-fit border-l-2 border-blue-500 ml-[5px] mt-[10px]">
                        <div className="w-full h-fit flex flex-col justify-center pl-[5px]">
                            {commentData.children!.map((comment) => <Comment key={comment.id} commentData={comment} />)}
                         </div> 
                    </div>
                }
            </section>
        </div>
    )
}

export default Comment