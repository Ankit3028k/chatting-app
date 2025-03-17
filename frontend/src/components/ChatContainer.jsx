// src/components/ChatContainer.js
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) return <div className="text-center p-4">Select a user to start chatting</div>;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader user={selectedUser} />
      <div className="flex-1 overflow-y-auto p-3">
        {isMessagesLoading ? (
          <MessageSkeleton />
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`message ${message.senderId === authUser._id ? "message-sent" : "message-received"}`}
            >
              <div className="message-content">
                {message.text && <p>{message.text}</p>}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Message content"
                    className="max-w-[200px] rounded-md border-2 border-zinc-300 mt-2"
                  />
                )}
              </div>
              <div className="text-xs text-zinc-500">{formatMessageTime(message.createdAt)}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
