import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const fetchUserPresence = async (userId: string) => {
  try {
    const token = await SecureStore.getItemAsync("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axios.get(`${API_BASE_URL}/users/${userId}/presence`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.presence as {
      online: boolean;
      lastSeenAt: string | null;
    };
  } catch (error: any) {
    console.error("Fetch user presence error:", error);
    throw error.response?.data || { message: "Failed to fetch user presence" };
  }
};