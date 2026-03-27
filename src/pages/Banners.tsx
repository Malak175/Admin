import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { deleteBanner, listBanners } from "@/services/admin/bannersService";
import { toApiError } from "@/services/api/errors";
import type { Banner } from "@/services/admin/types";

const getBannerId = (item: Banner) => item.id ?? item.banner_id;

export default function Banners() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Banner[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const loadBanners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await listBanners({ page, limit });
      setItems(response.items ?? []);
      setTotal(response.total ?? 0);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, [page, limit]);

  const handleEdit = (item: Banner) => {
    const id = getBannerId(item);
    if (!id) {
      toast.error("Missing banner ID from API response");
      return;
    }
    navigate(`/dashboard/banners/${id}`);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = getBannerId(deleteTarget);
    if (!id) {
      toast.error("Missing banner ID from API response");
      return;
    }
    try {
      await deleteBanner(id);
      toast.success("Banner deleted");
      setDeleteTarget(null);
      await loadBanners();
    } catch (err) {
      toast.error(toApiError(err).message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners</h1>
          <p className="text-muted-foreground mt-1">Manage hero and promotional banners</p>
        </div>
        <Button onClick={() => navigate("/dashboard/banners/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Banner
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
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
          Loading banners...
        </div>
      ) : error ? (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadBanners()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No banners found yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={getBannerId(item) ?? item.title_en}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title_en || item.title_ar || "-"}</p>
                          <p className="text-xs text-muted-foreground" dir="rtl">
                            {item.title_ar || ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{item.placement}</TableCell>
                      <TableCell>{item.action_type}</TableCell>
                      <TableCell>
                        <Badge variant={item.is_active === false ? "outline" : "default"}>
                          {item.is_active === false ? "Inactive" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleEdit(item)}>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the banner "{deleteTarget?.title_en || deleteTarget?.title_ar}".
              This action cannot be undone.
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
