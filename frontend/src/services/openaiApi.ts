import axios,{ InternalAxiosRequestConfig } from 'axios';
// Create an axios instance
const chatGPTApiClient = axios.create({
    baseURL: 'https://api.openai.com/v1',
    timeout: 100000, // 10 seconds
    headers: {
      'Content-Type': 'application/json',
      //'Authorization': `Bearer ${import.meta.env.CHATGPT_API_KEY}`
    },
  });
  
  // Add a request interceptor to attach the token to every request if needed
  chatGPTApiClient.interceptors.request.use((config:InternalAxiosRequestConfig) => {
    if(!config.headers.Authorization){
      config.headers.Authorization = `Bearer <CHATGPT_API_KEY HERE>`;
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });

  export default chatGPTApiClient;