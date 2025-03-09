import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://chating-app-eujl.onrender.com/api",
  withCredentials: true,
});
