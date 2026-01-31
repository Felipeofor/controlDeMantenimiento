import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const countries = [
  { code: 'es', name: 'Argentina', flag: '🇦🇷' },
  { code: 'pt', name: 'Brasil', flag: '🇧🇷' },
  { code: 'en', name: 'USA / International', flag: '🇺🇸' },
  { code: 'es', name: 'México', flag: '🇲🇽' },
  { code: 'en', name: 'Turkey', flag: '🇹🇷' },
  { code: 'es', name: 'Chile', flag: '🇨🇱' },
  { code: 'en', name: 'UAE', flag: '🇦🇪' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onClose }) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  {t('countries.select_title')}
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {countries.map((country, idx) => {
                  const isSelected = i18n.language.startsWith(country.code);
                  return (
                    <button
                      key={`${country.code}-${idx}`}
                      onClick={() => handleLanguageChange(country.code)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{country.flag}</span>
                        <span className={`font-medium ${isSelected ? 'text-black font-bold' : 'text-gray-600'}`}>
                          {country.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <Check size={12} className="text-primary stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
