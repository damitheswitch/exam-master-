import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-slate-900/50 backdrop-blur-sm text-slate-400 py-4 sm:py-6 text-center shadow-inner"
    >
      <div className="container mx-auto px-3 sm:px-4">
        <p className="text-xs sm:text-sm">
          &copy; {new Date().getFullYear()} ExamMaster. All rights reserved.
        </p>
        <p className="text-xs mt-1">
          Built by <span className="text-primary">Imad Charradi</span>.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;