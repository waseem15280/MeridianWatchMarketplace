import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMarketplace();

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            id={`toast-${t.id}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-[#FFFFFF]/95 border border-[#E5DFD5] backdrop-blur-md shadow-2xl text-[#1C1917]"
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#3D5A45] shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-[#8B3A3A] shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-[#967139] shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#967139] shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-serif font-bold tracking-wide text-[#1C1917]">{t.title}</h4>
              <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">{t.message}</p>
            </div>

            <button
              id={`toast-close-${t.id}`}
              onClick={() => removeToast(t.id)}
              className="text-[#78716C] hover:text-[#1C1917] p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
