import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import notify from '../assets/sound/notification.mp3';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null, 
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/api/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally { 
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/api/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/api/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    
    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();
      const isMessageSentFromSelectedUser = selectedUser && newMessage.senderId === selectedUser._id;
      
      // Play notification sound for all new messages, regardless of selected user
      const sound = new Audio(notify);
      sound.play();
      
      // Show browser notification only for messages from non-selected users
      if (!isMessageSentFromSelectedUser && Notification.permission === "granted") {
        const notification = new Notification("New message from " + newMessage.senderfullName, {
          body: newMessage.text,
          icon: newMessage.senderProfilePic || "/avatar.png",
        });
      }
      
      // Show toast notification for messages from non-selected users
      if (!isMessageSentFromSelectedUser) {
        showNotification("You have a new message!");
      }
      
      // Always update messages in store
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },
  
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));   