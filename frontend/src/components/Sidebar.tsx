
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  BarChart3, 
  Clock, 
  Calendar, 
  Activity,
  User,
  Settings,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { user, logout } = useAuth();

  const adminItems = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'add-employee', label: 'Add Employee', icon: UserPlus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Management', icon: Calendar },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const employeeItems = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Requests', icon: Calendar },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = user?.role === 'admin' ? adminItems : employeeItems;

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-r border-gray-200 dark:border-gray-700"
    >
      <div className="p-6">
        <motion.div
          className="flex items-center space-x-3 mb-8"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl">🏢</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">WorkSphere</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role} Panel</p>
          </div>
        </motion.div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-2'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
