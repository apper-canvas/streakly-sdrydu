import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, addDays, isSameDay } from 'date-fns';
import getIcon from '../utils/iconUtils';

function MainFeature({ 
  view, 
  tasks, 
  selectedDate, 
  setSelectedDate, 
  onTaskComplete, 
  onTaskDelete,
  showAdd,
  setShowAdd,
  addTask
}) {
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: selectedDate,
    dueTime: '',
    priority: 'medium',
    category: 'personal'
  });
  
  const [calendarView, setCalendarView] = useState('week'); // 'week' or 'month'
  const [calendarDays, setCalendarDays] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Icons
  const CheckIcon = getIcon('Check');
  const TrashIcon = getIcon('Trash');
  const CalendarIcon = getIcon('Calendar');
  const ClockIcon = getIcon('Clock');
  const TagIcon = getIcon('Tag');
  const FlagIcon = getIcon('Flag');
  const XIcon = getIcon('X');
  const ChevronLeftIcon = getIcon('ChevronLeft');
  const ChevronRightIcon = getIcon('ChevronRight');
  
  // Generate calendar days
  useEffect(() => {
    const days = [];
    const currentDate = new Date();
    const selected = parseISO(selectedDate);
    
    // For week view
    if (calendarView === 'week') {
      // Start from 3 days ago
      const startDate = addDays(currentDate, -3);
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
        days.push({
          date: date,
          dateString: format(date, 'yyyy-MM-dd'),
          dayName: format(date, 'EEE'),
          dayNumber: format(date, 'd'),
          isToday: isToday(date),
          isSelected: isSameDay(date, selected),
          hasTasks: tasks.some(task => task.dueDate === format(date, 'yyyy-MM-dd'))
        });
      }
    } else {
      // Month view logic would go here
      // Simplified for MVP
      const startDate = addDays(currentDate, -15);
      
      for (let i = 0; i < 30; i++) {
        const date = addDays(startDate, i);
        days.push({
          date: date,
          dateString: format(date, 'yyyy-MM-dd'),
          dayName: format(date, 'EEE'),
          dayNumber: format(date, 'd'),
          isToday: isToday(date),
          isSelected: isSameDay(date, selected),
          hasTasks: tasks.some(task => task.dueDate === format(date, 'yyyy-MM-dd'))
        });
      }
    }
    
    setCalendarDays(days);
  }, [selectedDate, tasks, calendarView]);
  
  // Reset form when modal is opened
  useEffect(() => {
    if (showAdd) {
      setNewTask({
        title: '',
        dueDate: selectedDate,
        dueTime: '',
        priority: 'medium',
        category: 'personal'
      });
    }
  }, [showAdd, selectedDate]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    addTask(newTask);
  };
  
  // Touch handlers for swipe detection
  const handleTouchStart = (e, taskId) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      taskId
    });
    setTouchEnd(null);
  };
  
  const handleTouchMove = (e, taskId) => {
    if (!touchStart || touchStart.taskId !== taskId) return;
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      taskId
    });
  };
  
  const handleTouchEnd = (taskId) => {
    if (!touchStart || !touchEnd || touchStart.taskId !== taskId || touchEnd.taskId !== taskId) {
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }
    
    const distance = touchEnd.x - touchStart.x;
    const isLeftSwipe = distance < -70;
    const isRightSwipe = distance > 70;
    
    if (isLeftSwipe) {
      onTaskDelete(taskId);
    } else if (isRightSwipe) {
      onTaskComplete(taskId);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Get swipe style
  const getSwipeStyle = (taskId) => {
    if (!touchStart || !touchEnd || touchStart.taskId !== taskId || touchEnd.taskId !== taskId) return {};
    
    const distance = touchEnd.x - touchStart.x;
    
    if (Math.abs(distance) < 5) return {};
    
    return {
      transform: `translateX(${distance}px)`,
      transition: 'none'
    };
  };
  
  // Get task opacity based on how far it's been swiped
  const getSwipeOpacity = (taskId) => {
    if (!touchStart || !touchEnd || touchStart.taskId !== taskId || touchEnd.taskId !== taskId) return 1;
    
    const distance = touchEnd.x - touchStart.x;
    
    if (distance > 0) {
      // Right swipe (complete) - show green background
      return Math.min(distance / 100, 1);
    } else if (distance < 0) {
      // Left swipe (delete) - show red background
      return Math.min(Math.abs(distance) / 100, 1);
    }
    
    return 0;
  };
  
  // Get swipe background color
  const getSwipeBackground = (taskId) => {
    if (!touchStart || !touchEnd || touchStart.taskId !== taskId || touchEnd.taskId !== taskId) return 'transparent';
    
    const distance = touchEnd.x - touchStart.x;
    
    if (distance > 50) {
      // Right swipe (complete)
      return 'rgba(34, 197, 94, 0.2)';
    } else if (distance < -50) {
      // Left swipe (delete)
      return 'rgba(239, 68, 68, 0.2)';
    }
    
    return 'transparent';
  };
  
  // Priority color mapping
  const priorityColors = {
    low: 'bg-blue-100 dark:bg-blue-900',
    medium: 'bg-yellow-100 dark:bg-yellow-900',
    high: 'bg-red-100 dark:bg-red-900'
  };
  
  // Category color mapping
  const categoryColors = {
    personal: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    work: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
    health: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    shopping: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
  };

  return (
    <div className="space-y-6">
      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => setCalendarView('week')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  calendarView === 'week' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setCalendarView('month')}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  calendarView === 'month' 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300'
                }`}
              >
                Month
              </button>
            </div>
            
            <div className="flex gap-1">
              <button className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className={`grid ${calendarView === 'week' ? 'grid-cols-7' : 'grid-cols-7 grid-rows-5'} gap-1 sm:gap-2`}>
            {calendarDays.map((day) => (
              <motion.button
                key={day.dateString}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl relative
                  ${day.isSelected ? 'bg-primary/10 dark:bg-primary/20 border border-primary' : 
                    day.isToday ? 'bg-surface-100 dark:bg-surface-700 border border-surface-300 dark:border-surface-600' : 
                    'bg-white dark:bg-surface-800'}`}
                onClick={() => setSelectedDate(day.dateString)}
              >
                <span className="text-xs text-surface-500 dark:text-surface-400">{day.dayName}</span>
                <span className={`text-lg font-semibold ${
                  day.isToday ? 'text-primary' : 'text-surface-800 dark:text-surface-200'
                }`}>
                  {day.dayNumber}
                </span>
                
                {day.hasTasks && (
                  <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary"></div>
                )}
              </motion.button>
            ))}
          </div>
          
          <div className="pt-2">
            <h3 className="text-lg font-semibold mb-2">
              {format(parseISO(selectedDate), 'EEEE, MMMM d')}
            </h3>
            
            {/* Tasks for selected date */}
            <div className="space-y-2">
              {tasks.filter(task => task.dueDate === selectedDate).length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-surface-500 dark:text-surface-400">No tasks for this day</p>
                </div>
              ) : (
                tasks
                  .filter(task => task.dueDate === selectedDate)
                  .map(task => (
                    <TaskItem 
                      key={task.id}
                      task={task}
                      onComplete={onTaskComplete}
                      onDelete={onTaskDelete}
                      handleTouchStart={handleTouchStart}
                      handleTouchMove={handleTouchMove}
                      handleTouchEnd={handleTouchEnd}
                      getSwipeStyle={getSwipeStyle}
                      getSwipeOpacity={getSwipeOpacity}
                      getSwipeBackground={getSwipeBackground}
                      priorityColors={priorityColors}
                      categoryColors={categoryColors}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Today/Task View */}
      {view === 'today' && (
        <div className="space-y-4">
          {/* Tasks for today */}
          <AnimatePresence>
            {tasks.filter(task => task.dueDate === selectedDate).length === 0 ? (
              <motion.div 
                className="py-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-surface-500 dark:text-surface-400 text-lg">No tasks for today</p>
                <p className="text-surface-400 dark:text-surface-500 mt-2">
                  Add a new task with the + button
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-2"
                layout
              >
                {tasks
                  .filter(task => task.dueDate === selectedDate)
                  .map(task => (
                    <TaskItem 
                      key={task.id}
                      task={task}
                      onComplete={onTaskComplete}
                      onDelete={onTaskDelete}
                      handleTouchStart={handleTouchStart}
                      handleTouchMove={handleTouchMove}
                      handleTouchEnd={handleTouchEnd}
                      getSwipeStyle={getSwipeStyle}
                      getSwipeOpacity={getSwipeOpacity}
                      getSwipeBackground={getSwipeBackground}
                      priorityColors={priorityColors}
                      categoryColors={categoryColors}
                    />
                  ))
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Add Task Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div 
              className="bg-white dark:bg-surface-800 rounded-t-2xl sm:rounded-2xl w-full sm:w-[480px] max-h-[80vh] overflow-y-auto"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">New Task</h2>
                  <button 
                    onClick={() => setShowAdd(false)}
                    className="p-1 rounded-full hover:bg-surface-100 dark:hover:bg-surface-700"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="input text-lg"
                      autoFocus
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-700">
                      <CalendarIcon className="w-5 h-5 text-surface-500" />
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="bg-transparent focus:outline-none w-full"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-700">
                      <ClockIcon className="w-5 h-5 text-surface-500" />
                      <input
                        type="time"
                        value={newTask.dueTime}
                        onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                        className="bg-transparent focus:outline-none w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-500 mb-1">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="input"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-500 mb-1">Category</label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        className="input"
                      >
                        <option value="personal">Personal</option>
                        <option value="work">Work</option>
                        <option value="health">Health</option>
                        <option value="shopping">Shopping</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full btn btn-primary text-center py-3"
                    disabled={!newTask.title.trim()}
                  >
                    Add Task
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Task Item Component
function TaskItem({ 
  task, 
  onComplete, 
  onDelete,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  getSwipeStyle,
  getSwipeOpacity,
  getSwipeBackground,
  priorityColors,
  categoryColors
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="relative"
      style={{
        background: getSwipeBackground(task.id)
      }}
    >
      <motion.div
        className={`flex items-center bg-white dark:bg-surface-800 p-3 sm:p-4 rounded-xl border border-surface-200 dark:border-surface-700 ${
          task.completed ? 'opacity-60' : ''
        }`}
        style={{
          ...getSwipeStyle(task.id),
          position: 'relative',
          zIndex: 1
        }}
        onTouchStart={(e) => handleTouchStart(e, task.id)}
        onTouchMove={(e) => handleTouchMove(e, task.id)}
        onTouchEnd={() => handleTouchEnd(task.id)}
      >
        <button
          onClick={() => onComplete(task.id)}
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 ${
            task.completed 
              ? 'bg-primary border-primary text-white' 
              : 'border-surface-300 dark:border-surface-600'
          }`}
        >
          {task.completed && <CheckIcon className="w-4 h-4" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className={`text-base sm:text-lg font-medium ${
              task.completed ? 'line-through text-surface-400 dark:text-surface-500' : ''
            }`}>
              {task.title}
            </p>
          </div>
          
          <div className="flex items-center mt-1 space-x-2 text-sm text-surface-500 dark:text-surface-400">
            {task.dueTime && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {task.dueTime}
              </span>
            )}
            
            {task.category && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[task.category]}`}>
                {task.category}
              </span>
            )}
            
            {task.priority && (
              <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}></span>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Delete indicator */}
      <div 
        className="absolute inset-y-0 left-0 flex items-center justify-start pl-4"
        style={{ opacity: getSwipeOpacity(task.id) * (getSwipeStyle(task.id).transform?.includes('-') ? 1 : 0) }}
      >
        <TrashIcon className="w-6 h-6 text-red-500" />
      </div>
      
      {/* Complete indicator */}
      <div 
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4"
        style={{ opacity: getSwipeOpacity(task.id) * (getSwipeStyle(task.id).transform?.includes('-') ? 0 : 1) }}
      >
        <CheckIcon className="w-6 h-6 text-green-500" />
      </div>
    </motion.div>
  );
}

export default MainFeature;