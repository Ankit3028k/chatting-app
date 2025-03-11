import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://chating-app-eujl.onrender.com",
  withCredentials: true,
});
