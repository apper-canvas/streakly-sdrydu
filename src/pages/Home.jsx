import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import getIcon from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

function Home({ darkMode, toggleDarkMode }) {
  const [view, setView] = useState('today'); // 'today' or 'calendar'
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [streak, setStreak] = useState(() => {
    const savedStreak = localStorage.getItem('streak');
    return savedStreak ? parseInt(savedStreak) : 0;
  });
  
  const [xp, setXp] = useState(() => {
    const savedXp = localStorage.getItem('xp');
    return savedXp ? parseInt(savedXp) : 0;
  });
  
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Icons
  const CalendarIcon = getIcon('Calendar');
  const ChecklistIcon = getIcon('ListTodo');
  const PlusIcon = getIcon('Plus');
  const MoonIcon = getIcon('Moon');
  const SunIcon = getIcon('Sun');
  const FlameIcon = getIcon('Flame');
  const SparklesIcon = getIcon('Sparkles');

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('streak', streak.toString());
  }, [streak]);
  
  useEffect(() => {
    localStorage.setItem('xp', xp.toString());
  }, [xp]);
  
  // Calculate completed tasks percentage for today
  const todaysTasks = tasks.filter(task => 
    task.dueDate === selectedDate
  );
  
  const completedTasksCount = todaysTasks.filter(task => task.completed).length;
  const tasksProgress = todaysTasks.length > 0 
    ? Math.round((completedTasksCount / todaysTasks.length) * 100) 
    : 0;
    
  const handleTaskComplete = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed, completedAt: task.completed ? null : new Date().toISOString() } 
          : task
      )
    );
    
    // Add XP for task completion
    if (!tasks.find(t => t.id === taskId).completed) {
      const xpGained = 10;
      setXp(prev => prev + xpGained);
      
      // Check for streak updates
      updateStreak();
      
      toast.success(`Task completed! +${xpGained} XP`);
    }
  };
  
  const handleTaskDelete = (taskId) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    toast.info("Task deleted");
  };
  
  const updateStreak = () => {
    // Simple logic for streak - increment if tasks completed today
    if (completedTasksCount > 0) {
      setStreak(prev => prev + 1);
    }
  };
  
  const addTask = (task) => {
    setTasks(prev => [...prev, { 
      ...task, 
      id: generateTaskId(), 
      createdAt: new Date().toISOString(),
      completed: false,
    }]);
    setShowAdd(false);
    toast.success("Task added successfully!");
  };
  
  // Helper function to generate a unique ID
  const generateTaskId = () => {
    // Use crypto.randomUUID() if available, otherwise fallback to a simple random ID
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    // Fallback to a simple random ID
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-surface-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {view === 'today' ? 'Today' : 'Calendar'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView(view === 'today' ? 'calendar' : 'today')}
              className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              {view === 'today' ? 
                <CalendarIcon className="w-5 h-5" /> : 
                <ChecklistIcon className="w-5 h-5" />
              }
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
            >
              {darkMode ? 
                <SunIcon className="w-5 h-5 text-yellow-400" /> : 
                <MoonIcon className="w-5 h-5 text-surface-700" />
              }
            </button>
          </div>
        </div>
      </header>
      
      {/* Progress Section */}
      <div className="bg-white dark:bg-surface-800 px-4 py-3 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-surface-500 dark:text-surface-400">
              {tasksProgress}% completed
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                <FlameIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{streak} day streak</span>
              </div>
              <div className="flex items-center gap-1 text-purple-500">
                <SparklesIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{xp} XP</span>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-1.5">
            <motion.div 
              className="bg-primary h-1.5 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${tasksProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <MainFeature 
          view={view}
          tasks={tasks}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onTaskComplete={handleTaskComplete}
          onTaskDelete={handleTaskDelete}
          showAdd={showAdd}
          setShowAdd={setShowAdd}
          addTask={addTask}
        />
      </main>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <motion.button
          className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(true)}
        >
          <PlusIcon className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}

export default Home;