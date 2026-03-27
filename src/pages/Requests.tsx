import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAccessRequest,
  getAccessRequestById,
  listAccessRequests,
  patchAccessRequestStatus,
  updateAccessRequest,
} from "@/services/admin/requestService";
import { toApiError } from "@/services/api/errors";
import {
  REQUEST_STATUSES,
  type AccessRequest,
  type RequestStatus,
} from "@/services/admin/types";

const statusBadgeClass: Record<RequestStatus, string> = {
  New: "bg-warning/10 text-warning border-warning/20",
  Reviewed: "bg-primary/10 text-primary border-primary/20",
  Approved: "bg-success/10 text-success border-success/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const roleOptions = ["Doctor", "Lab", "Patient"];

export default function Requests() {
  const [items, setItems] = useState<AccessRequest[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<number | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    subject: "",
    message: "",
    status: "New" as RequestStatus,
    role: "",
  });

  const [deleteTarget, setDeleteTarget] = useState<AccessRequest | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listAccessRequests({
        page,
        limit,
        status: statusFilter === "all" ? undefined : (statusFilter as RequestStatus),
        role: roleFilter === "all" ? undefined : roleFilter,
      });
      setItems(response.items ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
  }, [page, limit, statusFilter, roleFilter]);

  const handleView = async (item: AccessRequest) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const data = await getAccessRequestById(item.contact_id);
      setSelectedRequest(data);
    } catch (err) {
      toast.error(toApiError(err).message);
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleQuickStatus = async (item: AccessRequest, status: RequestStatus) => {
    setIsMutating(item.contact_id);
    try {
      await patchAccessRequestStatus(item.contact_id, status);
      toast.success("Request status updated");
      await loadRequests();
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setIsMutating(null);
    }
  };

  const openEdit = (item: AccessRequest) => {
    setSelectedRequest(item);
    setEditForm({
      subject: item.subject ?? "",
      message: item.message ?? "",
      status: item.status,
      role: item.role ?? "",
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!selectedRequest) return;
    try {
      await updateAccessRequest(selectedRequest.contact_id, {
        subject: editForm.subject || undefined,
        message: editForm.message || undefined,
        status: editForm.status,
        role: editForm.role || undefined,
      });
      toast.success("Request updated");
      setEditOpen(false);
      await loadRequests();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAccessRequest(deleteTarget.contact_id);
      toast.success("Request deleted");
      setDeleteTarget(null);
      await loadRequests();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Access Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review website contact and access requests from doctor/lab applicants
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {REQUEST_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading requests...
        </div>
      ) : error ? (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadRequests()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No access requests found for current filters.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Quick Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.contact_id}>
                      <TableCell>{item.contact_id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name || "-"}</p>
                          <p className="text-xs text-muted-foreground">{item.email || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.role || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClass[item.status]}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onValueChange={(value) =>
                            void handleQuickStatus(item, value as RequestStatus)
                          }
                          disabled={isMutating === item.contact_id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REQUEST_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => void handleView(item)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => openEdit(item)}
                            title="Edit request"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete request"
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Full details for selected access request</DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading details...
            </div>
          ) : selectedRequest ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-medium">{selectedRequest.contact_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{selectedRequest.status}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedRequest.name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">{selectedRequest.role || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{selectedRequest.email || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Subject</p>
                <p className="font-medium">{selectedRequest.subject || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap">{selectedRequest.message || "-"}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>Update request/ticket editable fields</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="request-role">Role</Label>
              <Input
                id="request-role"
                value={editForm.role}
                onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="Doctor, Lab, Patient..."
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, status: value as RequestStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-subject">Subject</Label>
              <Input
                id="request-subject"
                value={editForm.subject}
                onChange={(e) => setEditForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="request-message">Message</Label>
              <Textarea
                id="request-message"
                value={editForm.message}
                onChange={(e) => setEditForm((prev) => ({ ...prev, message: e.target.value }))}
                rows={5}
                placeholder="Message body"
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
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete request #{deleteTarget?.contact_id}. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
