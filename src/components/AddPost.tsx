import { useReducer, useRef } from "react";
import ReactPlayer from "react-player";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import type { AddPostState } from "./interfaces/Interface";
import { useAuthContext } from "../context/AuthProvider";
import { X } from "react-bootstrap-icons";
import { useParams } from "react-router";
import type { CommunityData } from "./CommunityList";
import { getCommunityDataFromName } from "../pages/Community";

interface AddPostProps {
    setShowAddPost: React.Dispatch<React.SetStateAction<boolean>>;
    setToastMessage: React.Dispatch<React.SetStateAction<string>>;
    setShowToast: React.Dispatch<React.SetStateAction<boolean>>;
    posterUID: string | undefined;
}

const initialState: AddPostState = {
    title: "",
    content: "",
    mediaType:undefined,
    mediaFile:null,
    displayMedia: undefined,
    community_id: null,
}


const addPostReducer = (state: AddPostState, action: {title?:string, content?: string, type?: string, file?: File}) => {
    switch(action.type) {
        case 'TITLE':
            return Object.assign({}, {...state}, {title: action.title})
        case 'TEXT':
            // console.log(action.text);
            return Object.assign({}, {...state}, {content: action.content})
        case 'MEDIA':
            return action.file ?
                Object.assign({}, {...state}, 
                {
                    mediaType: action.file.type.split("/")[0],
                    mediaFile: action.file,
                    displayMedia: URL.createObjectURL(action.file)
                }) :
                Object.assign({}, {...state}, 
                {
                    mediaType: undefined,
                    mediaFile: undefined,
                    displayMedia: undefined,
                    community_id: null,
                });
        case 'REMOVE':
            return Object.assign({}, {...state}, 
            {
                mediaType: undefined,
                mediaFile: undefined,
                displayMedia: undefined,
                community_id: null,
            })
        default:
            return initialState;
    }
}



