import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "https://chating-app-eujl.onrender.com/api" : "https://chating-app-eujl.onrender.com/api",
  withCredentials: true,
});
