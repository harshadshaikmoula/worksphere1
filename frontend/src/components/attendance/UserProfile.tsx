import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/contexts/EmployeeContext';

interface UserProfileProps {
  employee: Employee;
  currentTime: Date;
}

export const UserProfile = ({ employee, currentTime }: UserProfileProps) => {
  // Display the avatar properly - either emoji or uploaded image
  const displayAvatar = employee.avatar?.startsWith('data:') ? (
    <img 
      src={employee.avatar} 
      alt="Profile" 
      className="w-16 h-16 rounded-full object-cover"
    />
  ) : (
    <span className="text-4xl">{employee.avatar}</span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 overflow-hidden">
              {displayAvatar}
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold">{employee.name}</h2>
              <p className="text-blue-100">{employee.designation}</p>
              <p className="text-blue-200 text-sm">{employee.department}</p>
            </div>
          </div>
          <motion.div
            key={currentTime.toLocaleTimeString()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold mb-2"
          >
            {currentTime.toLocaleTimeString()}
          </motion.div>
          <p className="text-blue-100">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};