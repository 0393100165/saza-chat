export interface Chats {
    id: number;
    name: string;
    profilePicture?: string;
    status?: string;
    lastMessage?: string;
    time: string;
    unRead?: string;
    isActive?: boolean;
    isTyping?: boolean;
}
