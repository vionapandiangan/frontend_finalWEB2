export interface Course {
  studentsCount?: number;
  id: number;
  name: string;
  code: string;
  description?: string;
  dosen_id: number;
  dosen?: User;
  students?: CourseStudent[];
}

export interface CourseStudent {
  id: number;
  course_id: number;
  user_id: number;
  course?: Course;
  user?: User;
}

import { User } from './User';
