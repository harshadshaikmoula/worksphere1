
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
  type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'leave_request' | 'leave_approval' | 'profile_update';
  metadata?: Record<string, any>;
}

interface ActivityContextType {
  activities: ActivityLog[];
  logActivity: (action: string, details: string, type: ActivityLog['type'], metadata?: Record<string, any>) => void;
  getActivitiesByUser: (userId: string) => ActivityLog[];
  getRecentActivities: (limit?: number) => ActivityLog[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // Load activities from localStorage
    const stored = localStorage.getItem('activityLogs');
    if (stored) {
      const parsed = JSON.parse(stored).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }));
      setActivities(parsed);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever activities change
    localStorage.setItem('activityLogs', JSON.stringify(activities));
  }, [activities]);

  const logActivity = (action: string, details: string, type: ActivityLog['type'], metadata?: Record<string, any>) => {
    if (!user) return;

    const newActivity: ActivityLog = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      action,
      details,
      type,
      timestamp: new Date(),
      metadata
    };

    setActivities(prev => [newActivity, ...prev]);
  };

  const getActivitiesByUser = (userId: string) => {
    return activities.filter(activity => activity.userId === userId);
  };

  const getRecentActivities = (limit = 50) => {
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  };

  return (
    <ActivityContext.Provider value={{
      activities,
      logActivity,
      getActivitiesByUser,
      getRecentActivities,
    }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};
