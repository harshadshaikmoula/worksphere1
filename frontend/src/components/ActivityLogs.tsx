
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/contexts/EmployeeContext';
import { Activity, User, Clock, FileText } from 'lucide-react';

export const ActivityLogs = () => {
  const { activityLogs } = useEmployees();

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'punch_in': return '🟢';
      case 'punch_out': return '🔴';
      case 'submit': return '📤';
      case 'approve': return '✅';
      case 'reject': return '❌';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'punch_in': 
      case 'punch_out': return 'bg-purple-100 text-purple-800';
      case 'approve': return 'bg-emerald-100 text-emerald-800';
      case 'reject': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h ago`;
    return `${Math.floor(diffInMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Activity className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Activity Logs</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-500">No activities recorded yet</p>
                <p className="text-sm text-gray-400">Activities will appear here as users interact with the system</p>
              </div>
            ) : (
              activityLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full ${getActionColor(log.action)} flex items-center justify-center text-lg`}>
                      {getActionIcon(log.action)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.action.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {log.target}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {log.details}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{log.userName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['CREATE', 'UPDATE', 'DELETE', 'PUNCH_IN'].map((action) => {
          const count = activityLogs.filter(log => log.action.toUpperCase() === action).length;
          return (
            <motion.div
              key={action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">
                    {action.toLowerCase().replace('_', ' ')}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
