/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { chatData } from '../components/interfaces/Interface';
import { Link } from 'react-router';

export const ChatListContext = createContext<ReactNode[]>([(<div key="null"></div>)]);

export const ChatListProvider = (children : ReactNode) => {
    const [fetchingChatData, setFetchingChatData] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const initialFetchCount = useRef(0);
    const chatData = useRef<chatData[]>
    ([
        {
            name:"null",
            picture:"null",
            id:0,
        }
    ])
    const [chatList, setChatList] = useState<ReactNode[]>([<div key="null"></div>])


    useEffect(() => {
        if(initialFetchCount.current < 1) {
            initialFetchCount.current++;
            const fetchChatList = async() => {
                setFetchingChatData(true);
                try {
                    const response = await fetch('http://localhost:3001/api/chat');
                    if(!response.ok) {
                        throw new Error(`Could not reach endpoint, status: ${response.status}`)
                    } else {
                        const data = await response.json();
                        chatData.current = [...data["data"]];
                        // console.log("this is the data:", data);
                        // console.log(chatData);
                        setError(null);
                    }
                } catch(error : Error | unknown) {
                    if(error instanceof Error) {
                        console.error(error.message);
                        setError(error);
                    }
                } finally {
                    setFetchingChatData(false);
                }
            }
            fetchChatList();
        }  
    }, [])

    useEffect(() => {
        if(error instanceof Error) {
            setChatList(
                [
                    (<div className="w-full h-fit flex items-center mb-[10px] pt-[5px] pb-[5px]" key="error-fetching-div">
                        <span className="select-none">{error.message}</span>
                    </div>),
                ]
            )
            return;
        }

        if(fetchingChatData) {
            setChatList(
                [
                    (<div className="w-full h-fit flex items-center mb-[10px] pt-[5px] pb-[5px]" key="fetch-data-div">
                        <span className="select-none">Fetching</span>
                    </div>),
                ]
            )
            return;
        }

        setChatList(
            chatData.current.map(chat=> 
                <div key={`${chat.id}`} className="w-full h-fit flex items-center mb-[10px] pt-[5px] pb-[5px] rounded-md hover:bg-sky-200 transition duration-300">
                    <Link
                        to={`Communities/${chat.name}`} 
                        className="w-full h-[35px] flex flex-row items-center pl-[30px]"
                        
                    >
                        <img src={`../../src/assets/dev-assets/${chat.picture}.svg`} 
                            className="w-[30px] h-[30px] mr-[10px]"
                        /> 
                        <span className="select-none">{chat.name}</span>
                    </Link>
                </div>
            )
        )
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[chatData.current])

    return (
        <ChatListContext.Provider value={chatList}>
            {children}
        </ChatListContext.Provider>
    )
}
