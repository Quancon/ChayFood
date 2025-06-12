import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    // Kiểm tra xem chúng ta đang ở môi trường client (trình duyệt)
    if (typeof window !== 'undefined') {
      const selectedLanguage = localStorage.getItem('selectedLanguage') || 'vi'; // Mặc định là 'vi'
      config.headers['Accept-Language'] = selectedLanguage;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient; 