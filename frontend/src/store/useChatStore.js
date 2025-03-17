// src/store/useChatStore.js
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

  // Get users and sort them by the last message time
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/api/messages/users");
      const usersWithLastMessage = await Promise.all(res.data.map(async (user) => {
        const messages = await axiosInstance.get(`/api/messages/${user._id}`);
        user.lastMessageTime = messages.data.length > 0 ? messages.data[messages.data.length - 1].createdAt : null;
        return user;
      }));

      // Sort users by the latest message time
      usersWithLastMessage.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      set({ users: usersWithLastMessage });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Get messages of a selected user
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

  // Send message to the selected user
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/api/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Subscribe to new incoming messages and show notifications
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) {
        // Play notification sound
        const sound = new Audio(notify);
        sound.play();

        // Show browser notification
        if (Notification.permission === "granted") {
          const notification = new Notification("New message from " + newMessage.senderName, {
            body: newMessage.text,
            icon: newMessage.senderProfilePic || "/avatar.png", // Optional: user profile image as the icon
          });
        }
      }

      // Update messages in store
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Unsubscribe from new incoming messages
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // Set selected user
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
