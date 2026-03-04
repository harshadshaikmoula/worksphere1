import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { fetchAllAttendance, fetchAttendanceByEmployee, fetchEmployees } from '@/lib/api';
import { AttendanceRecord, Employee } from '@/contexts/EmployeeContext';
import { User } from '@/contexts/AuthContext';

interface AttendanceHistoryCardProps {
  user: User | null;
  today: string;
}

export const AttendanceHistoryCard = ({ user, today }: AttendanceHistoryCardProps) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const [attendanceRes, employeesRes] = await Promise.all([
            fetchAllAttendance(),
            fetchEmployees()
          ]);
          setAttendance(attendanceRes.data);
          setEmployees(employeesRes.data);
        } else if (user) {
          const [empRes, attendanceRes] = await Promise.all([
            fetchEmployees(), // or fetch employee by ID if API exists
            fetchAttendanceByEmployee(user.id)
          ]);
          const me = empRes.data.find((emp: Employee) => emp.id === user.id);
          setEmployees(empRes.data);
          setCurrentEmployee(me);
          setAttendance(attendanceRes.data);
        }
      } catch (err) {
        console.error("Error fetching attendance data:", err);
      }
    };

    fetchData();
  }, [user]);

  const attendanceData = isAdmin
    ? attendance.filter(record => record.date === today)
    : attendance.slice(0, 5); // already filtered by employee

  // 💡 Now continue your rendering logic as before...
}