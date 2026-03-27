import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBanner, getBannerById, updateBanner } from "@/services/admin/bannersService";
import { toApiError } from "@/services/api/errors";
import type { BannerPayload } from "@/services/admin/types";

export type BannerFormMode = "create" | "edit";

interface BannerFormProps {
  mode: BannerFormMode;
  bannerId?: string;
}

const placementOptions = [
  { label: "Homepage", value: "homepage" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Doctors", value: "doctors" },
  { label: "Labs", value: "labs" },
  { label: "Patients", value: "patients" },
  { label: "Custom", value: "custom" },
];

const actionTypeOptions = [
  { label: "None", value: "none" },
  { label: "URL", value: "url" },
  { label: "Route", value: "route" },
  { label: "External", value: "external" },
  { label: "Custom", value: "custom" },
];

const initialForm: BannerPayload = {
  title_en: "",
  title_ar: "",
  description_en: "",
  description_ar: "",
  image_url: "",
  placement: "homepage",
  action_type: "none",
  action_value: "",
  is_active: true,
  start_at: "",
  end_at: "",
  display_order: 1,
};

export default function BannerForm({ mode, bannerId }: BannerFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BannerPayload>(initialForm);
  const [placementChoice, setPlacementChoice] = useState("homepage");
  const [placementCustom, setPlacementCustom] = useState("");
  const [actionTypeChoice, setActionTypeChoice] = useState("none");
  const [actionTypeCustom, setActionTypeCustom] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === "create" ? "Create Banner" : "Edit Banner"),
    [mode]
  );

  const syncChoicesFromPayload = (payload: BannerPayload) => {
    const placementMatch = placementOptions.find((opt) => opt.value === payload.placement);
    if (placementMatch) {
      setPlacementChoice(payload.placement);
      setPlacementCustom("");
    } else {
      setPlacementChoice("custom");
      setPlacementCustom(payload.placement);
    }

    const actionMatch = actionTypeOptions.find((opt) => opt.value === payload.action_type);
    if (actionMatch) {
      setActionTypeChoice(payload.action_type);
      setActionTypeCustom("");
    } else {
      setActionTypeChoice("custom");
      setActionTypeCustom(payload.action_type);
    }
  };

  const loadBanner = async () => {
    if (mode !== "edit" || !bannerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBannerById(bannerId);
      const payload: BannerPayload = {
        title_en: data.title_en ?? "",
        title_ar: data.title_ar ?? "",
        description_en: data.description_en ?? "",
        description_ar: data.description_ar ?? "",
        image_url: data.image_url ?? "",
        placement: data.placement ?? "homepage",
        action_type: data.action_type ?? "none",
        action_value: data.action_value ?? "",
        is_active: data.is_active ?? true,
        start_at: data.start_at ?? "",
        end_at: data.end_at ?? "",
        display_order: data.display_order ?? 1,
      };
      setFormData(payload);
      syncChoicesFromPayload(payload);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBanner();
  }, [mode, bannerId]);

  const validate = (payload: BannerPayload) => {
    if (!payload.title_en.trim()) return "English title is required";
    if (!payload.title_ar.trim()) return "Arabic title is required";
    if (!payload.image_url.trim()) return "Image URL is required";
    if (!payload.placement.trim()) return "Placement is required";
    if (!payload.action_type.trim()) return "Action type is required";
    if (payload.action_type !== "none" && !payload.action_value.trim()) {
      return "Action value is required for the selected action type";
    }
    return null;
  };

  const buildPayload = (): BannerPayload => {
    const placement = placementChoice === "custom" ? placementCustom.trim() : placementChoice;
    const action_type = actionTypeChoice === "custom" ? actionTypeCustom.trim() : actionTypeChoice;

    return {
      ...formData,
      placement,
      action_type,
      action_value: action_type === "none" ? "" : formData.action_value,
      start_at: formData.start_at || undefined,
      end_at: formData.end_at || undefined,
      display_order: Number(formData.display_order) || 0,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    const validationError = validate(payload);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setIsSaving(true);
    try {
      if (mode === "create") {
        await createBanner(payload);
        toast.success("Banner created");
      } else {
        if (!bannerId) {
          toast.error("Missing banner ID");
          return;
        }
        await updateBanner(bannerId, payload);
        toast.success("Banner updated");
      }
      navigate("/dashboard/banners");
    } catch (err) {
      toast.error(toApiError(err).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">
            {mode === "create" ? "Create a new promotional banner" : "Update banner content and scheduling"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/banners")}>
            Back to Banners
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Banner"
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading banner...
        </div>
      ) : error ? (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadBanner()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Banner Content</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-title-en">Title (English)</Label>
                <Input
                  id="banner-title-en"
                  value={formData.title_en}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title_en: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-title-ar">Title (Arabic)</Label>
                <Input
                  id="banner-title-ar"
                  dir="rtl"
                  value={formData.title_ar}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title_ar: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-desc-en">Description (English)</Label>
                <Textarea
                  id="banner-desc-en"
                  rows={4}
                  value={formData.description_en}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description_en: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-desc-ar">Description (Arabic)</Label>
                <Textarea
                  id="banner-desc-ar"
                  dir="rtl"
                  rows={4}
                  value={formData.description_ar}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description_ar: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="banner-image">Image URL</Label>
                <Input
                  id="banner-image"
                  value={formData.image_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Placement & Action</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placement</Label>
                <Select
                  value={placementChoice}
                  onValueChange={(value) => {
                    setPlacementChoice(value);
                    if (value !== "custom") {
                      setPlacementCustom("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    {placementOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {placementChoice === "custom" && (
                  <Input
                    value={placementCustom}
                    onChange={(e) => setPlacementCustom(e.target.value)}
                    placeholder="Enter placement key"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select
                  value={actionTypeChoice}
                  onValueChange={(value) => {
                    setActionTypeChoice(value);
                    if (value !== "custom") {
                      setActionTypeCustom("");
                    }
                    if (value === "none") {
                      setFormData((prev) => ({ ...prev, action_value: "" }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {actionTypeChoice === "custom" && (
                  <Input
                    value={actionTypeCustom}
                    onChange={(e) => setActionTypeCustom(e.target.value)}
                    placeholder="Enter action type"
                  />
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="banner-action-value">Action Value</Label>
                <Input
                  id="banner-action-value"
                  value={formData.action_value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, action_value: e.target.value }))
                  }
                  placeholder={actionTypeChoice === "route" ? "/doctors" : "https://example.com"}
                  disabled={actionTypeChoice === "none"}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visibility & Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="banner-active">Active</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="banner-active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_active: checked }))
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.is_active ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-order">Display Order</Label>
                <Input
                  id="banner-order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, display_order: Number(e.target.value) }))
                  }
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-start">Start At</Label>
                <Input
                  id="banner-start"
                  type="datetime-local"
                  value={formData.start_at || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, start_at: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner-end">End At</Label>
                <Input
                  id="banner-end"
                  type="datetime-local"
                  value={formData.end_at || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_at: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
