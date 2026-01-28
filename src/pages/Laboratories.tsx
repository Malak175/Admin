import { useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Plus, MoreHorizontal, Pencil, Trash2, FlaskConical, MapPin } from 'lucide-react';
import { demoLaboratories, type Laboratory } from '@/services/api';
import { toast } from 'sonner';

const statusColors: Record<Laboratory['status'], string> = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
  pending: 'bg-warning/10 text-warning border-warning/20',
};

const typeColors: Record<Laboratory['type'], string> = {
  clinical: 'bg-primary/10 text-primary border-primary/20',
  pathology: 'bg-secondary/10 text-secondary border-secondary/20',
  radiology: 'bg-accent/10 text-accent border-accent/20',
  general: 'bg-muted text-muted-foreground border-muted',
};

export default function Laboratories() {
  const [labs, setLabs] = useState<Laboratory[]>(demoLaboratories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    type: 'general' as Laboratory['type'],
    accreditation: '',
    status: 'pending' as Laboratory['status'],
  });

  const openCreateDialog = () => {
    setEditingLab(null);
    setFormData({ name: '', email: '', phone: '', location: '', type: 'general', accreditation: '', status: 'pending' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (lab: Laboratory) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name,
      email: lab.email,
      phone: lab.phone,
      location: lab.location,
      type: lab.type,
      accreditation: lab.accreditation,
      status: lab.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingLab) {
      setLabs(labs.map((l) => l.id === editingLab.id ? { ...l, ...formData } : l));
      toast.success('Laboratory updated successfully');
    } else {
      const newLab: Laboratory = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLabs([newLab, ...labs]);
      toast.success('Laboratory added successfully');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setLabs(labs.filter((l) => l.id !== id));
    toast.success('Laboratory removed successfully');
  };

  const columns = [
    {
      key: 'name',
      label: 'Laboratory',
      render: (lab: Laboratory) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{lab.name}</p>
            <p className="text-sm text-muted-foreground">{lab.accreditation}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (lab: Laboratory) => (
        <Badge variant="outline" className={typeColors[lab.type]}>
          {lab.type}
        </Badge>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (lab: Laboratory) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{lab.location}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (lab: Laboratory) => (
        <div>
          <p className="text-sm">{lab.email}</p>
          <p className="text-sm text-muted-foreground">{lab.phone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (lab: Laboratory) => (
        <Badge variant="outline" className={statusColors[lab.status]}>
          {lab.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (lab: Laboratory) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEditDialog(lab)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(lab.id)} className="text-destructive">
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
          <h1 className="text-2xl font-bold text-foreground">Laboratories</h1>
          <p className="text-muted-foreground mt-1">Manage laboratory facilities and partners</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Laboratory
        </Button>
      </div>

      <DataTable data={labs} columns={columns} searchPlaceholder="Search laboratories..." searchKeys={['name', 'location', 'type']} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLab ? 'Edit Laboratory' : 'Add Laboratory'}</DialogTitle>
            <DialogDescription>{editingLab ? 'Update laboratory information.' : 'Fill in the details to add a new laboratory.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Laboratory name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+966 XX XXX XXXX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="lab@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, District" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(value: Laboratory['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="pathology">Pathology</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accreditation">Accreditation</Label>
                <Input id="accreditation" value={formData.accreditation} onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })} placeholder="CAP, ISO, JCI, etc." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value: Laboratory['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingLab ? 'Save Changes' : 'Add Laboratory'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
