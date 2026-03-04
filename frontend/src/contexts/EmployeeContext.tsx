import { createContext, useContext, useState, ReactNode } from 'react';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  designation: string;
  joiningDate: string;
  address: string;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
  status: 'active' | 'inactive' | 'on-leave';
  salary?: number;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  isEnabled?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: 'sick' | 'casual' | 'annual' | 'emergency';
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
}

export interface SalaryIncrementRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  requestedSalary: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  approvedBy?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  punchIn: string;
  punchOut?: string;
  status: 'present' | 'late' | 'absent';
  hoursWorked?: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  target: string;
  userName: string;
  timestamp: string;
}

interface EmployeeContextType {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  salaryIncrementRequests: SalaryIncrementRequest[];
  attendance: AttendanceRecord[];
  activityLogs: ActivityLog[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  enableEmployee: (id: string) => void;
  disableEmployee: (id: string) => void;
  searchEmployees: (query: string) => Employee[];
  filterByDepartment: (department: string) => Employee[];
  filterByStatus: (status: string) => Employee[];
  submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  approveLeaveRequest: (id: string, approvedBy: string) => void;
  rejectLeaveRequest: (id: string) => void;
  getLeaveRequestsByEmployee: (employeeId: string) => LeaveRequest[];
  submitSalaryIncrementRequest: (request: Omit<SalaryIncrementRequest, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  approveSalaryIncrementRequest: (id: string, approvedBy: string) => void;
  rejectSalaryIncrementRequest: (id: string) => void;
  getSalaryIncrementRequestsByEmployee: (employeeId: string) => SalaryIncrementRequest[];
  punchIn: (employeeId: string) => void;
  punchOut: (employeeId: string) => void;
  getAttendanceByEmployee: (employeeId: string) => AttendanceRecord[];
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Supritha Vallela',
      email: 'supritha@company.com',
      phone: '+1 234 567 8901',
      employeeId: 'EMP001',
      department: 'Engineering',
      designation: 'Software Engineer',
      joiningDate: '2023-01-15',
      address: '123 Tech Street, Engineering City',
      avatar: '👩‍💻',
      isOnline: true,
      lastActive: new Date().toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '2',
      name: 'Harshad',
      email: 'harshad@company.com',
      phone: '+1 234 567 8902',
      employeeId: 'EMP002',
      department: 'Design',
      designation: 'UI/UX Designer',
      joiningDate: '2023-02-01',
      address: '456 Design Avenue, Creative City',
      avatar: '👨‍🎨',
      isOnline: false,
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '3',
      name: 'Saraswathi',
      email: 'saraswathi@company.com',
      phone: '+1 234 567 8903',
      employeeId: 'EMP003',
      department: 'Marketing',
      designation: 'Marketing Manager',
      joiningDate: '2023-01-20',
      address: '789 Marketing Lane, Business City',
      avatar: '👩‍💼',
      isOnline: true,
      lastActive: new Date().toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '4',
      name: 'Kavitha',
      email: 'kavitha@company.com',
      phone: '+1 234 567 8904',
      employeeId: 'EMP004',
      department: 'HR',
      designation: 'HR Specialist',
      joiningDate: '2023-03-01',
      address: '321 HR Boulevard, People City',
      avatar: '👩‍💼',
      isOnline: true,
      lastActive: new Date().toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '5',
      name: 'Dheeraja',
      email: 'dheeraja@company.com',
      phone: '+1 234 567 8905',
      employeeId: 'EMP005',
      department: 'Engineering',
      designation: 'DevOps Engineer',
      joiningDate: '2023-02-15',
      address: '654 DevOps Drive, Infrastructure City',
      avatar: '👨‍🔧',
      isOnline: false,
      lastActive: new Date(Date.now() - 1800000).toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '6',
      name: 'Sruthi',
      email: 'sruthi@company.com',
      phone: '+1 234 567 8906',
      employeeId: 'EMP006',
      department: 'Quality Assurance',
      designation: 'QA Engineer',
      joiningDate: '2023-01-30',
      address: '987 Quality Street, Testing City',
      avatar: '👩‍🔬',
      isOnline: true,
      lastActive: new Date().toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '7',
      name: 'Govind Sir',
      email: 'govind@company.com',
      phone: '+1 234 567 8907',
      employeeId: 'EMP007',
      department: 'Management',
      designation: 'Project Manager',
      joiningDate: '2022-12-01',
      address: '147 Management Plaza, Leadership City',
      avatar: '👨‍💼',
      isOnline: true,
      lastActive: new Date().toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '8',
      name: 'Vijayalakshmi Mam',
      email: 'vijayalakshmi@company.com',
      phone: '+1 234 567 8908',
      employeeId: 'EMP008',
      department: 'Training',
      designation: 'Java Full Stack Trainer',
      joiningDate: '2022-11-15',
      address: '258 Training Center, Education City',
      avatar: '👩‍🏫',
      isOnline: true,
      lastActive: new Date().toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '9',
      name: 'Mahalakshmi Mam',
      email: 'mahalakshmi@company.com',
      phone: '+1 234 567 8909',
      employeeId: 'EMP009',
      department: 'Training',
      designation: 'Java Full Stack Trainer',
      joiningDate: '2022-10-01',
      address: '369 Learning Lane, Knowledge City',
      avatar: '👩‍🏫',
      isOnline: false,
      lastActive: new Date(Date.now() - 7200000).toISOString(),
      status: 'active',
      isEnabled: true
    },
    {
      id: '10',
      name: 'Meghana Mam',
      email: 'meghana@company.com',
      phone: '+1 234 567 8910',
      employeeId: 'EMP010',
      department: 'Training',
      designation: 'Java Full Stack Trainer',
      joiningDate: '2023-01-10',
      address: '741 Academy Avenue, Skill City',
      avatar: '👩‍🏫',
      isOnline: true,
      lastActive: new Date().toISOString(),
      status: 'active',
      isEnabled: true
    }
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [salaryIncrementRequests, setSalaryIncrementRequests] = useState<SalaryIncrementRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
      isEnabled: true,
    };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    ));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const enableEmployee = (id: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, isEnabled: true } : emp
    ));
  };

  const disableEmployee = (id: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, isEnabled: false } : emp
    ));
  };

  const searchEmployees = (query: string) => {
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.email.toLowerCase().includes(query.toLowerCase()) ||
      emp.department.toLowerCase().includes(query.toLowerCase()) ||
      emp.designation.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filterByDepartment = (department: string) => {
    return employees.filter(emp => emp.department === department);
  };

  const filterByStatus = (status: string) => {
    return employees.filter(emp => emp.status === status);
  };

  const submitLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      appliedDate: new Date().toISOString()
    };
    setLeaveRequests(prev => [...prev, newRequest]);
  };

  const approveLeaveRequest = (id: string, approvedBy: string) => {
    setLeaveRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'approved' as const, approvedBy } : req
    ));
  };

  const rejectLeaveRequest = (id: string) => {
    setLeaveRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const getLeaveRequestsByEmployee = (employeeId: string) => {
    return leaveRequests.filter(req => req.employeeId === employeeId);
  };

  const submitSalaryIncrementRequest = async (request: Omit<SalaryIncrementRequest, 'id' | 'status' | 'appliedDate'>) => {
    const newRequest: SalaryIncrementRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      appliedDate: new Date().toISOString()
    };
    setSalaryIncrementRequests(prev => [...prev, newRequest]);
  };

  const approveSalaryIncrementRequest = (id: string, approvedBy: string) => {
    setSalaryIncrementRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'approved' as const, approvedBy } : req
    ));
  };

  const rejectSalaryIncrementRequest = (id: string) => {
    setSalaryIncrementRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const getSalaryIncrementRequestsByEmployee = (employeeId: string) => {
    return salaryIncrementRequests.filter(req => req.employeeId === employeeId);
  };

  const punchIn = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = attendance.find(
      record => record.employeeId === employeeId && record.date === today
    );

    if (!existingRecord) {
      const now = new Date();
      const punchInTime = now.toTimeString().split(' ')[0];
      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);
      
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employeeId,
        date: today,
        punchIn: punchInTime,
        status: isLate ? 'late' : 'present'
      };
      
      setAttendance(prev => [...prev, newRecord]);
    }
  };

  const punchOut = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendance(prev => prev.map(record => {
      if (record.employeeId === employeeId && record.date === today && !record.punchOut) {
        const now = new Date();
        const punchOutTime = now.toTimeString().split(' ')[0];
        const punchInDate = new Date(`${today}T${record.punchIn}`);
        const punchOutDate = new Date(`${today}T${punchOutTime}`);
        const hoursWorked = (punchOutDate.getTime() - punchInDate.getTime()) / (1000 * 60 * 60);
        
        return {
          ...record,
          punchOut: punchOutTime,
          hoursWorked: Math.round(hoursWorked * 100) / 100
        };
      }
      return record;
    }));
  };

  const getAttendanceByEmployee = (employeeId: string) => {
    return attendance.filter(record => record.employeeId === employeeId).reverse();
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      leaveRequests,
      salaryIncrementRequests,
      attendance,
      activityLogs,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      enableEmployee,
      disableEmployee,
      searchEmployees,
      filterByDepartment,
      filterByStatus,
      submitLeaveRequest,
      approveLeaveRequest,
      rejectLeaveRequest,
      getLeaveRequestsByEmployee,
      submitSalaryIncrementRequest,
      approveSalaryIncrementRequest,
      rejectSalaryIncrementRequest,
      getSalaryIncrementRequestsByEmployee,
      punchIn,
      punchOut,
      getAttendanceByEmployee
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
