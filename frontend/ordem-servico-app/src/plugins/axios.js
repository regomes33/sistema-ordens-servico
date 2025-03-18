import axios from 'axios';
import router from '../router';
import { getToken } from '../utils/auth';

const Api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor para adicionar o token em todas as requisições
Api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de resposta
Api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            router.push('/login');
            return Promise.reject(new Error('Sessão expirada. Por favor, faça login novamente.'));
        }
        return Promise.reject(error);
    }
);

export default Api;