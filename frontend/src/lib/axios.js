import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api/" : "/api",
  //   timeout: 5000,
  //   headers: {
  //     Authorization: "Bearer " + localStorage.getItem("access_token"),
  //     "Content-Type": "application/json",
  //     accept: "application/json",
  //   },
  withCredentials: true,
});
