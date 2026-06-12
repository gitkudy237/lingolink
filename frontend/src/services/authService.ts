import axios from "axios";
import type { AuthLoginRequest, AuthRegisterRequest } from "@lingolink/shared";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const signup = async (data: AuthRegisterRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Server Error" };
  }
};

export const login = async (data: AuthLoginRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Server Error" };
  }
};

export default {};
