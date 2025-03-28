import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import notify from '../assets/sound/notification.mp3';

export const useChatStore = create((set, get) => ({
  // State variables
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/api/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/api/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send message
  sendMessage: async (messageData) => {
    const { selectedUser, messages, isMessagesLoading } = get();
    if (isMessagesLoading) return; // Prevent sending messages while loading
    try {
      const res = await axiosInstance.post(`/api/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message");
    }
  },

  // Subscribe to socket
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    
    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();
      const isMessageSentFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;
      
      if (!isMessageSentFromSelectedUser) {
        const sound = new Audio(notify);
        sound.play();
      }
      
      // Show browser notification only for messages from non-selected users
      if (!isMessageSentFromSelectedUser && Notification.permission === "granted") {
        const notification = new Notification("New message from " + newMessage.senderId.fullName, {
          body: newMessage.text,
          icon: newMessage.senderProfilePic || "/avatar.png",
        });
      }
  
      // Use toast to show a message when the user is not selected
      if (!isMessageSentFromSelectedUser) {
        toast.success("You have a new message!");
      }
      
      // Always update messages in store
      set({
        messages: [...get().messages, newMessage],
      });
    });
  }
  ,
  
  // Unsubscribe from socket
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // Set selected user
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
