import React from 'react';
import Blog from '../components/Blog';
import { motion } from 'framer-motion';

const BlogPage: React.FC = () => {
  return (
    <div className="pt-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Blog 
          titleOverride="THE_FULL" 
          subtitleOverride="ARCHIVE" 
          showViewAll={false} 
          limit={100}
        />
      </motion.div>
    </div>
  );
};

export default BlogPage;