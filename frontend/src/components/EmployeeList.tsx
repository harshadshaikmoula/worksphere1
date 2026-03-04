import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Employee } from '@/contexts/EmployeeContext';
import { EmployeeDetailView } from '@/components/EmployeeDetailView';
import { Search, Filter, Plus, Edit, Trash2, Eye, Users, Save, X } from 'lucide-react';

interface EmployeeListProps {
  onNavigate?: (tab: string) => void;
}

export const EmployeeList = ({ onNavigate }: EmployeeListProps) => {
  const { user } = useAuth();
  const { employees, deleteEmployee, updateEmployee, searchEmployees, filterByDepartment, filterByStatus } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editData, setEditData] = useState<Partial<Employee>>({});
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Filter employees based on search and filters
  const filteredEmployees = employees
    .filter(emp => {
      if (searchQuery) {
        return searchEmployees(searchQuery).includes(emp);
      }
      return true;
    })
    .filter(emp => {
      if (departmentFilter !== 'all') {
        return emp.department === departmentFilter;
      }
      return true;
    })
    .filter(emp => {
      if (statusFilter !== 'all') {
        return emp.status === statusFilter;
      }
      return true;
    });

  const departments = [...new Set(employees.map(emp => emp.department))].filter(dept => dept && dept.trim() !== '');

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditData(employee);
  };

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee);
  };

  const handleSaveEdit = () => {
    if (editingEmployee && editData) {
      updateEmployee(editingEmployee.id, editData);
      setEditingEmployee(null);
      setEditData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setEditData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'on-leave': return 'outline';
      default: return 'secondary';
    }
  };

  const handleAddEmployee = () => {
    if (onNavigate) {
      onNavigate('add-employee');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Employee Directory</h2>
          <Badge variant="outline">{filteredEmployees.length} employees</Badge>
        </div>
        
        {user?.role === 'admin' && (
          <Button onClick={handleAddEmployee} className="bg-green-500 hover:bg-green-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="lg:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                      {employee.avatar?.startsWith('data:') ? (
                        <img 
                          src={employee.avatar} 
                          alt={employee.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        employee.avatar
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.designation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${employee.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <Badge variant={getStatusColor(employee.status)}>
                      {employee.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Department:</span> {employee.department}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">ID:</span> {employee.employeeId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {employee.email}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    onClick={() => handleView(employee)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  {user?.role === 'admin' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(employee)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Employee Detail View Modal */}
      <EmployeeDetailView 
        employee={viewingEmployee}
        isOpen={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
      />

      {/* Edit Employee Dialog */}
      <Dialog open={!!editingEmployee} onOpenChange={() => handleCancelEdit()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editData.name || ''}
                onChange={(e) => handleEditChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editData.email || ''}
                onChange={(e) => handleEditChange('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select value={editData.department || undefined} onValueChange={(value) => handleEditChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-designation">Designation</Label>
              <Input
                id="edit-designation"
                value={editData.designation || ''}
                onChange={(e) => handleEditChange('designation', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editData.status || undefined} onValueChange={(value: 'active' | 'inactive' | 'on-leave') => handleEditChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
