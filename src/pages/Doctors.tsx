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
import { Plus, MoreHorizontal, Pencil, Trash2, Stethoscope } from 'lucide-react';
import { demoDoctors, type Doctor } from '@/services/api';
import { toast } from 'sonner';

const statusColors: Record<Doctor['status'], string> = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
  'on-leave': 'bg-warning/10 text-warning border-warning/20',
};

const specialties = [
  'Cardiology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Neurology',
  'Ophthalmology', 'Psychiatry', 'Radiology', 'General Surgery', 'Internal Medicine'
];

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>(demoDoctors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    experience: 0,
    status: 'active' as Doctor['status'],
  });

  const openCreateDialog = () => {
    setEditingDoctor(null);
    setFormData({ name: '', email: '', phone: '', specialty: '', licenseNumber: '', experience: 0, status: 'active' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      licenseNumber: doctor.licenseNumber,
      experience: doctor.experience,
      status: doctor.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.specialty) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingDoctor) {
      setDoctors(doctors.map((d) => d.id === editingDoctor.id ? { ...d, ...formData } : d));
      toast.success('Doctor updated successfully');
    } else {
      const newDoctor: Doctor = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDoctors([newDoctor, ...doctors]);
      toast.success('Doctor added successfully');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setDoctors(doctors.filter((d) => d.id !== id));
    toast.success('Doctor removed successfully');
  };

  const columns = [
    {
      key: 'name',
      label: 'Doctor',
      render: (doctor: Doctor) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-secondary/20 text-secondary text-sm">
              {doctor.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">{doctor.licenseNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'specialty',
      label: 'Specialty',
      render: (doctor: Doctor) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          <span>{doctor.specialty}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (doctor: Doctor) => (
        <div>
          <p className="text-sm">{doctor.email}</p>
          <p className="text-sm text-muted-foreground">{doctor.phone}</p>
        </div>
      ),
    },
    {
      key: 'experience',
      label: 'Experience',
      render: (doctor: Doctor) => (
        <span>{doctor.experience} years</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (doctor: Doctor) => (
        <Badge variant="outline" className={statusColors[doctor.status]}>
          {doctor.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (doctor: Doctor) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(doctor)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(doctor.id)} className="text-destructive">
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
          <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground mt-1">Manage medical staff and specialists</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <DataTable data={doctors} columns={columns} searchPlaceholder="Search doctors..." searchKeys={['name', 'specialty', 'email']} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
            <DialogDescription>{editingDoctor ? 'Update doctor information.' : 'Fill in the details to add a new doctor.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Dr. Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+966 XX XXX XXXX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="dr.name@tabeebak.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Specialty *</Label>
                <Select value={formData.specialty} onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
                  <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                  <SelectContent>
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Number</Label>
                <Input id="license" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} placeholder="SL-XXXXX" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input id="experience" type="number" min="0" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: Doctor['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingDoctor ? 'Save Changes' : 'Add Doctor'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
