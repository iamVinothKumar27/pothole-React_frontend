import axios from "axios";
import { auth } from "../firebase";
import { loadGoogleSession } from "../lib/googleSession";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  } else {
    const session = loadGoogleSession();
    if (session) {
      config.headers.Authorization = `Bearer ${session.credential}`;
    }
  }
  return config;
});

export default apiClient;
