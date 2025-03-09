import { ChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiHome, FiSettings, FiFileText, FiLogOut } from 'react-icons/fi';

interface NavigationProps {
  onShowAnalytics?: () => void;
}

export default function Navigation({ onShowAnalytics }: NavigationProps) {
  const [userRole, setUserRole] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
      const { role } = JSON.parse(auth);
      setUserRole(role);
    }
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="bg-gradient-to-r from-white via-blue-50 to-white shadow-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <Link
                  href="/screenshots"
                  className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive('/screenshots')
                      ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                      : 'border-transparent text-gray-500 rounded-lg'
                  }`}
                >
                  <FiHome className="w-4 h-4 mr-2" />
                  Home
                </Link>
                {userRole === 'admin' && (
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                      pathname.startsWith('/admin')
                        ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                        : 'border-transparent text-gray-500 rounded-lg'
                    }`}
                  >
                    <FiSettings className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/docs"
                  className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive('/docs')
                      ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                      : 'border-transparent text-gray-500 rounded-lg'
                  }`}
                >
                  <FiFileText className="w-4 h-4 mr-2" />
                  Docs
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {pathname === '/screenshots' && (
                <button
                  onClick={onShowAnalytics}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
                >
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  View Analytics
                </button>
              )}
              <button
                onClick={() => {
                  sessionStorage.removeItem('auth');
                  window.location.href = '/';
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <footer className="fixed bottom-0 w-full bg-gradient-to-r from-white via-blue-50 to-white shadow-lg border-t border-gray-200 py-4 transition-all duration-300 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 flex items-center justify-center space-x-1">
            <span>Made with</span>
            <span
              className="text-red-500 animate-pulse transform hover:scale-125 transition-all duration-300 inline-block"
              role="img"
              aria-label="love"
            >
              ❤️
            </span>
            <span>by</span>
            <a
              href="https://avestatechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
            >
              Avesta Technologies
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
