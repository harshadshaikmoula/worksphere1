
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EmployeeList } from './EmployeeList';
import { EmployeeForm } from './EmployeeForm';
import { Analytics } from './Analytics';
import { AttendanceManagement } from './AttendanceManagement';
import { LeaveManagement } from './LeaveManagement';
import { SalaryIncrement } from './SalaryIncrement';
import { ActivityLogs } from './ActivityLogs';
import { ProfileView } from './ProfileView';
import { EmployeeSettings } from './EmployeeSettings';
import { useAuth } from '@/contexts/AuthContext';

export type ActiveView = 'employees' | 'add-employee' | 'analytics' | 'attendance' | 'leave' | 'salary' | 'activity' | 'profile' | 'settings' | 'approvals';

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveView>('employees');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ActiveView);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeList onNavigate={handleTabChange} />;
      case 'add-employee':
        return <EmployeeForm onCancel={() => setActiveTab('employees')} />;
      case 'analytics':
        return <Analytics />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'leave':
        return <LeaveManagement />;
      case 'salary':
        return <SalaryIncrement />;
      case 'activity':
        return <ActivityLogs />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <EmployeeSettings />;
      case 'approvals':
        return <ApprovalDashboard />;
      default:
        return <EmployeeList onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="flex h-full">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={() => {}} 
            activeView={activeTab} 
            onViewChange={setActiveTab} 
          />
          <main className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

// Updated approval dashboard component - removed leave management for admin
const ApprovalDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <SalaryIncrement />
      </div>
    </div>
  );
};
