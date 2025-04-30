import AxiosInstance from '../utils/AxiosInstance';
import { Course } from '../models/Course';

export const getCourses = async (): Promise<Course[]> => {
  const response = await AxiosInstance.get('/courses');
  return response.data;
};

export const getCourseById = async (id: number): Promise<Course> => {
  const response = await AxiosInstance.get(`/courses/${id}`);
  return response.data;
};

export const createCourse = async (data: Partial<Course>): Promise<Course> => {
  const response = await AxiosInstance.post('/courses', data);
  return response.data;
};

export const updateCourse = async (id: number, data: Partial<Course>): Promise<Course> => {
  const response = await AxiosInstance.put(`/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  await AxiosInstance.delete(`/courses/${id}`);
};

export const addStudentToCourse = async (courseId: number, userId: number): Promise<any> => {
  const response = await AxiosInstance.post(`/courses/${courseId}/add-student`, { user_id: userId });
  return response.data;
};

export const removeStudentFromCourse = async (courseId: number, userId: number): Promise<any> => {
  const response = await AxiosInstance.delete(`/courses/${courseId}/remove-student`, {
    data: { user_id: userId }
  });
  return response.data;
};
