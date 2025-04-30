import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from "@headlessui/react";
import { BellIcon } from "@heroicons/react/16/solid";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthProvider";
import { useState, useEffect, Fragment } from 'react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [menu, setMenu] = useState<'open' | 'close'>('close');

  useEffect(() => {
    // Get user data from localStorage instead of context
    if (isAuthenticated) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUserRole(parsedUser.role ? parsedUser.role.toLowerCase() : null);
        } catch (e) {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [isAuthenticated, location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Debug: tampilkan role di console
  console.log('userRole:', userRole);

  return (
    <nav className="bg-white border-b border-gray-200 py-2.5 dark:bg-gray-800 md:px-4 lg:px-8">
      <div className="flex flex-wrap justify-center md:justify-between items-center md:mx-auto max-w-screen-xl">
        <div className="flex items-center z-10 md:z-0">
          <Link to="/" className="flex items-center">
            <div className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Sistem Absensi
            </div>
          </Link>
        </div>
        <div
          className={`flex items-center z-10 md:z-0 absolute top-4 right-5 md:relative md:top-0 md:right-0`}
        >
          {isAuthenticated && (
            <button className="mx-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
          <Disclosure as="div">
            {() => (
              <Fragment>
                <Disclosure.Button 
                  className={`cursor-pointer rounded-sm md:hidden border-[1px] border-gray px-[0.15rem] ${menu === 'open' ? 'bg-slate-200' : 'bg-white'}`}
                  onClick={() => setMenu(menu === 'close' ? 'open' : 'close')}
                >
                  <svg
                    className={`w-5 h-5 ${menu === 'open' ? 'hidden' : 'block'}`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 17 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1h15M1 7h15M1 13h15"
                    />
                  </svg>
                  <svg
                    className={`w-5 h-5 ${menu === 'close' ? 'hidden' : 'block'}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Disclosure.Button>
              </Fragment>
            )}
          </Disclosure>
        </div>
        <div
          className={`${menu === 'close' ? 'hidden' : 'bg-white px-4 pt-12'} justify-between md:pt-0 items-center w-full md:flex md:w-auto md:order-1 ${menu === 'close' ? 'hidden' : ''}`}
        >
          <ul className="flex flex-col md:ml-0 md:mr-10 mt-4 font-medium md:flex-row md:space-x-8 md:mt-0">
            <li>
              <Link
                to="/"
                className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
              >
                Home
              </Link>
            </li>
            
            {isAuthenticated && (
              <>
                {/* Menu untuk semua role */}
                <li>
                  <Link
                    to="/courses"
                    className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Mata Kuliah
                  </Link>
                </li>
                
                {/* Menu untuk mahasiswa */}
                {userRole === 'mahasiswa' && (
                  <li>
                    <Link
                      to="/attendance"
                      className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                    >
                      Rekap Absensi
                    </Link>
                  </li>
                )}
                
                {/* Menu untuk dosen */}
                {(userRole === 'dosen' || userRole === 'admin') && (
                  <>
                    <li>
                      <Link
                        to="/attendance/input"
                        className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                      >
                        Input Absensi
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/attendance"
                        className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                      >
                        Rekap Absensi
                      </Link>
                    </li>
                  </>
                )}
                
                {/* Menu untuk admin */}
                {userRole === 'admin' && (
                  <li>
                    <NavLink
                      to="/users"
                      className={({ isActive }) => classNames(
                        "block py-2 pr-4 pl-3 md:p-0",
                        isActive
                          ? "text-blue-700 dark:text-white"
                          : "text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                      )}
                    >
                      Kelola Pengguna
                    </NavLink>
                  </li>
                )}

                <li className="relative">
                  <Menu as="div" className="inline-block text-left">
                    <MenuButton className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span>Akun</span>
                      </div>
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-1 py-1">
                        <MenuItem>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'flex w-full items-center px-4 py-2 text-sm'
                              )}
                            >
                              Logout
                            </button>
                          )}
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </Menu>
                </li>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <li>
                  <Link
                    to="/login"
                    className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
