import { useCallback, useState, type SetStateAction } from "react";
import { X } from "react-bootstrap-icons";
import { useAuthContext } from "../context/AuthProvider";
import { supabase } from "../supabase-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const CreateCommunity = ({setShowCreateCommunity} : {setShowCreateCommunity: React.Dispatch<SetStateAction<boolean>>}) => {
    const [communityName, setCommunityName] = useState<string>("");
    const [communityDescription, setCommunityDescription] = useState<string>("");
    const [communityPicture, setCommunityPicture] = useState<File | null>(null);
    const { session } = useAuthContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // useEffect(() => {
    //     console.log(communityPicture);
    // }, [communityPicture])

    const createCommunity = useCallback(async({communityName, communityDescription, communityPicture} : {communityName: string, communityDescription: string, communityPicture: File}) => {
        if(!session) {
            alert("You must be logged in to continue");
            throw new Error("You must be logged in to continue");
        }
        if(!communityName || !communityDescription || !communityPicture) {
            alert("Required information is missing (community name, description, image)");
            throw new Error("Required information is missing (community name, description, image)");
        }

        const mediaName = `${communityName}-${communityPicture.name}`;
        const { error: pictureError } = await supabase.storage.from("community-display-pictures").upload(mediaName, communityPicture);
        if(pictureError) throw new Error(pictureError.message);

        const { data: mediaURL } = supabase.storage.from("community-display-pictures").getPublicUrl(mediaName);

        const { error } = await supabase.from("communities").insert({
            name: communityName,
            description: communityDescription,
            image: mediaURL.publicUrl
        })

        if(error) {
            console.error("error");
            throw new Error(error.message);
        }
     }, [session])

    const { mutate, isPending } = useMutation({
        mutationFn: ({communityName, communityDescription, communityPicture} : {communityName: string, communityDescription: string, communityPicture: File}) => 
            createCommunity({
                communityName: communityName,
                communityDescription: communityDescription,
                communityPicture: communityPicture,
            }), 
        onSuccess: () => {
            setShowCreateCommunity(false);
            queryClient.invalidateQueries({queryKey:["communities"]});
            navigate(`/Communities/${communityName}`);
        }
    })

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(communityDescription.length > 0 && communityName.length > 0 && communityPicture) {
            mutate({communityName, communityDescription, communityPicture});
        }
    }

    const handleSubmitPicture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0].type.includes("image")) {
            setCommunityPicture(e.target.files[0]);
        }
    }

    const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textArea = document.getElementById("content");
        setCommunityDescription(e.target.value);
        textArea!.style.height = "100px";
        textArea!.style.height = `${textArea!.scrollHeight}px`;
    }

    return (
        <form className="w-fit h-fit min-w-[500px] p-[10px]
            flex flex-col justify-center items-center
            antialiased fira-sans-regular
            bg-white border-[#3F7CAC] border-1
            shadow-[5px_5px_1px_1px] shadow-blue-300"
            onSubmit={handleSubmit}
        >
            <div className="w-full flex flex-row justify-space-between">
                <h1 className="w-full h-full text-[20px] ml-[5px]">Create a community</h1>
                <button className="w-[25px] h-[25px] bg-red-400 flex items-center justify-center rounded-full ml-auto"
                                                    id="close-btn">
                    <X className="w-[25px] h-[25px] select-none pointer-events-none fill-white" />
                </button>
            </div>
    
            {/*Community name*/}
            <div className="flex flex-row w-[90%] items-center h-[50px] mt-[15px]">
                {communityPicture &&
                    <img src={URL.createObjectURL(communityPicture)} 
                        className="w-fit h-full border-2 border-[#3F7CAC] aspect-square rounded-full my-auto mr-[10px]"
                        />
                }
                <input className="w-full h-full p-[10px]
                                    rounded-2xl bg-gray-300
                                    inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400
                                    focus:outline-none overflow-hidden" 
                    type="text" maxLength={100} placeholder="Community name" 
                    value={communityName}
                    onChange={(e) => {setCommunityName(e.target.value)}}
                    required/>
            </div>

            {/*Community description*/}
            <div className="flex flex-col w-[90%] h-fit">
                <textarea placeholder="Community Description" 
                    value={communityDescription}
                    onChange={(e) => handleTextArea(e)}
                    className="w-full h-[100px] p-[10px]
                                resize-none rounded-2xl bg-gray-300
                                inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400
                                focus:outline-none overflow-hidden mt-[10px]"
                    id="content"
                    maxLength={500}
                    required>
                </textarea>
            </div>

            {/*Community display picture*/}
            {!communityPicture ?
                <label className="w-fit h-[50px] 
                        flex items-center justify-center
                        rounded-full cursor-pointer 
                        mt-[10px] px-[15px]
                        bg-gray-200
                        hover:bg-blue-500 hover:text-white transition-all ease duration-200"
                        htmlFor="media">
                    Add an Image
                    <input 
                        type="file"
                        className="hidden"
                        accept="image/*"
                        id="media"
                        onChange={(e) => handleSubmitPicture(e)}
                    >
                    </input>
                </label> :
                <button
                    onClick={() => setCommunityPicture(null)}
                    className="w-fit p-3 h-[50px] bg-gray-200 rounded-full cursor-pointer mt-[10px] hover:bg-blue-500 hover:text-white transition-all ease duration-200"
                    disabled={isPending ? true : false}
                >
                    Remove Image
                </button>
            }
            <button 
                type="submit"
                className={`w-[100px] h-[50px] bg-gray-200 rounded-full mt-[10px] ${!communityName || !communityDescription || !communityPicture || isPending ? "bg-gray-300 cursor-not-allowed" : "hover:bg-sky-500 hover:text-white cursor-pointer"} transition-all ease duration-200
                `}
                disabled={!communityName || !communityDescription || !communityPicture || isPending ? true : false}
            >
                {isPending ? "Creating" : "Create"}
            </button>
        </form>
    )
}

export default CreateCommunity