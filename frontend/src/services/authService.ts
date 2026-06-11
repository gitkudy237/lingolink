import axios from "axios";
import type { AuthLoginRequest, AuthRegisterRequest } from "@lingolink/shared";

const API_BASE_URL = "http://192.168.43.142:4000/api/auth";

export const signup = async (data: AuthRegisterRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Server Error" };
  }
};

export const login = async (data: AuthLoginRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Server Error" };
  }
};

export default {};
