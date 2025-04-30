import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, addStudentToCourse, removeStudentFromCourse } from '../../services/CourseService';
import { Course } from '../../models/Course';
import AxiosInstance from '../../utils/AxiosInstance';
import { User } from '../../models/User';
import Modal from '../../components/Modal';
import { 
  AcademicCapIcon, 
  UserIcon, 
  UserGroupIcon, 
  PlusIcon, 
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // Tambahkan userId
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [studentToRemove, setStudentToRemove] = useState<User | null>(null);

  // Update filteredStudents when students or searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter((student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [students, searchTerm]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || null);
    setUserId(user.id || null);
    
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        if (!id) return;
        
        const courseData = await getCourseById(Number(id));
        setCourse(courseData);
        
        // Fetch students enrolled in the course
        const enrolledResponse = await AxiosInstance.get(`/courses/${id}/students`);
        const enrolledData = enrolledResponse.data;
        setStudents(enrolledData);
        setFilteredStudents(enrolledData);
        
        // Fetch all mahasiswa that can be added to the course
        const availableResponse = await AxiosInstance.get('/users?role=mahasiswa');
        
        // Filter out students already in the course
        const enrolledIds = enrolledData.map((s: User) => s.id);
        const available = availableResponse.data.filter((s: User) => !enrolledIds.includes(s.id));
        
        setAvailableStudents(available);
        setError(null);
      } catch (err) {
        // Tampilkan error detail di console dan di UI
        const error = err as { response?: any };
        if (error && error.response) {
          console.error('Error fetching course data:', error.response.data);
          setError(`Gagal memuat data mata kuliah: ${error.response.data.message || JSON.stringify(error.response.data)}`);
        } else {
          console.error('Error fetching course data:', err);
          setError('Gagal memuat data mata kuliah (error tidak diketahui)');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id]);

  

  const openAddModal = () => {
    setShowAddModal(true);
  };

  const handleAddStudent = async () => {
    if (!selectedStudent || !id) return;
    
    try {
      await addStudentToCourse(Number(id), Number(selectedStudent));
      
      // Refresh student lists
      const student = availableStudents.find(s => s.id === Number(selectedStudent));
      if (student) {
        setStudents(prev => [...prev, student]);
        setAvailableStudents(prev => prev.filter(s => s.id !== Number(selectedStudent)));
      }
      
      setSelectedStudent('');
      setShowAddModal(false);
      setSuccess('Mahasiswa berhasil ditambahkan ke kelas');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding student:', err);
      setError('Gagal menambahkan mahasiswa ke kelas');
      setTimeout(() => setError(null), 3000);
    }
  };

  const openRemoveModal = (student: User) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove || !id) return;
    
    try {
      await removeStudentFromCourse(Number(id), studentToRemove.id);
      
      // Refresh student lists
      setAvailableStudents(prev => [...prev, studentToRemove]);
      setStudents(prev => prev.filter(s => s.id !== studentToRemove.id));
      
      setShowRemoveModal(false);
      setStudentToRemove(null);
      setSuccess('Mahasiswa berhasil dihapus dari kelas');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing student:', err);
      setError('Gagal menghapus mahasiswa dari kelas');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
          <p className="font-bold">Tidak Ditemukan</p>
          <p>Mata kuliah yang Anda cari tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const canManageStudents = userRole === 'admin' || (userRole === 'dosen' && course.dosen_id === userId);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link to="/courses" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar Mata Kuliah
        </Link>
      </div>
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-4 flex items-start">
          <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4 flex items-start">
          <svg className="w-6 h-6 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200 overflow-hidden">
        <div className="flex items-center mb-4">
          <AcademicCapIcon className="h-10 w-10 text-blue-600 mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{course.name}</h1>
            <div className="mt-1 flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {course.code}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border-r border-gray-200 pr-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">INFORMASI MATA KULIAH</h2>
            <div className="flex items-start mb-3">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Dosen Pengampu</p>
                <p className="text-sm text-gray-600">{course.dosen?.name || course.dosen?.username || course.dosen?.email || 'Tidak diketahui'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Jumlah Peserta</p>
                <p className="text-sm text-gray-600">{filteredStudents.length} Mahasiswa</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">DESKRIPSI</h2>
            <p className="text-sm text-gray-600">{course.description || 'Tidak ada deskripsi'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <UserGroupIcon className="h-6 w-6 mr-2 text-blue-600" />
            Daftar Mahasiswa
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Cari mahasiswa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {canManageStudents && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Tambah Mahasiswa
              </button>
            )}
          </div>
        </div>
        
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Tambah Mahasiswa ke Kelas</h3>
            <div className="flex">
              <select
                className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 mr-2"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Pilih Mahasiswa</option>
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name || student.username || student.email}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddStudent}
                disabled={!selectedStudent}
                className={`py-2 px-4 rounded ${
                  !selectedStudent
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-700 text-white'
                }`}
              >
                Tambah
              </button>
            </div>
          </div>
        </Modal>
        
        {filteredStudents.length === 0 ? (
          <div className="text-center py-4 bg-gray-50 rounded">
            <p className="text-gray-500">Belum ada mahasiswa dalam kelas ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  {canManageStudents && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name || student.username || student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                    {canManageStudents && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openRemoveModal(student)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Remove Student Confirmation Modal */}
      <Modal isOpen={showRemoveModal} onClose={() => setShowRemoveModal(false)}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus Mahasiswa</h3>
          <p>Apakah Anda yakin ingin menghapus mahasiswa <span className="font-bold">{studentToRemove?.name || studentToRemove?.username || studentToRemove?.email}</span> dari kelas ini?</p>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowRemoveModal(false)}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Batal
            </button>
            <button
              onClick={handleRemoveStudent}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetail;
