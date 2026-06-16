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

export default {};
