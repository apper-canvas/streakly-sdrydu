import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import getIcon from '../utils/iconUtils';

function NotFound() {
  const navigate = useNavigate();
  const HomeIcon = getIcon('Home');
  const FrownIcon = getIcon('Frown');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card max-w-md w-full mx-auto"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-surface-100 dark:bg-surface-700">
            <FrownIcon className="w-12 h-12 text-surface-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Page Not Found</h1>
            <p className="text-surface-500 dark:text-surface-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary flex items-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;