/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useRef, type ReactNode} from 'react';
import type { NavDrawerItem} from '../components/interfaces/Interface';

export const CommunityListContext = createContext<NavDrawerItem[]>(
    [
        {
        text:"null",
        }
    ]);

export const CommunityListProvider = ({children} : {children: ReactNode}) => {
    const [fetchingCommunityData, setFetchingCommunityData] = useState<boolean>(false);
    const initialFetchCount = useRef<number>(0);
    const [communityListData, setCommunityListData] = useState<NavDrawerItem[]>
    ([
        {
        text:"null",
        }
    ]);

    useEffect(() => {
        if(initialFetchCount.current < 1) {
            initialFetchCount.current++;
            const fetchCommunityList = async() => {
                setFetchingCommunityData(true);
                try {
                    const response = await fetch('http://localhost:3001/api/communities');
                    if(fetchingCommunityData) {
                        setCommunityListData([{text:"Loading"}])
                    }
                    if(!response.ok) {
                        setCommunityListData([{text:"(404)"}])
                        throw new Error(`Could not reach endpoint, status: ${response.status}`);
                    } else {
                        const data = await response.json();
                        setCommunityListData(data["data"].map((data : {id:number, logo:string, name:string}) => {
                            return ({
                                text: data.name,
                                picture: data.logo,
                                link: `Communities/${data.name}`
                            })
                        }));
                        // console.log("this is the data:", ...data["data"]);
                        // console.log(communityListData)
                    }
                } catch(error : Error | unknown) {
                    if(error instanceof Error) {
                        console.error(error.message);
                        setCommunityListData([{text:`${error.message}`}])
                    }
                } finally {
                    setFetchingCommunityData(false);
                }
            }
            fetchCommunityList();
        }  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <CommunityListContext.Provider value={communityListData}>
            {children}
        </CommunityListContext.Provider>
    )
}
