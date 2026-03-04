
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeeContext';
import { useActivity } from '@/contexts/ActivityContext';
import { Employee } from '@/contexts/EmployeeContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building, 
  User, 
  Edit, 
  Save,
  X,
  Upload,
  Camera
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProfileViewProps {
  employee?: Employee | null;
}

export const ProfileView = ({ employee }: ProfileViewProps) => {
  const { user, updateUserProfile } = useAuth();
  const { updateEmployee, employees } = useEmployees();
  const { logActivity } = useActivity();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Employee>>({});
  
  // Use provided employee or find current user's employee record
  const profile = employee || employees.find(emp => emp.email === user?.email) || {
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 234 567 8900',
    employeeId: 'EMP001',
    department: user?.department || 'Management',
    designation: 'System Administrator',
    joiningDate: '2023-01-01',
    address: '123 Admin Street, Management City',
    avatar: user?.avatar || '👨‍💼',
    isOnline: true,
    lastActive: new Date().toISOString(),
    status: 'active' as const
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImage(imageUrl);
        setEditData(prev => ({ ...prev, avatar: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile);
    setProfileImage(null); // Reset profile image state
  };

  const handleSave = async () => {
    if (profile.id && editData) {
      try {
        // Only update employee record if this is not the admin's fallback profile
        if (employees.find(emp => emp.id === profile.id)) {
          updateEmployee(profile.id, editData);
        }
        
        // If this is the current user's profile, also update auth context
        if (profile.email === user?.email) {
          await updateUserProfile({
            name: editData.name || profile.name,
            avatar: editData.avatar || profile.avatar,
            department: editData.department || profile.department
          });
        }
        
        logActivity('Update Profile', `Updated profile for ${editData.name || profile.name}`, 'profile_update');
        
        toast({
          title: "Profile Updated! ✅",
          description: "Your profile has been updated successfully.",
        });
        
        setIsEditing(false);
        setProfileImage(null);
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "There was an error updating the profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setProfileImage(null);
  };

  const handleChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const displayAvatar = profileImage || editData.avatar || profile.avatar;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <motion.div
              className="absolute -bottom-16 left-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                {displayAvatar?.startsWith('data:') ? (
                  <img 
                    src={displayAvatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">{displayAvatar}</span>
                )}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </motion.div>
          </div>
          
          <CardContent className="pt-20 pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <Input
                      value={editData.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                  )}
                  <Badge variant={profile.isOnline ? "default" : "secondary"} className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${profile.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span>{profile.isOnline ? 'Online' : 'Offline'}</span>
                  </Badge>
                </div>
                {isEditing ? (
                  <Input
                    value={editData.designation || ''}
                    onChange={(e) => handleChange('designation', e.target.value)}
                    placeholder="Designation"
                  />
                ) : (
                  <p className="text-xl text-gray-600 dark:text-gray-300">{profile.designation}</p>
                )}
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <Building className="h-4 w-4" />
                  {isEditing ? (
                    <Input
                      value={editData.department || ''}
                      onChange={(e) => handleChange('department', e.target.value)}
                      placeholder="Department"
                      className="w-40"
                    />
                  ) : (
                    <span>{profile.department}</span>
                  )}
                  <span>•</span>
                  <span>ID: {profile.employeeId}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 space-x-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Mail className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  {isEditing ? (
                    <Input
                      value={editData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      type="email"
                    />
                  ) : (
                    <p className="font-medium dark:text-white">{profile.email}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Phone className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  {isEditing ? (
                    <Input
                      value={editData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      type="tel"
                    />
                  ) : (
                    <p className="font-medium dark:text-white">{profile.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                  {isEditing ? (
                    <Input
                      value={editData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                    />
                  ) : (
                    <p className="font-medium dark:text-white">{profile.address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Work Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Work Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <User className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                  <p className="font-medium font-mono dark:text-white">{profile.employeeId}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Building className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                  <p className="font-medium dark:text-white">{profile.department}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Joining Date</p>
                  <p className="font-medium dark:text-white">{new Date(profile.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
