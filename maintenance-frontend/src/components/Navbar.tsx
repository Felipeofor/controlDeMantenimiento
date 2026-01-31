import React from 'react';
import { Menu, User, Globe, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLangOpen, setIsLangOpen] = React.useState(false);
  const { i18n, t } = useTranslation();

  const currentFlag = i18n.language.startsWith('es') ? '🇦🇷' : 
                     i18n.language.startsWith('pt') ? '🇧🇷' : '🇺🇸';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 px-2 md:px-12 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 md:gap-8 min-w-0">
          <Link to="/" className="flex items-center pl-2 hover:opacity-70 transition-opacity">
            <svg width="70" height="18" viewBox="0 0 7800 2100" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[90px] md:h-[22px] shrink-0">
              <path d="M7296.82.052L6752.798 1024l544.022 1023.948h477.424L7239.034 1024 7774.244.052zm-1130.746 0v1705.534L5275.298.052 4205.476 2047.954h470.514l599.916-1147.71 254.406 487.47h-254.406l-178.412 341.108h611.236l166.464 319.132h726.816V.052h-435.96zm-1767.734 0l-599.916 1147.71L3199.138.052h-470.514l1069.822 2047.902L4868.268.052H4398.39zm-2076.172 0l-892.04 1707.424L1072.7 1024 1607.91.052h-477.424L586.464 1024l544.022 1023.948h593.006l166.464-319.132h611.236l-178.412-341.108h-254.406l254.406-487.47 598.678 1147.71h470.514L2322.15.046zM-.244 2047.952h435.33V.05H-.244z" fill="black"/>
            </svg>
          </Link>
          <div className="hidden lg:flex items-center gap-6 ml-4">
            <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">{t('navbar.dashboard')}</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsLangOpen(true)}
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-full transition-colors order-last md:order-none"
          >
            <span className="text-xl leading-none">{currentFlag}</span>
            <Globe size={18} className="text-gray-400 hidden md:block" />
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

      <LanguageSelector isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] shadow-2xl lg:hidden flex flex-col p-8 pt-24"
            >
              <button 
                className="absolute top-5 right-5 p-3 hover:bg-gray-100 rounded-full transition-colors" 
                onClick={() => setIsMenuOpen(false)}
              >
                <X size={24} className="text-gray-900" />
              </button>
              
              <div className="flex flex-col gap-8 text-2xl font-black uppercase italic tracking-tighter text-gray-900">
                <Link to="/" className="hover:text-primary transition-colors pr-4" onClick={() => setIsMenuOpen(false)}>{t('common.home') || 'Inicio'}</Link>
                <Link to="/dashboard" className="hover:text-primary transition-colors pr-4" onClick={() => setIsMenuOpen(false)}>{t('navbar.dashboard')}</Link>
              </div>

              <div className="mt-auto space-y-6 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                    <User size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400">{t('common.my_account')}</div>
                    <div className="font-bold">Felipe Omar</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
