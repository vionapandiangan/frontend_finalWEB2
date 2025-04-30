const motivasiList = [
  'Mengajar adalah pekerjaan mulia, semangat membentuk generasi penerus bangsa!',
  'Setiap ilmu yang Anda bagikan adalah investasi masa depan.',
  'Jadilah inspirasi bagi mahasiswa Anda hari ini!',
  'Keberhasilan murid adalah kebanggaan seorang guru.',
  'Teruslah berbagi ilmu, karena ilmu yang bermanfaat adalah amal jariyah.',
  'Semangat mengajar! Setiap hari adalah kesempatan baru untuk menginspirasi.'
];

function getRandomMotivasi() {
  return motivasiList[Math.floor(Math.random() * motivasiList.length)];
}

const Home = () => {
  // Ambil user dari localStorage
  let username = '';
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    username = user.username || user.name || user.email || '';
  } catch (e) {
    username = '';
  }

  const motivasi = getRandomMotivasi();

  return (
    <div className="w-full h-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 overflow-x-hidden">
      <div className="max-w-2xl w-full h-full flex flex-col items-center justify-center px-4 mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4 text-center">
          Selamat datang{username ? `, ${username}` : ''}!
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
          Anda telah masuk ke sistem manajemen absensi.<br />
          Semoga hari Anda menyenangkan dan penuh inspirasi.
        </p>
        <div className="bg-white rounded-lg shadow p-6 max-w-lg w-full sm:w-auto text-center border-l-4 border-blue-400">
          <span className="block text-blue-500 font-semibold mb-2">Motivasi Hari Ini</span>
          <q className="text-gray-800 italic">{motivasi}</q>
        </div>
      </div>
    </div>
  );
};

export default Home;