import React from 'react';
import { Menu, User, Heart } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 px-4 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <svg width="80" height="20" viewBox="0 0 7800 2100" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[100px] md:h-[24px]">
              <path d="M7296.82.052L6752.798 1024l544.022 1023.948h477.424L7239.034 1024 7774.244.052zm-1130.746 0v1705.534L5275.298.052 4205.476 2047.954h470.514l599.916-1147.71 254.406 487.47h-254.406l-178.412 341.108h611.236l166.464 319.132h726.816V.052h-435.96zm-1767.734 0l-599.916 1147.71L3199.138.052h-470.514l1069.822 2047.902L4868.268.052H4398.39zm-2076.172 0l-892.04 1707.424L1072.7 1024 1607.91.052h-477.424L586.464 1024l544.022 1023.948h593.006l166.464-319.132h611.236l-178.412-341.108h-254.406l254.406-487.47 598.678 1147.71h470.514L2322.15.046zM-.244 2047.952h435.33V.05H-.244z" fill="black"/>
            </svg>
          </div>
          
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-700">
            <a href="#" className="hover:text-primary transition-colors">Financiá tu auto</a>
            <a href="#" className="hover:text-primary transition-colors">Comprá un auto</a>
            <a href="#" className="hover:text-primary transition-colors">Vendé tu auto</a>
            <a href="#" className="hover:text-primary transition-colors">Outlet</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-black hidden md:block">
            <Heart size={20} />
          </button>
          <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 hover:shadow-sm cursor-pointer transition-all">
            <User size={18} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-800 hidden sm:inline">Felipe Omar</span>
          </div>
          <button className="p-1 lg:hidden text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] pt-20 px-6 flex flex-col gap-6 lg:hidden animate-in slide-in-from-right duration-300">
          <button className="absolute top-5 right-5 p-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="flex flex-col gap-8 text-xl font-bold text-gray-900 border-b border-gray-100 pb-8 uppercase italic">
            <a href="#" onClick={() => setIsMenuOpen(false)}>Financiá tu auto</a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>Comprá un auto</a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>Vendé tu auto</a>
            <a href="#" onClick={() => setIsMenuOpen(false)}>Outlet de autos</a>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <User size={24} />
            <span className="font-bold">Mi Cuenta</span>
          </div>
        </div>
      )}
    </>
  );
};
