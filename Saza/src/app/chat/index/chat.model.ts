export interface Message {
    id?: number;
    message?: string;
    name?: string;
    profile?: string;
    time?: string;
    isToday?: boolean;
    message2?: string;
    align?: string;
    imageContent?: Array<{}>;
    isimage?: boolean;
    isfile?: boolean;
    fileContent?: string;
    fileSize?: string;
    istyping?: boolean;
}
