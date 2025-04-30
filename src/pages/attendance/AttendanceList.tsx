import React, { useState, useEffect } from 'react';
import { getAttendance, updateAttendance, deleteAttendance } from '../../services/AttendanceService';
import { Attendance } from '../../models/Attendance';
import { getCourses } from '../../services/CourseService';
import { Course } from '../../models/Course';

import Modal from '../../components/Modal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const AttendanceList: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCourse, setSelectedCourse] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // State untuk edit & hapus
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attendanceToEdit, setAttendanceToEdit] = useState<Attendance | null>(null);
  const [attendanceToDelete, setAttendanceToDelete] = useState<Attendance | null>(null);
  const [editStatus, setEditStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpa'>('hadir');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);

        const filters: any = {};
        if (selectedCourse) filters.course_id = selectedCourse;
        if (startDate) filters.start_date = startDate;
        if (endDate) filters.end_date = endDate;

        const attendanceData = await getAttendance(filters);
        setAttendances(attendanceData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse, startDate, endDate]);

  const handleFilter = () => {
    // This will trigger useEffect due to dependency array
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handler buka modal edit
  const openEditModal = (attendance: Attendance) => {
    setAttendanceToEdit(attendance);
    setEditStatus(attendance.status);
    setShowEditModal(true);
  };
  // Handler buka modal hapus
  const openDeleteModal = (attendance: Attendance) => {
    setAttendanceToDelete(attendance);
    setShowDeleteModal(true);
  };
  // Handler submit edit
  const handleEditAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceToEdit) return;
    
    try {
      const updatedAttendance = await updateAttendance(attendanceToEdit.id, {
        status: editStatus
      });
      
      setAttendances(prev =>
        prev.map(att => 
          att.id === updatedAttendance.id ? updatedAttendance : att
        )
      );
      setShowEditModal(false);
    } catch (error) {
      console.error('Gagal mengupdate absensi:', error);
      alert('Gagal mengupdate absensi');
    }
  };
  // Handler hapus
  const handleDeleteAttendance = async () => {
    if (!attendanceToDelete) return;
    try {
      await deleteAttendance(attendanceToDelete.id);
      setAttendances(prev => prev.filter(a => a.id !== attendanceToDelete.id));
      setShowDeleteModal(false);
    } catch (err) {
      alert('Gagal menghapus absensi');
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Rekap Absensi</h1>
      
      <div className="mb-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl mb-3">Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-2">Mata Kuliah</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Semua Mata Kuliah</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Tanggal Mulai</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2">Tanggal Akhir</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleFilter}
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : attendances.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">Tidak ada data absensi</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-center">No</th>
                <th className="py-2 px-4 border-b text-center">Nama Mahasiswa</th>
                <th className="py-2 px-4 border-b text-center">Tanggal</th>
                <th className="py-2 px-4 border-b text-center">Mata Kuliah</th>
                <th className="py-2 px-4 border-b text-center">Status</th>
                <th className="py-2 px-4 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
               {attendances.map((attendance, index) => {
  const user = attendance.user as { name?: string; username?: string; email?: string } | undefined;
  const displayName = user?.name || user?.username || user?.email || 'Tidak diketahui';
  return (
    <tr key={attendance.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
      <td className="py-2 px-4 border-b text-center">{index + 1}</td>
      <td className="py-2 px-4 border-b text-center">{displayName}</td>
      <td className="py-2 px-4 border-b text-center">{formatDate(attendance.timestamp)}</td>
      <td className="py-2 px-4 border-b text-center">{attendance.course?.name || '-'}</td>
      <td className="py-2 px-4 border-b text-center">
        <span className={`inline-block px-2 py-1 rounded text-xs ${
          attendance.status === 'hadir'
            ? 'bg-green-100 text-green-800'
            : attendance.status === 'sakit'
            ? 'bg-yellow-100 text-yellow-800'
            : attendance.status === 'izin'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {attendance.status}
        </span>
      </td>
      <td className="py-2 px-4 border-b text-center">
        <button
          className="inline-flex items-center px-2 py-1 text-yellow-700 hover:text-yellow-900"
          title="Edit"
          onClick={() => openEditModal(attendance)}
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button
          className="inline-flex items-center px-2 py-1 text-red-700 hover:text-red-900"
          title="Hapus"
          onClick={() => openDeleteModal(attendance)}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
})}
            </tbody>
          </table>
        </div>
      )}
    </div>
      {/* Modal Edit Attendance */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Status Absensi"
        size="md"
      >
        <form onSubmit={handleEditAttendance} className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as Attendance['status'])}
              className="w-full border rounded px-3 py-2"
            >
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alpa">Alpa</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
      {/* Modal Konfirmasi Hapus */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Konfirmasi Hapus Absensi">
        <div className="p-2">
          <p>Yakin ingin menghapus data absensi ini?</p>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Batal</button>
            <button type="button" onClick={handleDeleteAttendance} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Hapus</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AttendanceList;
