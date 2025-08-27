"use client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import menuData from "./menuData";

const Header = () => {
  const { user, logout } = useAuth();
  const { t, locale, changeLocale } = useTranslation();
  const { theme, setTheme } = useTheme();

  const pathUrl = usePathname();
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
  });

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: any) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };


  return (
    <>
      <header
        className={`left-0 top-0 z-40 flex w-full items-center transition-all duration-300 ${
          sticky
            ? "fixed z-[999] bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-[#00d4ff]/20 shadow-lg shadow-[#00d4ff]/10"
            : "absolute bg-gradient-to-r from-[#0a0a0a]/80 via-[#1a1a2e]/60 to-transparent backdrop-blur-sm"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4">
              <Link
                href="/"
                className={`navbar-logo flex items-center ${
                  sticky ? "py-2" : "py-5"
                } `}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#00d4ff] to-[#0099cc] rounded-lg flex items-center justify-center shadow-lg shadow-[#00d4ff]/20">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#ffffff] bg-clip-text text-transparent">Aranza.io</span>
                </div>
              </Link>
            </div>
            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="absolute right-20 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${
                      navbarOpen ? " top-[7px] rotate-45" : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${
                      pathUrl === "/" && sticky
                        ? "bg-dark dark:bg-white"
                        : "bg-white"
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${
                      navbarOpen ? "opacity-0 " : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${
                      pathUrl === "/" && sticky
                        ? "bg-dark dark:bg-white"
                        : "bg-white"
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] transition-all duration-300 ${
                      navbarOpen ? " top-[-8px] -rotate-45" : " "
                    } ${pathUrl !== "/" && "!bg-dark dark:!bg-white"} ${
                      pathUrl === "/" && sticky
                        ? "bg-dark dark:bg-white"
                        : "bg-white"
                    }`}
                  />
                </button>
                <nav
                  id="navbarCollapse"
                  className={`navbar absolute right-0 z-30 w-[320px] rounded-xl border border-[#00d4ff]/20 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-2xl shadow-[#00d4ff]/10 px-6 py-6 duration-300 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:ml-8 lg:flex lg:gap-x-8 xl:ml-14 xl:gap-x-12">
                    {/* Mobile Authentication Section */}
                    <div className="lg:hidden border-b border-[#00d4ff]/20 pb-4 mb-4">
                      {user ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-[#1a1a2e]/50">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0099cc] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{user.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-medium">{user.name}</p>
                                  <p className="text-[#00d4ff]/70 text-sm">{user.email}</p>
                                </div>
                                {user.role === 'ADMIN' && (
                                  <span className="text-xs font-medium text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full border border-purple-500/30">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {user.role === 'ADMIN' && (
                              <Link
                                href="/admin"
                                onClick={() => setNavbarOpen(false)}
                                className="w-full rounded-lg bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 px-4 py-3 text-base font-medium text-purple-300 hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Panel Admin</span>
                              </Link>
                            )}
                            <button
                              onClick={() => {
                                logout();
                                setNavbarOpen(false);
                              }}
                              className="w-full rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-base font-medium text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>{t('navigation.signout')}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Link
                            href="/signin"
                            onClick={() => setNavbarOpen(false)}
                            className="w-full rounded-lg border border-[#00d4ff]/30 px-4 py-3 text-base font-medium text-white hover:bg-[#00d4ff]/10 transition-all duration-300 flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>{t('navigation.signin')}</span>
                          </Link>
                          <Link
                            href="/signup"
                            onClick={() => setNavbarOpen(false)}
                            className="w-full rounded-lg px-4 py-3 text-base font-medium text-white bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#0099cc] hover:to-[#007acc] transition-all duration-300 shadow-lg shadow-[#00d4ff]/20 flex items-center justify-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>{t('navigation.signup')}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                    {menuData.map((menuItem, index) =>
                      menuItem.path ? (
                        <li key={index} className="group relative">
                          {pathUrl !== "/" ? (
                            <Link
                              onClick={navbarToggleHandler}
                              scroll={false}
                              href={menuItem.path}
                              className={`ud-menu-scroll flex py-3 px-4 text-base text-white hover:text-[#00d4ff] lg:inline-flex lg:px-0 lg:py-6 transition-all duration-300 rounded-lg lg:rounded-none hover:bg-[#00d4ff]/10 lg:hover:bg-transparent ${
                                pathUrl === menuItem?.path && "text-[#00d4ff] bg-[#00d4ff]/10 lg:bg-transparent"
                              }`}
                            >
                              {t(menuItem.title)}
                            </Link>
                          ) : (
                            <Link
                              onClick={navbarToggleHandler}
                              scroll={false}
                              href={menuItem.path}
                              className={`ud-menu-scroll flex py-3 px-4 text-base lg:inline-flex lg:px-0 lg:py-6 text-white hover:text-[#00d4ff] transition-all duration-300 rounded-lg lg:rounded-none hover:bg-[#00d4ff]/10 lg:hover:bg-transparent ${
                                pathUrl === menuItem?.path && "text-[#00d4ff] bg-[#00d4ff]/10 lg:bg-transparent"
                              }`}
                            >
                              {t(menuItem.title)}
                            </Link>
                          )}
                        </li>
                      ) : (
                        <li className="submenu-item group relative" key={index}>
                          {pathUrl !== "/" ? (
                            <button
                              onClick={() => handleSubmenu(index)}
                              className={`ud-menu-scroll flex items-center justify-between py-3 px-4 text-base text-white hover:text-[#00d4ff] lg:inline-flex lg:px-0 lg:py-6 transition-all duration-300 rounded-lg lg:rounded-none hover:bg-[#00d4ff]/10 lg:hover:bg-transparent w-full`}
                            >
                              {t(menuItem.title)}

                              <span className="pl-1">
                                <svg
                                  className={`duration-300 ${openIndex === index ? 'rotate-180' : ''} lg:group-hover:rotate-180`}
                                  width="16"
                                  height="17"
                                  viewBox="0 0 16 17"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8.00039 11.9C7.85039 11.9 7.72539 11.85 7.60039 11.75L1.85039 6.10005C1.62539 5.87505 1.62539 5.52505 1.85039 5.30005C2.07539 5.07505 2.42539 5.07505 2.65039 5.30005L8.00039 10.525L13.3504 5.25005C13.5754 5.02505 13.9254 5.02505 14.1504 5.25005C14.3754 5.47505 14.3754 5.82505 14.1504 6.05005L8.40039 11.7C8.27539 11.825 8.15039 11.9 8.00039 11.9Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSubmenu(index)}
                              className={`ud-menu-scroll flex items-center justify-between py-3 px-4 text-base lg:inline-flex lg:px-0 lg:py-6 transition-all duration-300 rounded-lg lg:rounded-none hover:bg-[#00d4ff]/10 lg:hover:bg-transparent w-full ${
                                sticky
                                  ? "text-white hover:text-[#00d4ff]"
                                  : "text-white hover:text-[#00d4ff]"
                              }`}
                            >
                              {t(menuItem.title)}

                              <span className="pl-1">
                                <svg
                                  className={`duration-300 ${openIndex === index ? 'rotate-180' : ''} lg:group-hover:rotate-180`}
                                  width="16"
                                  height="17"
                                  viewBox="0 0 16 17"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8.00039 11.9C7.85039 11.9 7.72539 11.85 7.60039 11.75L1.85039 6.10005C1.62539 5.87505 1.62539 5.52505 1.85039 5.30005C2.07539 5.07505 2.42539 5.07505 2.65039 5.30005L8.00039 10.525L13.3504 5.25005C13.5754 5.02505 13.9254 5.02505 14.1504 5.25005C14.3754 5.47505 14.3754 5.82505 14.1504 6.05005L8.40039 11.7C8.27539 11.825 8.15039 11.9 8.00039 11.9Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </button>
                          )}

                          <div
                            className={`submenu relative left-0 top-full w-[280px] rounded-lg bg-[#1a1a2e]/90 backdrop-blur-sm border border-[#00d4ff]/20 p-4 transition-all duration-300 group-hover:opacity-100 lg:invisible lg:absolute lg:top-[110%] lg:block lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                              openIndex === index ? "!-left-[25px] opacity-100" : "hidden lg:block"
                            }`}
                          >
                            {menuItem?.submenu?.map((submenuItem: any, i) => (
                              <Link
                                href={submenuItem.path}
                                key={i}
                                onClick={() => setNavbarOpen(false)}
                                className={`block rounded-lg px-4 py-3 text-sm transition-all duration-300 ${
                                  pathUrl === submenuItem.path
                                    ? "text-[#00d4ff] bg-[#00d4ff]/10"
                                    : "text-white hover:text-[#00d4ff] hover:bg-[#00d4ff]/5"
                                }`}
                              >
                                {submenuItem.title}
                              </Link>
                            ))}
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                </nav>
              </div>
              <div className="flex items-center justify-end space-x-3 pr-4 lg:pr-0">

                {/* Language Selector */}
                <div className="relative lg:order-1">
                  <button 
                    onClick={() => changeLocale(locale === 'es' ? 'en' : 'es')}
                    className="bg-[#1a1a2e]/80 text-white text-xs lg:text-sm px-2 lg:px-3 py-2 rounded-lg border border-[#00d4ff]/30 focus:outline-none focus:ring-2 focus:ring-[#00d4ff] backdrop-blur-sm hover:bg-[#2a2a3e]/80 transition-colors flex items-center space-x-1 lg:space-x-2"
                  >
                    {locale === 'es' ? (
                      <>
                        <div className="w-3 h-2 lg:w-4 lg:h-3 bg-red-500 relative rounded-sm">
                          <div className="absolute left-0 top-0 w-full h-0.5 lg:h-1 bg-red-500"></div>
                          <div className="absolute left-0 top-0.5 lg:top-1 w-full h-0.5 lg:h-1 bg-yellow-400"></div>
                          <div className="absolute left-0 top-1 lg:top-2 w-full h-0.5 lg:h-1 bg-red-500"></div>
                        </div>
                        <span className="text-xs lg:text-sm">ES</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-2 lg:w-4 lg:h-3 bg-blue-600 relative rounded-sm">
                          <div className="absolute left-0 top-0 w-full h-0.25 lg:h-0.5 bg-red-500"></div>
                          <div className="absolute left-0 top-0.25 lg:top-0.5 w-full h-0.25 lg:h-0.5 bg-white"></div>
                          <div className="absolute left-0 top-0.5 lg:top-1 w-full h-0.25 lg:h-0.5 bg-red-500"></div>
                          <div className="absolute left-0 top-0.75 lg:top-1.5 w-full h-0.25 lg:h-0.5 bg-white"></div>
                          <div className="absolute left-0 top-1 lg:top-2 w-full h-0.25 lg:h-0.5 bg-red-500"></div>
                          <div className="absolute left-0 top-1.25 lg:top-2.5 w-full h-0.25 lg:h-0.5 bg-white"></div>
                          <div className="absolute left-0 top-0 w-1.5 lg:w-2 h-1 lg:h-1.5 bg-blue-600"></div>
                        </div>
                        <span className="text-xs lg:text-sm">EN</span>
                      </>
                    )}
                  </button>
                </div>

                {user ? (
                  <>
                    {/* Admin Access - Desktop */}
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="hidden lg:block px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/20 border border-purple-500/30"
                      >
                        Admin
                      </Link>
                    )}
                    <p className="hidden lg:block px-7 py-3 text-base font-medium text-white">
                      {user.name}
                    </p>
                    <button
                      onClick={() => logout()}
                      className="hidden lg:block rounded-xl bg-[#1a1a2e]/80 border border-[#00d4ff]/30 px-6 py-3 text-base font-medium text-white hover:bg-[#00d4ff]/20 transition-all duration-300"
                    >
                      {t('navigation.signout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="hidden lg:block px-7 py-3 text-base font-medium text-white hover:text-[#00d4ff] transition-colors"
                    >
                      {t('navigation.signin')}
                    </Link>
                    <Link
                      href="/signup"
                      className="hidden lg:block rounded-xl px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#0099cc] hover:to-[#007acc] transition-all duration-300 shadow-lg shadow-[#00d4ff]/20"
                    >
                      {t('navigation.signup')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
