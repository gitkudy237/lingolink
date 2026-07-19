import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const fetchConversations = async () => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.get(`${API_BASE_URL}/conversations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.conversations || [];
  } catch (error: any) {
    console.error("Fetch conversations error:", error);
    throw error.response?.data || { message: "Failed to fetch conversations" };
  }
};

export const fetchUsers = async () => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.users || [];
  } catch (error: any) {
    console.error("Fetch users error:", error);
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

export const createDirectConversation = async (otherUserId: string) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.post(
      `${API_BASE_URL}/conversations`,
      { type: "direct", otherUserId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.conversation;
  } catch (error: any) {
    console.error("Create direct conversation error:", error);
    throw error.response?.data || { message: "Failed to create conversation" };
  }
};

export const createGroupConversation = async (title: string, participantIds: string[]) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) {
      throw new Error("No auth token found");
    }

    const response = await axios.post(
      `${API_BASE_URL}/conversations`,
      { type: "group", title, participantIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.conversation;
  } catch (error: any) {
    console.error("Create group conversation error:", error);
    throw error.response?.data || { message: "Failed to create group conversation" };
  }
};

export const fetchMessages = async (conversationId: string, limit = 50) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axios.get(
      `${API_BASE_URL}/conversations/${conversationId}/messages?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.messages || [];
  } catch (error: any) {
    console.error("Fetch messages error:", error);
    throw error.response?.data || { message: "Failed to fetch messages" };
  }
};

export const fetchConversationDetails = async (conversationId: string) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.conversation;
  } catch (error: any) {
    console.error("Fetch conversation details error:", error);
    throw error.response?.data || { message: "Failed to fetch conversation details" };
  }
};

export const sendMessageRest = async (conversationId: string, payload: any) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axios.post(
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.message;
  } catch (error: any) {
    console.error("Send message (REST) error:", error);
    throw error.response?.data || { message: "Failed to send message" };
  }
};

export const markConversationRead = async (conversationId: string) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axios.post(
      `${API_BASE_URL}/conversations/${conversationId}/messages/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Mark conversation read error:", error);
    throw error.response?.data || { message: "Failed to mark conversation read" };
  }
};

export default {};
