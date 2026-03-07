import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createDoctor, disableDoctor, listDoctors, updateDoctor } from "@/services/admin/userService";
import { toApiError } from "@/services/api/errors";
import type { DoctorItem } from "@/services/admin/types";

const initialCreate = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  specialization: "",
  license_number: "",
  consultation_price: "",
  experience_years: "",
};

const initialEdit = {
  first_name: "",
  last_name: "",
  phone: "",
  specialization: "",
  license_number: "",
  consultation_price: "",
  experience_years: "",
  location: "",
  lat: "",
  lng: "",
};

export default function Doctors() {
  const [items, setItems] = useState<DoctorItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreate);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<DoctorItem | null>(null);
  const [editForm, setEditForm] = useState(initialEdit);
  const [deleteTarget, setDeleteTarget] = useState<DoctorItem | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listDoctors({ page, limit, include_inactive: includeInactive });
      setItems(response.items ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [page, limit, includeInactive]);

  const submitCreate = async () => {
    if (
      !createForm.email ||
      !createForm.password ||
      !createForm.first_name ||
      !createForm.last_name ||
      !createForm.phone ||
      !createForm.specialization ||
      !createForm.license_number ||
      !createForm.consultation_price ||
      !createForm.experience_years
    ) {
      toast.error("Please complete all required fields");
      return;
    }
    try {
      await createDoctor({
        email: createForm.email,
        password: createForm.password,
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        phone: createForm.phone,
        specialization: createForm.specialization,
        license_number: createForm.license_number,
        consultation_price: Number(createForm.consultation_price),
        experience_years: Number(createForm.experience_years),
      });
      toast.success("Doctor account created");
      setCreateOpen(false);
      setCreateForm(initialCreate);
      await loadData();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const openEdit = (item: DoctorItem) => {
    setSelected(item);
    setEditForm({
      first_name: item.first_name ?? "",
      last_name: item.last_name ?? "",
      phone: item.phone ?? "",
      specialization: item.specialization ?? "",
      license_number: item.license_number ?? "",
      consultation_price:
        item.consultation_price !== undefined ? String(item.consultation_price) : "",
      experience_years: item.experience_years !== undefined ? String(item.experience_years) : "",
      location: item.location ?? "",
      lat: item.lat !== undefined ? String(item.lat) : "",
      lng: item.lng !== undefined ? String(item.lng) : "",
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!selected) return;
    try {
      await updateDoctor(selected.user_id, {
        first_name: editForm.first_name || undefined,
        last_name: editForm.last_name || undefined,
        phone: editForm.phone || undefined,
        specialization: editForm.specialization || undefined,
        license_number: editForm.license_number || undefined,
        consultation_price: editForm.consultation_price
          ? Number(editForm.consultation_price)
          : undefined,
        experience_years: editForm.experience_years ? Number(editForm.experience_years) : undefined,
        location: editForm.location || undefined,
        lat: editForm.lat ? Number(editForm.lat) : undefined,
        lng: editForm.lng ? Number(editForm.lng) : undefined,
      });
      toast.success("Doctor updated");
      setEditOpen(false);
      await loadData();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const confirmDisable = async () => {
    if (!deleteTarget) return;
    try {
      await disableDoctor(deleteTarget.user_id);
      toast.success("Doctor disabled");
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground mt-1">Manage doctor accounts and profiles</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Doctor
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="include-inactive-doctors"
              checked={includeInactive}
              onCheckedChange={(checked) => {
                setIncludeInactive(checked);
                setPage(1);
              }}
            />
            <Label htmlFor="include-inactive-doctors">Include inactive</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label>Rows</Label>
            <Input
              className="w-20"
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => {
                const value = Math.max(1, Math.min(100, Number(e.target.value) || 20));
                setLimit(value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading doctors...
        </div>
      ) : error ? (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No doctors found.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.user_id}>
                      <TableCell>{item.user_id}</TableCell>
                      <TableCell>{`${item.first_name ?? ""} ${item.last_name ?? ""}`.trim() || "-"}</TableCell>
                      <TableCell>{item.email || "-"}</TableCell>
                      <TableCell>{item.specialization || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active === false ? "outline" : "default"}>
                          {item.is_active === false ? "Inactive" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button size="icon" variant="outline" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} ({total} total)
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Doctor</DialogTitle>
            <DialogDescription>Create doctor account and doctor profile</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={createForm.first_name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                value={createForm.last_name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input
                value={createForm.phone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Specialization *</Label>
              <Input
                value={createForm.specialization}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, specialization: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>License Number *</Label>
              <Input
                value={createForm.license_number}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, license_number: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Consultation Price *</Label>
              <Input
                type="number"
                min={0}
                value={createForm.consultation_price}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, consultation_price: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Experience Years *</Label>
              <Input
                type="number"
                min={0}
                value={createForm.experience_years}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, experience_years: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitCreate()}>Create Doctor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>Update doctor account/profile fields</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={editForm.first_name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={editForm.last_name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Input
                value={editForm.specialization}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, specialization: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input
                value={editForm.license_number}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, license_number: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Consultation Price</Label>
              <Input
                type="number"
                min={0}
                value={editForm.consultation_price}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, consultation_price: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Experience Years</Label>
              <Input
                type="number"
                min={0}
                value={editForm.experience_years}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, experience_years: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                value={editForm.lat}
                onChange={(e) => setEditForm((prev) => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                value={editForm.lng}
                onChange={(e) => setEditForm((prev) => ({ ...prev, lng: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitEdit()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Doctor</AlertDialogTitle>
            <AlertDialogDescription>
              Disable doctor user #{deleteTarget?.user_id}. This is a soft-delete action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDisable()}>Disable</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
