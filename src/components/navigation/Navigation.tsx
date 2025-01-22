import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navigation() {
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
                  className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive('/screenshots')
                      ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 rounded-lg'
                  }`}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
                {userRole === 'admin' && (
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-4 pt-1 border-b-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      pathname.startsWith('/admin')
                        ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 rounded-lg'
                    }`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => {
                  sessionStorage.removeItem('auth');
                  window.location.href = '/';
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-105"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
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
