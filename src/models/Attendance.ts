import { Course } from './Course';
import { User } from './User';

export interface Attendance {
  id: number;
  user_id: number;
  course_id: number;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa';
  timestamp: string;
  course?: Course;
  user?: User;
}
