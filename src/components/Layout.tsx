import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Baby, Home, LogOut, Menu, Stethoscope, Users, X } from 'lucide-react';
import { useAuth } from '../app/providers/auth-context';

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Data Orang Tua', href: '/parents', icon: Users },
    { name: 'Data Anak', href: '/babies', icon: Baby },
    { name: 'Pemeriksaan', href: '/examination', icon: Stethoscope },
  ];

  const getPageTitle = () => {
    const currentNav = navigation.find((nav) => nav.href === location.pathname);
    if (currentNav) {
      return currentNav.name;
    }

    if (location.pathname.startsWith('/babies/')) {
      return 'Profile Anak';
    }

    if (location.pathname.startsWith('/parents/')) {
      return 'Profile Orang Tua';
    }

    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <button
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle navigasi"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="ml-2 flex items-center md:ml-0">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">StuntingCare</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <span className="text-sm text-gray-600">Dr. Admin User</span>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                title="Keluar"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="group hidden transition-all duration-300 md:fixed md:inset-y-0 md:flex md:w-20 md:flex-col md:pt-16 hover:md:w-64">
          <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-white pb-4 pt-5">
            <div className="px-3">
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center rounded-md px-4 py-4 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="ml-3 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {item.name}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-gray-600/75" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="h-0 flex-1 overflow-y-auto pb-4 pt-5">
                <div className="px-3">
                  <ul className="space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                          }
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 transition-all duration-300 md:pl-20 group-hover:md:pl-64">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-6">
                <h2 className="px-6 text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
