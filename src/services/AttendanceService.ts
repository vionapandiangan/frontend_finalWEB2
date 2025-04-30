import AxiosInstance from '../utils/AxiosInstance';
import { Attendance } from '../models/Attendance';

interface AttendanceFilters {
  user_id?: number;
  course_id?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export const getAttendance = async (filters: AttendanceFilters = {}): Promise<Attendance[]> => {
  const response = await AxiosInstance.get('/attendance', { params: filters });
  return response.data;
};

export const getAttendanceById = async (id: number): Promise<Attendance> => {
  const response = await AxiosInstance.get(`/attendance/${id}`);
  return response.data;
};

export const createAttendance = async (data: {
  user_id: number;
  course_id: number;
  status?: string;
}): Promise<Attendance> => {
  const response = await AxiosInstance.post('/attendance', data);
  return response.data;
};

export const updateAttendance = async (id: number, data: Partial<Attendance>): Promise<Attendance> => {
  const response = await AxiosInstance.put(`/attendance/${id}`, data);
  return response.data;
};

export const deleteAttendance = async (id: number): Promise<void> => {
  await AxiosInstance.delete(`/attendance/${id}`);
};
