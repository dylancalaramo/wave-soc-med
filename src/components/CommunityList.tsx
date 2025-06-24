import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"
import { supabase } from "../supabase-client"
import '../assets/Animations.css'
import { Link } from "react-router"

export interface CommunityData {
    id: number,
    name: string, 
    image: string,
    description: string,
    member_count: number
}

const CommunityList = () => {

    const fetchCommunities = useCallback(async(): Promise<CommunityData[]> => {
        // const { data, error } = await supabase.from("communities").select("id, name, image, description").order("created_at", { ascending: false });
        const { data, error } = await supabase.rpc("get_data_from_communities");
        if(error) {
            // alert(error.message + " communities");
            throw new Error(error.message);
        }
        // console.log(data);
        return data as CommunityData[];
    }, [])

    const { data: communityList, isLoading } = useQuery<CommunityData[], Error>({
        queryFn: fetchCommunities,
        queryKey: ["communities"]
    })

    if(!communityList && !isLoading) return (
        <div className="w-full h-fit flex justify-center">
            <h1>There are no communities to show</h1>
        </div>
    )

    return (
        <div className="w-full h-fit">
            {isLoading ? 
                <>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mb-[10px]"/>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mb-[10px]"/>
                    <div className="loading-bg-anim w-[80%] h-[25px] rounded-lg mx-auto mb-[10px]"/>
                </> :
                    communityList!.length > 0 ? 
                        <div className="w-full h-fit flex flex-col px-3">
                            {communityList && 
                                communityList.map((community, index) => (
                                    <Link className="w-full h-fit flex flex-row gap-2 truncate p-2
                                                    rounded-lg hover:bg-blue-100 hover:shadow-[0px_2px_2px_0] shadow-blue-200
                                                    focus:outline-none focus:bg-blue-100 focus:shadow-[0px_2px_2px_0]
                                                    transition-color duration-300" 
                                        to={`/Communities/${community.name}`}                            
                                        key={community.id}>
                                        <div className="flex flex-row items-center gap-2 mr-2">
                                            <span>{`${index+1}. `}</span>
                                            <img src={community.image} className="w-fit h-[40px] aspect-square rounded-full"/>
                                        </div>
                                        <div className="w-full h-full flex flex-row items-center text-wrap">
                                            <div className="w-full h-full flex flex-col text-[14px]">
                                                {community.name}
                                                <h2 className="text-gray-400">{community.description}</h2>   
                                                <span>Members: {community.member_count || 0}</span> 
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            }
                        </div> :
                        <div className="w-full h-fit text-center px-3">
                            There are no communities. This is a great time to start one of your own!
                        </div>
            }
        </div>
    )
}

export default CommunityList