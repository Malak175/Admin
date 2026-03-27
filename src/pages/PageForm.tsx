import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createStaticPage,
  getStaticPageById,
  updateStaticPage,
} from "@/services/admin/staticPagesService";
import { toApiError } from "@/services/api/errors";
import type { StaticPagePayload } from "@/services/admin/types";

export type PageFormMode = "create" | "edit";

interface PageFormProps {
  mode: PageFormMode;
  pageId?: string;
}

const initialForm: StaticPagePayload = {
  slug: "",
  title_en: "",
  title_ar: "",
  content_en: "",
  content_ar: "",
  meta_title_en: "",
  meta_title_ar: "",
  meta_description_en: "",
  meta_description_ar: "",
  is_active: true,
};

export default function PageForm({ mode, pageId }: PageFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StaticPagePayload>(initialForm);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === "create" ? "Create Page" : "Edit Page"),
    [mode]
  );

  const loadPage = async () => {
    if (mode !== "edit" || !pageId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStaticPageById(pageId);
      setFormData({
        slug: data.slug ?? "",
        title_en: data.title_en ?? "",
        title_ar: data.title_ar ?? "",
        content_en: data.content_en ?? "",
        content_ar: data.content_ar ?? "",
        meta_title_en: data.meta_title_en ?? "",
        meta_title_ar: data.meta_title_ar ?? "",
        meta_description_en: data.meta_description_en ?? "",
        meta_description_ar: data.meta_description_ar ?? "",
        is_active: data.is_active ?? true,
      });
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, [mode, pageId]);

  const validate = () => {
    if (!formData.slug.trim()) return "Slug is required";
    if (!formData.title_en.trim()) return "English title is required";
    if (!formData.title_ar.trim()) return "Arabic title is required";
    if (!formData.content_en.trim()) return "English content is required";
    if (!formData.content_ar.trim()) return "Arabic content is required";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setIsSaving(true);
    try {
      if (mode === "create") {
        await createStaticPage(formData);
        toast.success("Page created");
      } else {
        if (!pageId) {
          toast.error("Missing page ID");
          return;
        }
        await updateStaticPage(pageId, formData);
        toast.success("Page updated");
      }
      navigate("/dashboard/pages");
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
            {mode === "create"
              ? "Add a new static page to the website"
              : "Update static page content and SEO settings"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/pages")}>
            Back to Pages
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSaving || isLoading}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Page"
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading page...
        </div>
      ) : error ? (
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadPage()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page-slug">Slug</Label>
                <Input
                  id="page-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="about-us"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-active">Active</Label>
                <div className="flex items-center gap-3">
                  <Switch
                    id="page-active"
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
                <Label htmlFor="title-en">Title (English)</Label>
                <Input
                  id="title-en"
                  value={formData.title_en}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title_en: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title-ar">Title (Arabic)</Label>
                <Input
                  id="title-ar"
                  dir="rtl"
                  value={formData.title_ar}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title_ar: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-en">Content (English)</Label>
                <Textarea
                  id="content-en"
                  rows={10}
                  value={formData.content_en}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content_en: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-ar">Content (Arabic)</Label>
                <Textarea
                  id="content-ar"
                  dir="rtl"
                  rows={10}
                  value={formData.content_ar}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content_ar: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title-en">Meta Title (English)</Label>
                <Input
                  id="meta-title-en"
                  value={formData.meta_title_en}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meta_title_en: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-title-ar">Meta Title (Arabic)</Label>
                <Input
                  id="meta-title-ar"
                  dir="rtl"
                  value={formData.meta_title_ar}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meta_title_ar: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-desc-en">Meta Description (English)</Label>
                <Textarea
                  id="meta-desc-en"
                  rows={4}
                  value={formData.meta_description_en}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meta_description_en: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-desc-ar">Meta Description (Arabic)</Label>
                <Textarea
                  id="meta-desc-ar"
                  dir="rtl"
                  rows={4}
                  value={formData.meta_description_ar}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meta_description_ar: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
