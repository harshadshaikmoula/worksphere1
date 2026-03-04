
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
import { useNotifications } from '@/contexts/NotificationContext';
import { Calendar, Plus, Check, X, Loader2, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const LeaveManagement = () => {
  const { user } = useAuth();
  const { logActivity } = useActivity();
  const { addNotification } = useNotifications();
  const { 
    employees,
    leaveRequests, 
    submitLeaveRequest, 
    getLeaveRequestsByEmployee,
    approveLeaveRequest,
    rejectLeaveRequest
  } = useEmployees();

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'casual' as 'sick' | 'casual' | 'annual' | 'emergency'
  });

  // Find current employee by email or create temp employee for admin
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
    status: 'active' as const
  };

  const userLeaveRequests = getLeaveRequestsByEmployee(currentEmployee.id);
  const pendingRequests = leaveRequests.filter(req => req.status === 'pending');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitLeaveRequest({
        employeeId: currentEmployee.id,
        employeeName: currentEmployee.name,
        ...formData
      });

      // Add notification for admin users
      addNotification({
        title: "New Leave Request",
        message: `${currentEmployee.name} has submitted a ${formData.type} leave request`,
        type: "info",
        action: {
          label: "Review Request",
          onClick: () => {
            // This would navigate to leave management in admin view
            console.log("Navigate to leave requests");
          }
        }
      });

      logActivity('Submit Leave Request', `${currentEmployee.name} submitted ${formData.type} leave request`, 'leave_request');

      toast({
        title: "Leave Request Submitted! 🎉",
        description: "Your leave request has been submitted successfully.",
      });

      // Reset form
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'casual'
      });
      setShowForm(false);
    } catch (error) {
      console.error('Leave submission error:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your leave request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = (requestId: string, employeeName: string) => {
    approveLeaveRequest(requestId, user?.name || 'Admin');
    
    addNotification({
      title: "Leave Request Approved",
      message: `Your leave request has been approved by ${user?.name}`,
      type: "success"
    });

    logActivity('Approve Leave Request', `${user?.name} approved leave request for ${employeeName}`, 'leave_request');
    
    toast({
      title: "Request Approved",
      description: `Leave request for ${employeeName} has been approved.`,
    });
  };

  const handleReject = (requestId: string, employeeName: string) => {
    rejectLeaveRequest(requestId);
    
    addNotification({
      title: "Leave Request Rejected",
      message: `Your leave request has been rejected by ${user?.name}`,
      type: "error"
    });

    logActivity('Reject Leave Request', `${user?.name} rejected leave request for ${employeeName}`, 'leave_request');
    
    toast({
      title: "Request Rejected",
      description: `Leave request for ${employeeName} has been rejected.`,
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sick': return '🏥';
      case 'casual': return '🏖️';
      case 'annual': return '🌴';
      case 'emergency': return '🚨';
      default: return '📅';
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Admin view - show all pending requests for approval
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Leave Request Management
          </h2>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {pendingRequests.length} Pending Requests
          </Badge>
        </motion.div>

        {/* Pending Leave Requests for Admin Approval */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Leave Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No pending leave requests</p>
              ) : (
                pendingRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getTypeIcon(request.type)}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{request.employeeName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {`${request.type} Leave - ${calculateDays(request.startDate, request.endDate)} day(s)`}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id, request.employeeName)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id, request.employeeName)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <p><strong>From:</strong> {new Date(request.startDate).toLocaleDateString()}</p>
                      <p><strong>To:</strong> {new Date(request.endDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                      <p className="text-sm"><strong>Reason:</strong> {request.reason}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Applied: {new Date(request.appliedDate).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Leave Requests History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>All Leave Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaveRequests.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">No leave requests found</p>
              ) : (
                leaveRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getTypeIcon(request.type)}</span>
                        <span className="font-medium">{request.employeeName}</span>
                        <span className="text-sm text-gray-500">
                          ({calculateDays(request.startDate, request.endDate)} day(s))
                        </span>
                      </div>
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <p>From: {new Date(request.startDate).toLocaleDateString()}</p>
                      <p>To: {new Date(request.endDate).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">{request.reason}</p>
                    {request.approvedBy && (
                      <p className="text-xs text-green-600 mt-2">
                        Approved by: {request.approvedBy}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Applied: {new Date(request.appliedDate).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Employee view - submit and view own requests
  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Leave Management
        </h2>
        {!showForm && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Leave Request Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Calendar className="h-5 w-5 text-blue-500" />
                </motion.div>
                <span>Submit Leave Request</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      required
                      className="transition-all duration-300"
                    />
                  </div>
                </div>

                {formData.startDate && formData.endDate && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm text-gray-600 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500"
                  >
                    <strong>Duration:</strong> {calculateDays(formData.startDate, formData.endDate)} day(s)
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">🏖️ Casual Leave</SelectItem>
                      <SelectItem value="sick">🏥 Sick Leave</SelectItem>
                      <SelectItem value="annual">🌴 Annual Leave</SelectItem>
                      <SelectItem value="emergency">🚨 Emergency Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a detailed reason for your leave request..."
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    required
                    rows={4}
                    className="transition-all duration-300 resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
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
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* User's Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>My Leave Requests</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userLeaveRequests.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No leave requests found</p>
            ) : (
              userLeaveRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getTypeIcon(request.type)}</span>
                      <span className="font-medium">
                        {`${request.type} Leave`}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({calculateDays(request.startDate, request.endDate)} day(s))
                      </span>
                    </div>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <p>From: {new Date(request.startDate).toLocaleDateString()}</p>
                    <p>To: {new Date(request.endDate).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">{request.reason}</p>
                  {request.approvedBy && (
                    <p className="text-xs text-green-600 mt-2">
                      Approved by: {request.approvedBy}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Applied: {new Date(request.appliedDate).toLocaleDateString()}
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
