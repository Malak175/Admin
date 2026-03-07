import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { disablePatient, listPatients, updatePatient } from "@/services/admin/userService";
import { toApiError } from "@/services/api/errors";
import type { PatientItem } from "@/services/admin/types";

export default function Patients() {
  const [items, setItems] = useState<PatientItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<PatientItem | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    age: "",
    gender: "",
    chronic_diseases: "",
    lat: "",
    lng: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<PatientItem | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listPatients({ page, limit, include_inactive: includeInactive });
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

  const openEdit = (item: PatientItem) => {
    setSelected(item);
    setFormData({
      first_name: item.first_name ?? "",
      last_name: item.last_name ?? "",
      phone: item.phone ?? "",
      age: item.age ? String(item.age) : "",
      gender: item.gender ?? "",
      chronic_diseases: item.chronic_diseases ?? "",
      lat: item.lat !== undefined ? String(item.lat) : "",
      lng: item.lng !== undefined ? String(item.lng) : "",
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!selected) return;
    try {
      await updatePatient(selected.user_id, {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        phone: formData.phone || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender || undefined,
        chronic_diseases: formData.chronic_diseases || undefined,
        lat: formData.lat ? Number(formData.lat) : undefined,
        lng: formData.lng ? Number(formData.lng) : undefined,
      });
      toast.success("Patient updated");
      setEditOpen(false);
      await loadData();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const confirmDisable = async () => {
    if (!deleteTarget) return;
    try {
      await disablePatient(deleteTarget.user_id);
      toast.success("Patient disabled");
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patients</h1>
        <p className="text-muted-foreground mt-1">Manage patient users and profiles</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="include-inactive-patients"
              checked={includeInactive}
              onCheckedChange={(checked) => {
                setIncludeInactive(checked);
                setPage(1);
              }}
            />
            <Label htmlFor="include-inactive-patients">Include inactive</Label>
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
          Loading patients...
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
            No patients found.
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
                    <TableHead>Phone</TableHead>
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
                      <TableCell>{item.phone || "-"}</TableCell>
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update patient profile fields</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                min={0}
                value={formData.age}
                onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input
                value={formData.gender}
                onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Chronic Diseases</Label>
              <Input
                value={formData.chronic_diseases}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, chronic_diseases: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                value={formData.lat}
                onChange={(e) => setFormData((prev) => ({ ...prev, lat: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                value={formData.lng}
                onChange={(e) => setFormData((prev) => ({ ...prev, lng: e.target.value }))}
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
            <AlertDialogTitle>Disable Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Disable patient user #{deleteTarget?.user_id}. This is a soft-delete action.
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
