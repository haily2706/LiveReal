import { ChatLayout } from "./components/chat-layout";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function MessagesPage(props: {
    searchParams: SearchParams
}) {
    // Next.js 15 style async searchParams
    return (
        <ChatLayout searchParams={props.searchParams} />
    );
}