const AddPost = (props: AddPostProps) => {
    const [postData, dispatch] = useReducer(addPostReducer, initialState);
    const { session } = useAuthContext();
    //used as a ref for the text area to target it and allow dynamic resizing
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const queryClient = useQueryClient();
    const location = useParams();

    const { data: communityData} = useQuery<CommunityData | null>({
        queryFn: () => getCommunityDataFromName(location.communityName),
        queryKey: ["communityData"]
    });

    // useEffect(() => {
    //     console.log(communityData)
    // },[communityData])

    const uploadPost = async(post : AddPostState) => {
    //method for uploading a post with media must be different from a post without an media
        if(post.mediaFile && post.mediaType) {
            //specify name of media
            const mediaName = `${post.title}-${post.mediaFile.name}-${Date()}`;
            //upload media first
            const { error: mediaUploadError } = await supabase.storage.from("post-media").upload(mediaName, post.mediaFile);
            //if image fails to upload, throw an error
            //this error will return the function
            if (mediaUploadError) throw new Error(mediaUploadError.message);
            //fetch uploaded image url to insert into post data
            const { data: mediaURL } = supabase.storage.from("post-media").getPublicUrl(mediaName);
            //fetched mediaURL will be inserted to the mediaURL column in the posts table 
            // console.log(post.community_id);
            const { data: postData , error: insertPostError } = await supabase.from("posts").insert({
                title: post.title, 
                content: post.content,
                mediaType: post.mediaType,
                mediaURL: mediaURL.publicUrl,
                posterUID: session?.user.id,
                community_id: post.community_id
            });
            // console.log(postData);
            if(insertPostError) {
                throw new Error(insertPostError.message);
            } else {
                return postData;
            }

        } else {
            const { data, error } = await supabase.from("posts").insert({
                title: post.title, 
                content: post.content,
                posterUID: session?.user.id,
                community_id: post.community_id
            });
            
            if(error) {
                throw new Error(error.message);
            } else {
                return data;
            }
        }
    }

    
    const { mutate: addPostMutation, isPending } = useMutation({
        mutationFn: (data: {title: string, mediaType: string | undefined, mediaFile: File | null, content: string, community_id: number | null}) => {
            return uploadPost(data);
        },

        onSuccess:() => {
            props.setShowAddPost(false);
            if(props.setToastMessage) props.setToastMessage("Successfully posted");
            if(props.setShowToast) props.setShowToast(true);
            queryClient.invalidateQueries({queryKey: ["posts"]});
            queryClient.invalidateQueries({queryKey: ["newPosts"]});
            queryClient.invalidateQueries({queryKey:["joinStatus", communityData?.name]});
            queryClient.invalidateQueries({queryKey: ["communityPosts", communityData?.id]});
        },

        onError: (error) => {
            if(props.setToastMessage) props.setToastMessage(error.message);
            if(props.setShowToast) props.setShowToast(true);
        }
    }); 

    // useEffect(() => {
    //     console.log(postData);
    // }, [postData])

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({type: 'TITLE', title: e.target.value})
    }

    const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if(textAreaRef.current instanceof Node) {
            textAreaRef.current.style.height = "100px";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }    
        dispatch({type: 'TEXT', content: e.target.value});
    }

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) {
            dispatch({type: 'MEDIA', file: e.target.files[0]});
        }
    }

    const removeMedia = () => {
        dispatch({type: 'REMOVE'});
    }

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        const title = postData.title;
        const content = postData.content;
        const mediaType = postData.mediaType;
        const mediaFile = postData.mediaFile;
        const community_id = communityData?.id || null;
        addPostMutation({title, content, mediaType, mediaFile, community_id}) 
    }

    const selectPlaceholder = useRef(Math.floor(Math.random() * 5));
    const placeholderTextArray = [
        "What's up doc?",
        "Wanna cook?",
        "Share something",
        "Say hi and Wave",
        "What do you have in mind?"
    ]
    
    return (
        <form className="w-fit h-fit min-w-[500px] p-[10px]
            flex flex-col items-center justify-center 
            antialiased fira-sans-regular
            bg-white border-[#3F7CAC] border-1
            shadow-[5px_5px_1px_1px] shadow-blue-300"
            onSubmit={handleSubmit}
        >
            <div className="w-full flex flex-row justify-space-between">
                <h1 className="w-full h-full text-[20px] ml-[5px] flex flex-row items-center justify-between gap-1.5 truncate pr-[15px]">
                    <span>Create a post</span>
                    {location.communityName ?
                        <div className="max-w-[60%] flex flex-row items-center gap-1 select-none cursor-normal text-[15px]">
                            <span>Post to: </span>
                            <img src={communityData?.image}
                                className="w-fit h-[40px] border-2 border-[#3F7CAC] aspect-square rounded-full"
                            ></img>
                            <span>{communityData?.name}</span>
                        </div>
                        :
                        null
                    }
                </h1>
                <button className="w-[25px] h-[25px] bg-red-400 flex items-center justify-center rounded-full ml-auto"
                        id="close-btn">
                    <X className="w-[25px] h-[25px] select-none pointer-events-none fill-white" />
                </button>
            </div>
            <input type="text"
                value={postData.title}
                className="w-[90%] max-w-[400px] p-[10px]
                rounded-2xl bg-gray-200
                inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400
                focus:outline-none overflow-hidden mt-[10px]"
                onChange={handleTitleChange}
                placeholder="Title" 
                id="title"
                required
            />
            {/*Text area elememt for post content*/}
            <textarea placeholder={placeholderTextArray[selectPlaceholder.current]} 
                    value={postData.content}
                    onChange={handleTextArea}
                    className="w-[90%] max-w-[400px] p-[10px]
                                resize-none rounded-2xl bg-gray-300
                                inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400
                                focus:outline-none overflow-hidden mt-[10px]"
                    ref={textAreaRef}
                    id="content"
                    maxLength={2000}>
            </textarea>
            {/*Display media if postData.mediaFile is not null */}
            {postData.mediaType ?
                postData.mediaType === 'image' ?
                    <img src={postData.displayMedia} 
                        className="w-fit h-fit max-w-[250px] 
                        aspect-auto border-sky-100 border-1 rounded-md
                        shadow-blue-500 shadow-xs mt-[10px]"/>
                    : 
                    <div className="w-fit max-w-[400px] p-[25px] h-fit
                        border-sky-100 border-1 rounded-lg 
                        shadow-blue-500 shadow-xs mt-[10px]"
                    >
                        <ReactPlayer 
                            id='display-media'
                            url={postData.displayMedia}
                            controls={true}
                            width='100%'
                            height='100%'
                        />
                    </div> :
                null
            }

            {!postData.mediaType ?
                <label className="w-fit h-[50px] 
                        flex items-center justify-center
                        rounded-full cursor-pointer 
                        mt-[10px] px-[15px]
                        bg-gray-200
                        hover:bg-blue-500 hover:text-white transition-all ease duration-200"
                        htmlFor="media">
                    Add an Image/Video  
                    <input 
                        type="file"
                        className="hidden"
                        accept="image/*, video/*"
                        id="media"
                        onChange={handleMediaUpload}
                    >
                    </input>
                </label> :
                <button
                    onClick={removeMedia}
                    className="w-[100px] h-[50px] bg-gray-200 rounded-full cursor-pointer mt-[10px] hover:bg-blue-500 hover:text-white transition-all ease duration-200"
                >
                    Remove
                </button>
            }
            <div className="w-[80%] flex flex-row justify-between">
                <button 
                    type="submit"
                    className={`w-[100px] h-[50px] bg-gray-200 rounded-full mx-auto mt-[10px] ${!postData.title || isPending ? "bg-gray-300 cursor-not-allowed" : "hover:bg-sky-500 hover:text-white cursor-pointer"} transition-all ease duration-200
                    `}
                    disabled={!postData.title || isPending ? true : false}
                >
                    Submit
                </button>
            </div>
        </form>
    )
}

export default AddPost