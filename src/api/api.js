import axios from 'axios';

export const baseURL = 'http://localhost:3011';

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
});


// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如添加 Authorization 头
    // const token = localStorage.getItem('token'); // 假设你使用 localStorage 存储token
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    // 对响应数据做些什么
    return response; // 直接返回数据
  },
  (error) => {
    // 对响应错误做些什么
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;