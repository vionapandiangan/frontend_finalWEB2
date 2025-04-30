import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, deleteCourse, createCourse } from '../../services/CourseService';
import { Course } from '../../models/Course';
import { User } from '../../models/User';
import Modal from '../../components/Modal';
import { AcademicCapIcon, UserGroupIcon, BookOpenIcon, PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    code: '',
    description: '',
    dosen_id: undefined
  });

  // State untuk daftar dosen
  const [dosenList, setDosenList] = useState<User[]>([]);
  // State untuk edit course
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editCourse, setEditCourse] = useState<Partial<Course> & { id?: number }>({
    id: undefined,
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || null);
    
    // Fetch daftar dosen
    const fetchDosen = async () => {
      try {
        const res = await import('../../utils/AxiosInstance').then(m => m.default.get('/users?role=dosen'));
        setDosenList(res.data || []);
      } catch (err) {
        setDosenList([]);
      }
    };
    fetchDosen();

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await getCourses();
        setCourses(data);
        setFilteredCourses(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Gagal memuat data mata kuliah');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);
  
  // Filter courses when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const openDeleteModal = (id: number) => {
    setCourseToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete);
      setCourses(prev => prev.filter(course => course.id !== courseToDelete));
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      alert('Gagal menghapus mata kuliah');
    }
  };
  
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCourse.name || !newCourse.code || !newCourse.dosen_id) {
      alert('Nama, kode, dan dosen wajib diisi');
      return;
    }
    
    try {
      const payload = {
        ...newCourse,
        dosen_id: Number(newCourse.dosen_id),
      };
      const createdCourse = await createCourse(payload);
      setCourses(prev => [...prev, createdCourse]);
      setShowAddModal(false);
      setNewCourse({ name: '', code: '', description: '', dosen_id: undefined });
    } catch (err) {
      console.error('Error adding course:', err);
      alert('Gagal menambahkan mata kuliah');
    }
  };

  // Handler untuk membuka modal edit
  const openEditModal = (course: Course) => {
    setEditCourse(course);
    setShowEditModal(true);
  };

  // Handler untuk submit edit
  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse.id || !editCourse.name || !editCourse.code) {
      alert('Nama dan kode mata kuliah wajib diisi');
      return;
    }
    try {
      const updated = await import('../../services/CourseService').then(m => m.updateCourse(editCourse.id as number, editCourse));
      setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
      setFilteredCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating course:', err);
      alert('Gagal mengupdate mata kuliah');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Mata Kuliah</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Cari mata kuliah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {(userRole === 'admin' || userRole === 'dosen') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Tambah Mata Kuliah
            </button>
          )}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <AcademicCapIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada mata kuliah</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Tidak ada hasil yang cocok dengan pencarian Anda' : 'Belum ada mata kuliah yang tersedia'}
          </p>
          {(userRole === 'admin' || userRole === 'dosen') && !searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Tambah Mata Kuliah Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200">
              <div className="h-2 bg-blue-600"></div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{course.name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.code}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description || 'Tidak ada deskripsi'}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{(course.students?.length ?? course.studentsCount ?? 0)} Mahasiswa</span>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <Link
                    to={`/courses/${course.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <BookOpenIcon className="-ml-1 mr-2 h-4 w-4" />
                    Detail
                  </Link>
                  
                  {(userRole === 'admin' || userRole === 'dosen') && (
                    <>
                      <button
                        onClick={() => openEditModal(course)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                      >
                        <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(course.id)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                      >
                        <TrashIcon className="-ml-1 mr-2 h-4 w-4" />
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal Tambah Mata Kuliah */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Mata Kuliah Baru"
        size="lg"
      >
        <form onSubmit={handleAddCourse} className="space-y-4">
          <div>
            <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">Kode Mata Kuliah</label>
            <input
              type="text"
              id="courseCode"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={newCourse.code}
              onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">Nama Mata Kuliah</label>
            <input
              type="text"
              id="courseName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={newCourse.name}
              onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              id="courseDescription"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={newCourse.description || ''}
              onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="courseDosen" className="block text-sm font-medium text-gray-700">Dosen Pengampu</label>
            <select
              id="courseDosen"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={newCourse.dosen_id ?? ''}
              onChange={e => setNewCourse({ ...newCourse, dosen_id: e.target.value ? Number(e.target.value) : undefined })}
              required
            >
              <option value="">Pilih Dosen</option>
              {dosenList.map(dosen => (
                <option key={dosen.id} value={dosen.id}>
                  {dosen.username || dosen.name || dosen.email}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowAddModal(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Mata Kuliah */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Mata Kuliah"
        size="lg"
      >
        <form onSubmit={handleEditCourse} className="space-y-4">
          <div>
            <label htmlFor="editCourseCode" className="block text-sm font-medium text-gray-700">Kode Mata Kuliah</label>
            <input
              type="text"
              id="editCourseCode"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={editCourse.code || ''}
              onChange={e => setEditCourse({...editCourse, code: e.target.value})}
              required
            />
          </div>
          <div>
            <label htmlFor="editCourseName" className="block text-sm font-medium text-gray-700">Nama Mata Kuliah</label>
            <input
              type="text"
              id="editCourseName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={editCourse.name || ''}
              onChange={e => setEditCourse({...editCourse, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label htmlFor="editCourseDescription" className="block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              id="editCourseDescription"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={editCourse.description || ''}
              onChange={e => setEditCourse({...editCourse, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowEditModal(false)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
      
      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="text-center sm:text-left">
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Apakah Anda yakin ingin menghapus mata kuliah ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait mata kuliah ini.            
            </p>
          </div>
          
          <div className="mt-5 sm:mt-4 flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleDelete}
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseList;
