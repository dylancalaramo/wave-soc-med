import type { JSX, ReactElement, ReactNode } from "react";

export type ReactText = string | number;
export type ReactChild = ReactElement | ReactText;
export type children = ReactNode | JSX.Element | string | number;

export interface communityData {
    name:string;
    logo:string;
    id:number;
}

export interface chatData {
    name:string;
    picture:string;
    id:number;
}

export interface NavDrawerItem {
    text: string;
    picture?: string;
    link?: string;
    function?: () => void;
}

export interface NavDrawerProps {
    isOpen?: boolean;
    drawerItems?: NavDrawerItem[];
    children?: children | null;
}

export interface NavDrawerSmallProps {
    img:string | null;
    drawerItems?: NavDrawerItem[];
    noHover?:boolean;
}

export interface LinkButtonProps {
    img:string | null;
    link:string;
    text?:string | null;
    centered?:boolean;
    noHover?:boolean;
    element?: ReactNode;
    picHasOutsideSource?: boolean;
    picIsRounded?: boolean;
    searchParams?:string;
}

export interface AddPostState {
    title: string,
    content: string,
    mediaType: string | undefined,
    mediaFile: File | null,
    displayMedia?: string  | undefined,
    community_id: number | null
}

export interface PostData {
    id: number,
    title: string,
    content: string,
    mediaType: string | undefined,
    mediaURL: string,
    posterUID: string,
    created_at: string,
    community_id: number | null,
}

export interface PostDetailType {
    postData: PostData;
    posterData: {
        user_name: string,
        profile_picture_url: string
    }
}