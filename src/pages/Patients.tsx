import { useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, MoreHorizontal, Pencil, Trash2, User } from 'lucide-react';
import { demoPatients, type Patient } from '@/services/api';
import { toast } from 'sonner';

const statusColors: Record<Patient['status'], string> = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

const genderColors: Record<Patient['gender'], string> = {
  male: 'bg-primary/10 text-primary border-primary/20',
  female: 'bg-secondary/10 text-secondary border-secondary/20',
};

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(demoPatients);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male' as Patient['gender'],
    medicalRecordNumber: '',
    status: 'pending' as Patient['status'],
  });

  const openCreateDialog = () => {
    setEditingPatient(null);
    setFormData({ name: '', email: '', phone: '', dateOfBirth: '', gender: 'male', medicalRecordNumber: '', status: 'pending' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      medicalRecordNumber: patient.medicalRecordNumber,
      status: patient.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingPatient) {
      setPatients(patients.map((p) => p.id === editingPatient.id ? { ...p, ...formData } : p));
      toast.success('Patient updated successfully');
    } else {
      const newPatient: Patient = {
        id: String(Date.now()),
        ...formData,
        medicalRecordNumber: formData.medicalRecordNumber || `MRN-${String(Date.now()).slice(-6)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPatients([newPatient, ...patients]);
      toast.success('Patient created successfully');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPatients(patients.filter((p) => p.id !== id));
    toast.success('Patient deleted successfully');
  };

  const columns = [
    {
      key: 'name',
      label: 'Patient',
      render: (patient: Patient) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{patient.name}</p>
            <p className="text-sm text-muted-foreground">{patient.medicalRecordNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (patient: Patient) => (
        <div>
          <p className="text-sm">{patient.email}</p>
          <p className="text-sm text-muted-foreground">{patient.phone}</p>
        </div>
      ),
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (patient: Patient) => (
        <Badge variant="outline" className={genderColors[patient.gender]}>
          {patient.gender}
        </Badge>
      ),
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      render: (patient: Patient) => (
        <span className="text-muted-foreground">{patient.dateOfBirth}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (patient: Patient) => (
        <Badge variant="outline" className={statusColors[patient.status]}>
          {patient.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (patient: Patient) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(patient)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(patient.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage patient records and information</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </div>

      <DataTable data={patients} columns={columns} searchPlaceholder="Search patients..." searchKeys={['name', 'email', 'medicalRecordNumber']} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
            <DialogDescription>{editingPatient ? 'Update patient information.' : 'Fill in the details to add a new patient.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+966 XX XXX XXXX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(value: Patient['gender']) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mrn">Medical Record #</Label>
                <Input id="mrn" value={formData.medicalRecordNumber} onChange={(e) => setFormData({ ...formData, medicalRecordNumber: e.target.value })} placeholder="Auto-generated if empty" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: Patient['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingPatient ? 'Save Changes' : 'Add Patient'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
