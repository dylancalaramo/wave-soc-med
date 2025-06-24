import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "../context/AuthProvider";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import Comment from "../components/Comment"
import { Hourglass } from "react-bootstrap-icons";
import "../assets/Animations.css";

interface CommentSectionProps {
    postId: number;
}

export interface CommentType {
    comment_text: string;
    parent_comment_id?: number | null;
    user_id: string | null;
}

interface CommentQueryType extends CommentType {
    post_id: number;
    id: number;
    created_at: string;
}

export interface CommentTreeType extends CommentQueryType {
    children?: CommentQueryType[];
}

const CommentSection = ({postId} : CommentSectionProps) => {
    const [newComment, setNewComment] = useState<string>("");
    const [commentTree, setCommentTree] = useState<CommentTreeType[] | null>(null);
    const { session } = useAuthContext();
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const queryClient = useQueryClient();
    

    //function of query to get all the handshakes of the post
    const getComments = useCallback(async():Promise<CommentQueryType[]> => {
        const { data, error } = await supabase.from("post_comments").select("*").eq("post_id", postId).order("created_at", {ascending: true});
        if(error) throw new Error(error.message);
        return data as CommentQueryType[];
    }, [postId])

    const { data: fetchedComments } = useQuery<CommentQueryType[]>({
        queryFn: getComments,
        queryKey: ["comments", postId],
        refetchOnWindowFocus: false,
        // refetchInterval: 15000
    })

    useEffect(() => {
        if(fetchedComments) setCommentTree(createCommentTree(fetchedComments))
    }, [fetchedComments])

    const createCommentTree = (flatComments: CommentQueryType[]): (CommentTreeType[]) => {
        const map = new Map<number, CommentQueryType & { children? : CommentQueryType[] }>();
        const roots: (CommentQueryType & { children?: CommentQueryType[] })[] = [];

        //set all queried comments in a map with their ids as keys for easier referencing
        flatComments.forEach((comment) => {
            map.set(comment.id, {...comment, children: []});
        })

        flatComments.forEach((comment) => {
            //check if currently iterated comment has a parent comment by checking the parent_comment_id variable
            if(comment.parent_comment_id) {
                //reference the parent by getting the comment of the parent via the parent_comment_id
                const parent = map.get(comment.parent_comment_id);
                if(parent) {
                    //pass the currently iterated comment as a child comment to the reference parent
                    //by passing the info of the current comment to the parent entry
                    parent.children!.push(map.get(comment.id)!);
                }
            } else {
                //null comment.parent_comment_id means that the comment is a root comment
                roots.push(map.get(comment.id)!);
            }
        })
        // console.log(map);
        // console.log(roots);
        return roots
    }

    const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if(textAreaRef.current instanceof Node) {
            textAreaRef.current.style.height = "50px";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }    
        setNewComment(e.target.value)
    }, [])

    const postComment = useCallback(async({comment_text, parent_comment_id, user_id} : CommentType) => {
        if(!user_id) throw new Error("Please login before making a comment");
        if(!comment_text) throw new Error("Your comment must not be empty");

        const { error } = await supabase.from("post_comments").insert({
            post_id: postId,
            comment_text: comment_text,
            user_id: user_id,
            parent_comment_id: parent_comment_id || null
        })

        if(error) throw new Error(error.message);
     }, [postId])

    const { mutate, isPending } = useMutation({
        mutationFn: ({comment_text, parent_comment_id, user_id} : CommentType) => 
            postComment({
                comment_text, 
                parent_comment_id, 
                user_id, 
            }), 
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["comments", postId]});
            queryClient.invalidateQueries({queryKey: ["commentsCount", postId]});
            setNewComment("");
            textAreaRef.current!.style.height = "50px";
        }
    })

    const handleSubmit = useCallback((e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!newComment || !session) return

        mutate({
            comment_text: newComment, 
            parent_comment_id: null, 
            user_id: session?.user.id, 
        })
    }, [newComment, mutate, session])

    return (
        <>
            <div className="w-full h-fit mt-[10px]">
                {session ?
                    <form onSubmit={handleSubmit}
                        className="flex flex-row rounded-2xl inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400">
                        <textarea placeholder="Add a comment" 
                            value={newComment}
                            onChange={handleCommentChange}
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
                                disabled={!newComment || isPending ? true : false}
                        >
                            {isPending ? <Hourglass className="m-auto fill-yellow-100 h-[20px] w-fit"/> : "Send"}
                        </button>
                    </form>
                    :
                    <div className="w-full h-fit mx-auto flex flex-row justify-center">You must be signed in to comment! <Link to="/Login" className="ml-[10px] text-blue-500">Sign In</Link></div>
                }
            </div>
            {/*Display comments*/}
            <div>
                <hr className="w-full h-fit border-gray-300 border-t-2 mt-[10px]"/>
                <h2 className="mt-[10px]">Comments</h2>
                <div className="w-full h-fit">
                    {
                        commentTree ? 
                            commentTree.length === 0 ? 
                                <div className="mt-[10px] text-center">There are no comments. Be the first to make one!</div> 
                                :
                                <div className="w-full h-fit flex flex-col justify-center">
                                    {commentTree.map((comment) => <Comment key={comment.id} commentData={comment} />)}
                                </div> 
                            :
                            <div className="loading-bg-anim w-full h-[50px]"></div>
                    }
                </div>
            </div>
        </>
    )
} 

export default CommentSection