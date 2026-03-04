import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Timer } from 'lucide-react';
import { AttendanceRecord } from '@/contexts/EmployeeContext';

interface PunchInOutCardProps {
  todayAttendance: AttendanceRecord | undefined;
  onPunchIn: () => void;
  onPunchOut: () => void;
}

export const PunchInOutCard = ({ todayAttendance, onPunchIn, onPunchOut }: PunchInOutCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Today's Attendance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayAttendance ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Punch In:</span>
                <Badge variant="outline">{todayAttendance.punchIn}</Badge>
              </div>
              {todayAttendance.punchOut ? (
                <>
                  <div className="flex items-center justify-between">
                    <span>Punch Out:</span>
                    <Badge variant="outline">{todayAttendance.punchOut}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hours Worked:</span>
                    <Badge variant="default">
                      {todayAttendance.hoursWorked?.toFixed(1)}h
                    </Badge>
                  </div>
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Work day completed! See you tomorrow.
                  </div>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={onPunchOut}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Timer className="h-4 w-4 mr-2" />
                    Punch Out
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={onPunchIn}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Clock className="h-4 w-4 mr-2" />
                Punch In
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};