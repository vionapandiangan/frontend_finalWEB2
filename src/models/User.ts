export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'mahasiswa' | 'dosen' | 'admin';
}
