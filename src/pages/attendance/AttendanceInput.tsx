import React, { useState, useEffect } from 'react';
import { getCourses } from '../../services/CourseService';
import { Course } from '../../models/Course';
import { createAttendance } from '../../services/AttendanceService';
import { User } from '../../models/User';
import AxiosInstance from '../../utils/AxiosInstance';

const AttendanceInput: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('hadir');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) {
        setStudents([]);
        return;
      }

      try {
        // This would need a backend endpoint that returns all students enrolled in a course
        const response = await AxiosInstance.get(`/courses/${selectedCourse}/students`);
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedStudent) {
      setErrorMessage('Silakan pilih mata kuliah dan mahasiswa');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await createAttendance({
        user_id: selectedStudent,
        course_id: selectedCourse,
        status
      });
      
      setSuccessMessage('Absensi berhasil disimpan');
      setSelectedStudent(null);
      // Keep the selected course so they can input more attendance for the same course
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan absensi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Input Absensi</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Mata Kuliah
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
            required
          >
            <option value="">Pilih Mata Kuliah</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Mahasiswa
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            value={selectedStudent || ''}
            onChange={(e) => setSelectedStudent(Number(e.target.value) || null)}
            required
            disabled={!selectedCourse || students.length === 0}
          >
            <option value="">
              {!selectedCourse 
                ? 'Pilih mata kuliah terlebih dahulu'
                : students.length === 0
                ? 'Tidak ada mahasiswa dalam kelas ini'
                : 'Pilih Mahasiswa'}
            </option>
            {students.map((student) => {
                let displayName = student.name || student.username || student.email || 'Tidak diketahui';
                return (
                  <option key={student.id} value={student.id}>
                    {displayName}
                  </option>
                );
              })}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Status Kehadiran
          </label>
          <div className="flex space-x-4">
            {['hadir', 'izin', 'sakit', 'alpa'].map((statusOption) => (
              <label key={statusOption} className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="status"
                  value={statusOption}
                  checked={status === statusOption}
                  onChange={() => setStatus(statusOption)}
                />
                <span className="ml-2 capitalize">{statusOption}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Absensi'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceInput;
