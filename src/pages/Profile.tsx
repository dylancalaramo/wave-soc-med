import { memo, useCallback, useEffect, useState } from "react"
import { Link, useNavigate, useParams} from "react-router"
import { useAuthContext, type UserDataType } from "../context/AuthProvider";
import Logo from '../assets/Wave.svg?react'
import AnonIcon from '../assets/Anonymous.svg?react'
import { supabase } from "../supabase-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "react-bootstrap-icons";
import type { PostData } from "../components/interfaces/Interface";
import Post from "../components/Post";
import ToastMessageBox from "../components/ToastMessageBox";

const fetchUserProfileFromUsername = async(user_name: string | undefined): Promise<UserDataType> => {
    if(!user_name) throw new Error("Username not found");

    const { data, error } = await supabase.from("profiles").select("*").eq("user_name", user_name).single();
    if(error) throw new Error(error.message);

    return data as UserDataType;
}

const fetchPostsFromUsername = async(user_id: string | undefined): Promise<PostData[]> => {
    if(!user_id) throw new Error("Username not found");

    const { data, error } = await supabase.from("posts").select("*").eq("posterUID", user_id);
    if(error) throw new Error(error.message);

    return data as PostData[];
}

const Profile = () => {
    const params = useParams();
    const { signOut, queriedUserData } = useAuthContext();
    const [ showPosts, setShowPosts ] = useState<boolean>(true);
    const [ showEdit, setShowEdit ] = useState<boolean>(false);
    const [ userInput, setUserInput ] = useState<string>("");
    const [ changeUsernameInput, setChangeUsernameInput ] = useState<string>("");
    const [ changeProfilePictureInput, setChangeProfilePictureInput ] = useState<File | null>(null);
    const [ toastMessage, setToastMessage ] = useState<string>("");
    const [ showToast, setShowToast ] = useState<boolean>(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        if(toastMessage && toastMessage !== "") {
            setShowToast(true);
        }
    }, [toastMessage])

    const { data: userProfileData, isLoading: userProfileLoading, isRefetching: userProfileRefetching } = useQuery<UserDataType>({
        queryFn: () => fetchUserProfileFromUsername(params.profileName),
        queryKey: ["profile", params.profileName],
        refetchOnWindowFocus: false
    })

    const { data: userPosts, isLoading: userPostsLoading } = useQuery<PostData[]>({
        queryFn: () => fetchPostsFromUsername(userProfileData?.id),
        queryKey: ["userPosts", userProfileData?.id]
    })

    const changeUsernameFunction = useCallback(async(changeUsernameInput: string) => {
        if(!changeUsernameInput) {
            setToastMessage("New username is invalid");
            throw new Error("New username is invalid");
        }

        //check if username exists first
        const { data: checkUsername, error: checkUsernameError } = await supabase.from("profiles").select("*").eq("user_name", changeUsernameInput).maybeSingle();
        if(checkUsernameError) {
            setToastMessage(checkUsernameError?.message);
            setShowToast(true);
        }
        if(checkUsername) {
            setToastMessage("Username is already taken");
            throw new Error("Username is already taken");
        } else {
            const { error: changeUsernameError } = await supabase.from("profiles").update({user_name: changeUsernameInput}).eq("id", userProfileData?.id)
            if(changeUsernameError) throw new Error(changeUsernameError.message);
        }
    }, [userProfileData?.id])

    const { mutate: changeUsername, isPending: changeUsernamePending } = useMutation({
        mutationFn: () => changeUsernameFunction(changeUsernameInput),
        onSuccess: () => {
            setChangeUsernameInput("");
            setShowEdit(false);
            setShowPosts(true);
            queryClient.invalidateQueries({queryKey: ["profile"]});
            queryClient.invalidateQueries({queryKey: ["userPosts"]});
            queryClient.invalidateQueries({queryKey: ["userData", userProfileData?.id]})
            navigate("/Profile/"+changeUsernameInput, {replace:true});
        }
    })

    const changeProfilePictureFunction = useCallback(async(changeProfilePictureInput: File) => {
        if(!changeProfilePictureInput) {
            setToastMessage("No profile picture found");
            throw new Error("No profile picture found");
        } else {
            // console.log(changeProfilePictureInput.name);
            const profilePictureDirectory = `${userProfileData?.id}/avatar-${Date()}`;
            const { data, error: updateProfilePictureError } = await supabase.storage.from("avatars").update(
                profilePictureDirectory, 
                changeProfilePictureInput,
                {
                    contentType: `image/*`,
                    upsert:true,
                    cacheControl: "0",
                    metadata: {
                        version:"0"
                    }
                }
            );

            console.log(data);
            
            if(updateProfilePictureError) {
                setToastMessage(updateProfilePictureError.message);
                throw new Error(updateProfilePictureError.message)
            }

            const { data: profilePictureURL } = supabase.storage.from("avatars").getPublicUrl(profilePictureDirectory);

            const { error: updateProfilePictureURLError } = await supabase.from("profiles").update({profile_picture_url: profilePictureURL.publicUrl}).eq("id", userProfileData?.id);
            if(updateProfilePictureURLError) {
                setToastMessage(updateProfilePictureURLError.message);
                throw new Error(updateProfilePictureURLError.message)
            }
        }
    }, [userProfileData?.id])

    const { mutate: changeProfilePicture, isPending: changeProfilePicturePending } = useMutation({
        mutationFn: () => changeProfilePictureFunction(changeProfilePictureInput!),
        onSuccess: () => {
            setChangeProfilePictureInput(null);
            queryClient.invalidateQueries({queryKey: ["profile"]});
            queryClient.invalidateQueries({queryKey: ["posts"]});
        }
    })

    const handleProfilePictureSubmit = useCallback((e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        changeProfilePicture();
    }, [changeProfilePicture])

    const handleUsernameUpdate = useCallback((e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        changeUsername();
    }, [changeUsername])

    const handleProfilePictureInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) {
            console.log(e.target.files[0].name);
            setChangeProfilePictureInput(e.target.files[0]);
        }
    }, [])

    const handleUserSearch = useCallback((e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUserInput("");
        setShowPosts(true);
        setShowEdit(false);
        navigate("/Profile/"+userInput);
    }, [navigate, userInput])

    const handleSignOut = useCallback(() => {
        signOut();
        const {data: listener} = supabase.auth.onAuthStateChange((__, session) => {
            if(!session) {
                navigate("/Login")
            } 
        })

        return () => {
            listener.subscription.unsubscribe();
        }
    }, [signOut, navigate])

    return (
        <div className="w-full h-fit flex flex-col items-center box-decoration-slice fira-sans-regular overflow-x-auto overflow-y-auto [scrollbar-width:none] relative">
            <div className="w-[80%] max-w-[400px] h-[fit] fixed top-[200px] left-[50%] translate-x-[-50%]">
                <ToastMessageBox message={toastMessage} showToast={showToast} setShowToast={setShowToast}/>
            </div>
            <div className="h-fit h-full min-h-screen border-x-1 lg:w-[60%] md:w-[80%] sm:w-full max-sm:w-full
                            [border-image:linear-gradient(to_bottom,#217AFF,#4D94FF,#FFFFFF)_1]">
                <div className="w-full h-[100px] flex flex-row items-center bg-linear-to-r from-blue-500 to-sky-500 px-10">
                    <Link to="/" className="w-fit h-full flex flex-row text-2xl items-center mr-auto">
                        <Logo className="fill-white w-[50px] h-fit mr-[10px] md:w-[50px]"/>
                        <h1 className="antialiased fira-sans-black text-white hidden text-[40px] md:block">Wave</h1>
                    </Link>
                    {/*user searchbar*/}
                    {!userProfileLoading ?
                        <>
                        <form onSubmit={handleUserSearch}
                            className={`w-[50%] md:w-[40%] h-fit flex flex-row rounded-2xl my-auto inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400 
                                ${(userProfileData && queriedUserData?.user_name === userProfileData!.user_name) ? "mx-auto" : "ml-auto"}`}
                            >
                            <input placeholder="Search for a user" 
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="w-full h-[50px] p-[10px] bg-white rounded-s-2xl inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400
                                            resize-none focus:outline-none overflow-hidden"
                            >
                            </input>
                            <button className={`w-fit min-w-[50px] h-[50px] px-2 bg-blue-100 rounded-e-2xl cursor-pointer
                                    inset-shadow-blue-200 inset-shadow-[0px_-3px_0px_0px] transition-all duration-200
                                    disabled:bg-gray-400 disabled:cursor-not-allowed disabled:inset-shadow-gray-500 disabled:inset-shadow-[0px_3px_0px_0px] `}
                                    type="submit"
                            >
                                <Search className="m-auto"/>
                            </button>
                        </form>

                        {/*sign out button*/}
                        {(queriedUserData?.user_name === userProfileData?.user_name) &&
                            <button 
                                onClick={handleSignOut}
                                className="w-fit h-fit ml-auto p-3 bg-white whitespace-nowrap cursor-pointer
                                            text-break text-blue-500 my-auto rounded-2xl inset-shadow-[0px_-3px_0px_0px] inset-shadow-blue-200 "
                                >
                                Sign-out
                            </button>
                        }
                        </>
                        :
                        null
                    }
                </div>
                {userProfileLoading || userProfileRefetching ?
                    <>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[50px]"/>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                    </>
                    :
                    userProfileData && params.profileName !== "" ?
                        <div>
                            <div className="w-full h-fit flex flex-col items-center justify-center py-5 border-b-1 border-[#3F7CAC]">
                                {/* username and display picture*/}
                                <header className="w-full h-fit flex flex-row">
                                    <div className="w-full h-fit flex flex-col items-center justify-center gap-4">
                                        {(userProfileData && userProfileData?.profile_picture_url !== "") ?
                                            <img src={userProfileData!.profile_picture_url+`?date=${Date()}`} 
                                            className="w-fit h-[100px] aspect-square border-1 rounded-full border-sky-300"
                                            />
                                            :
                                            <AnonIcon className="w-fit h-[100px] aspect-square border-1 rounded-full border-sky-300" />
                                        }
                                        <span className="fira-sans-bold text-[40px]">{userProfileData?.user_name}</span>
                                    </div>
                                </header>
                                {/* profile tabs*/}
                                {/* only visible if it is the logged in user checking their profile*/}
                                {(queriedUserData?.user_name === userProfileData?.user_name) ?
                                    <div className=" w-fit h-fit flex flex-row items-center justify-center mx-auto">
                                        <button className={`w-[150px] p-3 border-x-1 border-gray-300 cursor-pointer rounded-l-2xl 
                                            ${showPosts ? "bg-blue-500 inset-shadow-blue-600 inset-shadow-[0px_3px_0px_0px] text-white" 
                                            : "bg-gray-300 inset-shadow-gray-100 inset-shadow-[0px_-3px_0px_0px] text-black"}`}
                                            onClick={() => {
                                                setShowPosts(true);
                                                setShowEdit(false);
                                            }}
                                        >
                                            Posts
                                        </button>
                                        <button className={`w-[150px] p-3 border-x-1 border-gray-300 cursor-pointer rounded-r-2xl 
                                            ${showEdit ? "bg-blue-500 inset-shadow-blue-600 inset-shadow-[0px_4px_0px_0px] text-white" 
                                            : "bg-gray-300 inset-shadow-gray-100 inset-shadow-[0px_-4px_0px_0px] text-black"}`}
                                            onClick={() => {
                                                setShowPosts(false);
                                                setShowEdit(true);
                                            }}
                                        >Edit Profile</button>
                                    </div>
                                    :
                                    null
                                }
                            </div>

                            {/*only load posts after userprofile has loaded */}
                            {!userProfileLoading ?
                                <div className="w-full h-fit flex flex-col justify-center mt-[10px]">
                                    {showPosts ?
                                        userPostsLoading ?
                                            <>
                                            <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[50px]"/>
                                            <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                                            <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mt-[10px]"/>
                                            </>
                                            :
                                            userPosts ? 
                                                <div>
                                                    {userPosts?.map((post) => <Post data={post} key={post.id}/>)}
                                                </div>
                                                :
                                                <span className="w-fit h-fit mx-auto fira-sans-bold">This user has no posts</span>
                                        :
                                        null
                                    }
                                    {showEdit ?
                                        <div className="w-full flex flex-col items-center border-t-1 border-[#3F7CAC]">
                                            <form className="w-[300px] h-fit mt-[10px]"
                                                onSubmit={handleUsernameUpdate}
                                            >
                                                <label htmlFor="username-field mx-auto">Update username</label>
                                                <div className="flex flex-row">
                                                    <input type="text"
                                                        value={changeUsernameInput}
                                                        onChange={(e) => setChangeUsernameInput(e.target.value)}     
                                                    className="w-full h-[50px] p-[10px] bg-gray-300 rounded-l-2xl inset-shadow-[0px_3px_0px_0px] inset-shadow-gray-400
                                                    resize-none focus:outline-none overflow-hidden disabled:bg-gray-400 disabled:cursor-not-allowed disabled:inset-shadow-gray-500 disabled:inset-shadow-[0px_3px_0px_0px]"
                                                    disabled={changeUsernamePending ? true : false}
                                                />
                                                <button className={`w-fit h-[50px] px-2 bg-blue-100 rounded-e-2xl cursor-pointer text-center
                                                        inset-shadow-blue-200 inset-shadow-[0px_-3px_0px_0px] transition-all duration-200
                                                        disabled:bg-gray-400 disabled:cursor-not-allowed disabled:inset-shadow-gray-500 disabled:inset-shadow-[0px_3px_0px_0px] `}
                                                        type="submit"
                                                        disabled={changeUsernamePending ? true : false}
                                                >
                                                    <span>Update</span>
                                                </button>
                                                </div>
                                            </form>
                                            <form className="w-[300px] h-fit mt-[20px]"
                                                onSubmit={handleProfilePictureSubmit}
                                            >
                                                <label htmlFor="profile-picture-input">Update profile picture</label>
                                                <div className="w-full flex flex-row items-center place-content-between">
                                                    <div className={`h-fit ${changeProfilePictureInput ? "w-fit" : "w-full"}`}>
                                                        <label htmlFor="profile-picture-input"
                                                            className={` h-[50px] flex flex-row items-center justify-center text-wrap whitespace-normal bg-blue-100 rounded-2xl
                                                            ${changeProfilePicturePending ? "bg-gray-400 cursor-not-allowed inset-shadow-gray-500 inset-shadow-[0px_3px_0px_0px]" 
                                                                : "inset-shadow-blue-200 inset-shadow-[0px_-3px_0px_0px] transition-colors duration-200 cursor-pointer"}
                                                            ${changeProfilePictureInput ? "w-[75px]" : "w-full"}`}
                                                            >
                                                                <span className="text-center">Select picture</span>
                                                                <input id="profile-picture-input"
                                                                    type="file"
                                                                    className="text-transparent w-0 h-0 select-none pointer-events-none"
                                                                    onChange={handleProfilePictureInput}
                                                                    accept="image/*"
                                                                    disabled={changeProfilePicturePending ? true : false}
                                                                />
                                                        </label>

                                                        {changeProfilePictureInput ?
                                                            <button className={`w-[75px] h-[50px] px-2 bg-blue-500 rounded-2xl cursor-pointer text-center mt-[5px]
                                                        inset-shadow-blue-400 inset-shadow-[0px_-3px_0px_0px] transition-all duration-200 text-white
                                                        disabled:text-black disabled:bg-gray-400 disabled:cursor-not-allowed disabled:inset-shadow-gray-500 disabled:inset-shadow-[0px_3px_0px_0px] `}
                                                        type="submit"
                                                        disabled={changeProfilePicturePending ? true : false}
                                                            >
                                                                <span>Update</span>
                                                            </button>
                                                            :
                                                            null
                                                        }
                                                    </div>
                                                    {changeProfilePictureInput ?
                                                        <div className="w-fit flex flex-row items-center justify-items-end">
                                                            <span className="w-[100px]">Your image will look like this:</span>
                                                            <img src={URL.createObjectURL(changeProfilePictureInput!)}
                                                            className="w-[100px] h-[100px] aspect-square rounded-full border-1 border-sky-300"/>
                                                        </div>
                                                        :
                                                        null
                                                    }
                                                </div>
                                            </form>
                                        </div>
                                        :
                                        null
                                    }
                                </div>
                                :
                                null
                            }
                        </div>
                        :
                        <span className="w-full h-fit flex flex-col items-center justify-center py-5 border-b-1 border-gray-300">404: User not found</span>
                }
            </div>
        </div>
    )
}

export default memo(Profile)