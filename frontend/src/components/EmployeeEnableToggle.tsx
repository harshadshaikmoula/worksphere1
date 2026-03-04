
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface EmployeeEnableToggleProps {
  employeeId: string;
  employeeName: string;
  isEnabled: boolean;
}

export const EmployeeEnableToggle = ({ employeeId, employeeName, isEnabled }: EmployeeEnableToggleProps) => {
  const { user } = useAuth();
  const { enableEmployee, disableEmployee } = useEmployees();
  const [loading, setLoading] = useState(false);

  // Only allow admin to toggle
  if (user?.role !== 'admin') {
    return null;
  }

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    
    try {
      if (checked) {
        enableEmployee(employeeId);
        toast({
          title: "Employee Enabled ✅",
          description: `${employeeName} has been enabled successfully.`,
        });
      } else {
        disableEmployee(employeeId);
        toast({
          title: "Employee Disabled ⚠️",
          description: `${employeeName} has been disabled successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">
        {isEnabled ? 'Enabled' : 'Disabled'}
      </span>
      <Switch
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={loading}
      />
    </div>
  );
};
