import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `http://${window.location.hostname}:8080`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true // 🔥 ADD THIS
});

export default axiosInstance;