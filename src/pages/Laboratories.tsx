import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createLab, disableLab, listLabs, updateLab } from "@/services/admin/userService";
import { toApiError } from "@/services/api/errors";
import type { LabItem } from "@/services/admin/types";

const initialCreate = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  phone: "",
  lab_name: "",
  address: "",
  lab_phone: "",
  lat: "",
  lng: "",
};

const initialEdit = {
  first_name: "",
  last_name: "",
  phone: "",
  lab_name: "",
  address: "",
  lab_phone: "",
  lat: "",
  lng: "",
};

export default function Laboratories() {
  const [items, setItems] = useState<LabItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreate);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<LabItem | null>(null);
  const [editForm, setEditForm] = useState(initialEdit);
  const [deleteTarget, setDeleteTarget] = useState<LabItem | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listLabs({ page, limit, include_inactive: includeInactive });
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
      !createForm.lab_name ||
      !createForm.address
    ) {
      toast.error("Please complete all required fields");
      return;
    }
    try {
      await createLab({
        email: createForm.email,
        password: createForm.password,
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        phone: createForm.phone,
        lab_name: createForm.lab_name,
        address: createForm.address,
        lab_phone: createForm.lab_phone || undefined,
        lat: createForm.lat ? Number(createForm.lat) : undefined,
        lng: createForm.lng ? Number(createForm.lng) : undefined,
      });
      toast.success("Lab account created");
      setCreateOpen(false);
      setCreateForm(initialCreate);
      await loadData();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const openEdit = (item: LabItem) => {
    setSelected(item);
    setEditForm({
      first_name: item.first_name ?? "",
      last_name: item.last_name ?? "",
      phone: item.phone ?? "",
      lab_name: item.lab_name ?? "",
      address: item.address ?? "",
      lab_phone: item.lab_phone ?? "",
      lat: item.lat !== undefined ? String(item.lat) : "",
      lng: item.lng !== undefined ? String(item.lng) : "",
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!selected) return;
    try {
      await updateLab(selected.user_id, {
        first_name: editForm.first_name || undefined,
        last_name: editForm.last_name || undefined,
        phone: editForm.phone || undefined,
        lab_name: editForm.lab_name || undefined,
        address: editForm.address || undefined,
        lab_phone: editForm.lab_phone || undefined,
        lat: editForm.lat ? Number(editForm.lat) : undefined,
        lng: editForm.lng ? Number(editForm.lng) : undefined,
      });
      toast.success("Lab updated");
      setEditOpen(false);
      await loadData();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const confirmDisable = async () => {
    if (!deleteTarget) return;
    try {
      await disableLab(deleteTarget.user_id);
      toast.success("Lab disabled");
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
          <h1 className="text-2xl font-bold text-foreground">Laboratories</h1>
          <p className="text-muted-foreground mt-1">Manage lab accounts and profiles</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Lab
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="include-inactive-labs"
              checked={includeInactive}
              onCheckedChange={(checked) => {
                setIncludeInactive(checked);
                setPage(1);
              }}
            />
            <Label htmlFor="include-inactive-labs">Include inactive</Label>
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
          Loading labs...
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
            No laboratories found.
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
                    <TableHead>Lab Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.user_id}>
                      <TableCell>{item.user_id}</TableCell>
                      <TableCell>{item.lab_name || "-"}</TableCell>
                      <TableCell>{item.email || "-"}</TableCell>
                      <TableCell>{item.address || "-"}</TableCell>
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
            <DialogTitle>Create Laboratory</DialogTitle>
            <DialogDescription>Create lab account and lab profile</DialogDescription>
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
              <Label>Lab Phone</Label>
              <Input
                value={createForm.lab_phone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, lab_phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Lab Name *</Label>
              <Input
                value={createForm.lab_name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, lab_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input
                value={createForm.address}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                value={createForm.lat}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                value={createForm.lng}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, lng: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void submitCreate()}>Create Lab</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Laboratory</DialogTitle>
            <DialogDescription>Update lab account/profile fields</DialogDescription>
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
              <Label>Lab Phone</Label>
              <Input
                value={editForm.lab_phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, lab_phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Lab Name</Label>
              <Input
                value={editForm.lab_name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, lab_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editForm.address}
                onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
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
            <AlertDialogTitle>Disable Lab</AlertDialogTitle>
            <AlertDialogDescription>
              Disable lab user #{deleteTarget?.user_id}. This is a soft-delete action.
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
