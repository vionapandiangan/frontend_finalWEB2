import AxiosInstance from '../utils/AxiosInstance';
import { User } from '../models/User';

interface LoginResponse {
  access_token: string;
  user: User;
}

interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'mahasiswa' | 'dosen' | 'admin';
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await AxiosInstance.post('/auth/login', { username, password });
  return response.data;
};

export const register = async (data: RegisterData): Promise<any> => {
  const response = await AxiosInstance.post('/auth/register', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await AxiosInstance.get('/user');
  return response.data;
};
