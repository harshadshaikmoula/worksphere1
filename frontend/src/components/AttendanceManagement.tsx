
import React, { useState } from 'react';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useActivity } from '@/contexts/ActivityContext';
import { toast } from '@/hooks/use-toast';
import { UserProfile } from './attendance/UserProfile';
import { PunchInOutCard } from './attendance/PunchInOutCard';
import { MonthlyStatsCard } from './attendance/MonthlyStatsCard';
import { AttendanceHistoryCard } from './attendance/AttendanceHistoryCard';

export const AttendanceManagement = () => {
  const { user } = useAuth();
  const { logActivity } = useActivity();
  const { 
    employees, 
    attendance, 
    punchIn, 
    punchOut, 
    getAttendanceByEmployee 
  } = useEmployees();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  
  // Create proper employee profile based on logged-in user
  const currentEmployee = React.useMemo(() => {
    // First try to find the user in the employees array
    const foundEmployee = employees.find(emp => emp.email === user?.email);
    
    if (foundEmployee) {
      return foundEmployee;
    }
    
    // If not found, create a profile based on the logged-in user
    return {
      id: user?.id || `user-${Date.now()}`,
      name: user?.name || 'User',
      email: user?.email || 'user@company.com',
      employeeId: user?.role === 'admin' ? 'ADMIN001' : `EMP-${user?.id?.slice(0, 3).toUpperCase() || 'USR'}`,
      department: user?.department || (user?.role === 'admin' ? 'Management' : 'General'),
      designation: user?.role === 'admin' ? 'Administrator' : 'Employee',
      phone: '+1 234 567 8900',
      joiningDate: '2023-01-01',
      address: '123 Company Street',
      avatar: user?.avatar || (user?.role === 'admin' ? '👨‍💼' : '👤'),
      isOnline: true,
      lastActive: new Date().toISOString(),
      status: 'active' as const
    };
  }, [user, employees]);

  const todayAttendance = attendance.find(
    record => record.employeeId === currentEmployee.id && record.date === today
  );

  const handlePunchIn = () => {
    punchIn(currentEmployee.id);
    logActivity('Punch In', `${currentEmployee.name} punched in`, 'login');
    toast({
      title: "Punched In! ✅",
      description: `${currentEmployee.name}, your attendance has been recorded successfully.`,
    });
  };

  const handlePunchOut = () => {
    punchOut(currentEmployee.id);
    logActivity('Punch Out', `${currentEmployee.name} punched out`, 'logout');
    toast({
      title: "Punched Out! 👋",
      description: `${currentEmployee.name}, your work day has been recorded. Have a great day!`,
    });
  };

  const getAttendanceStats = () => {
    const employeeAttendance = getAttendanceByEmployee(currentEmployee.id);
    const thisMonth = employeeAttendance.filter(record => {
      const recordDate = new Date(record.date);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && 
             recordDate.getFullYear() === now.getFullYear();
    });

    return {
      present: thisMonth.filter(r => r.status === 'present').length,
      late: thisMonth.filter(r => r.status === 'late').length,
      absent: thisMonth.filter(r => r.status === 'absent').length
    };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <UserProfile employee={currentEmployee} currentTime={currentTime} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PunchInOutCard 
          todayAttendance={todayAttendance}
          onPunchIn={handlePunchIn}
          onPunchOut={handlePunchOut}
        />

        <MonthlyStatsCard stats={stats} />
      </div>

      <AttendanceHistoryCard
        user={user}
        attendance={attendance}
        employees={employees}
        currentEmployee={currentEmployee}
        today={today}
        getAttendanceByEmployee={getAttendanceByEmployee}
      />
    </div>
  );
};
