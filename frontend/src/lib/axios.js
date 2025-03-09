import axios from "axios";

const MODE = import.meta.env.MODE || "production";  // This will get the value from environment variables

export const axiosInstance = axios.create({
  baseURL: MODE === "development" ? "https://chating-app-eujl.onrender.com" : "/api",
  withCredentials: true,
});
