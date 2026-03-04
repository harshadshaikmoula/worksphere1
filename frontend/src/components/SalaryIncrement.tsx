
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useActivity } from '@/contexts/ActivityContext';
import { DollarSign, Plus, Check, X, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SalaryRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  currentSalary: number;
  requestedSalary: number;
  incrementPercentage: number;
  reason: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export const SalaryIncrement = () => {
  const { user } = useAuth();
  const { logActivity } = useActivity();
  const { employees } = useEmployees();
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salaryRequests, setSalaryRequests] = useState<SalaryRequest[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'John Doe',
      currentSalary: 85000,
      requestedSalary: 95000,
      incrementPercentage: 11.76,
      reason: 'Performance Excellence',
      justification: 'Consistently exceeded targets and led 3 successful projects this year',
      status: 'pending',
      requestDate: '2024-06-10'
    }
  ]);

  const [formData, setFormData] = useState({
    currentSalary: '',
    requestedSalary: '',
    reason: '',
    justification: ''
  });

  // Find current employee
  const currentEmployee = employees.find(emp => emp.email === user?.email) || {
    id: user?.id || 'admin-temp',
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@company.com',
    employeeId: 'ADMIN001',
    department: user?.department || 'Management',
    designation: 'Administrator',
    phone: '+1 234 567 8900',
    joiningDate: '2023-01-01',
    address: '123 Admin Street',
    avatar: user?.avatar || '👨‍💼',
    isOnline: true,
    lastActive: new Date().toISOString(),
    status: 'active' as const,
    salary: 120000
  };

  const pendingRequests = salaryRequests.filter(req => req.status === 'pending');
  const userRequests = salaryRequests.filter(req => req.employeeId === currentEmployee.id);

  const calculatePercentage = (current: number, requested: number) => {
    return ((requested - current) / current * 100).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentSal = parseFloat(formData.currentSalary);
    const requestedSal = parseFloat(formData.requestedSalary);

    if (!formData.currentSalary || !formData.requestedSalary || !formData.reason || !formData.justification) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (requestedSal <= currentSal) {
      toast({
        title: "Invalid Amount",
        description: "Requested salary must be higher than current salary",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newRequest: SalaryRequest = {
        id: Date.now().toString(),
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        currentSalary: currentSal,
        requestedSalary: requestedSal,
        incrementPercentage: parseFloat(calculatePercentage(currentSal, requestedSal)),
        reason: formData.reason,
        justification: formData.justification,
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0]
      };

      setSalaryRequests(prev => [...prev, newRequest]);
      logActivity('Submit Salary Request', `${currentEmployee.name} requested salary increment`, 'create');

      toast({
        title: "Salary Request Submitted! 💰",
        description: "Your salary increment request has been submitted for review.",
      });

      setFormData({
        currentSalary: '',
        requestedSalary: '',
        reason: '',
        justification: ''
      });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = (requestId: string) => {
    setSalaryRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'approved' as const, 
        approvedBy: user?.name || 'Admin',
        approvedDate: new Date().toISOString().split('T')[0]
      } : req
    ));
    
    const request = salaryRequests.find(req => req.id === requestId);
    logActivity('Approve Salary Request', `Approved salary increment for ${request?.employeeName}`, 'update');
    toast({
      title: "Salary Request Approved ✅",
      description: "The salary increment request has been approved.",
    });
  };

  const handleReject = (requestId: string) => {
    setSalaryRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    ));
    
    const request = salaryRequests.find(req => req.id === requestId);
    logActivity('Reject Salary Request', `Rejected salary increment for ${request?.employeeName}`, 'update');
    toast({
      title: "Salary Request Rejected ❌",
      description: "The salary increment request has been rejected.",
      variant: "destructive",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Salary Management
        </h2>
        {user?.role === 'employee' && !showForm && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Increment
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Statistics for Admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {salaryRequests.filter(r => r.status === 'approved').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <X className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {salaryRequests.filter(r => r.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{salaryRequests.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span>Submit Salary Increment Request</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentSalary">Current Salary ($)</Label>
                    <Input
                      id="currentSalary"
                      type="number"
                      placeholder="75000"
                      value={formData.currentSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentSalary: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requestedSalary">Requested Salary ($)</Label>
                    <Input
                      id="requestedSalary"
                      type="number"
                      placeholder="85000"
                      value={formData.requestedSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, requestedSalary: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {formData.currentSalary && formData.requestedSalary && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm text-gray-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500"
                  >
                    <strong>Increment:</strong> {calculatePercentage(parseFloat(formData.currentSalary), parseFloat(formData.requestedSalary))}% 
                    (${(parseFloat(formData.requestedSalary) - parseFloat(formData.currentSalary)).toLocaleString()})
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label>Reason for Increment</Label>
                  <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Performance Excellence">🏆 Performance Excellence</SelectItem>
                      <SelectItem value="Market Adjustment">📈 Market Adjustment</SelectItem>
                      <SelectItem value="Promotion">⬆️ Promotion</SelectItem>
                      <SelectItem value="Additional Responsibilities">📋 Additional Responsibilities</SelectItem>
                      <SelectItem value="Skills Enhancement">🎓 Skills Enhancement</SelectItem>
                      <SelectItem value="Retention">🤝 Retention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Justification</Label>
                  <Textarea
                    id="justification"
                    placeholder="Please provide detailed justification for your salary increment request..."
                    value={formData.justification}
                    onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
                    required
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Admin Pending Requests */}
      {user?.role === 'admin' && pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>Pending Salary Requests ({pendingRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{request.employeeName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${request.currentSalary.toLocaleString()} → ${request.requestedSalary.toLocaleString()} 
                        ({request.incrementPercentage}% increase)
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        className="text-red-600 border-red-300"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Reason:</strong> {request.reason}</p>
                    <p><strong>Justification:</strong> {request.justification}</p>
                    <p className="text-xs text-gray-500">Requested: {new Date(request.requestDate).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>{user?.role === 'admin' ? 'All Salary Requests' : 'My Salary Requests'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(user?.role === 'admin' ? salaryRequests : userRequests).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No salary requests found</p>
            ) : (
              (user?.role === 'admin' ? salaryRequests : userRequests).map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">
                        {user?.role === 'admin' ? request.employeeName : request.reason}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${request.currentSalary.toLocaleString()} → ${request.requestedSalary.toLocaleString()} 
                        ({request.incrementPercentage}% increase)
                      </p>
                    </div>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{request.justification}</p>
                  {request.approvedBy && (
                    <p className="text-xs text-green-600">
                      Approved by: {request.approvedBy} on {new Date(request.approvedDate!).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Requested: {new Date(request.requestDate).toLocaleDateString()}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
