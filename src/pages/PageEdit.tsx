import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageForm from "@/pages/PageForm";

export default function PageEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Card className="border-destructive/40">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">Missing page ID in route.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/pages")}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PageForm mode="edit" pageId={id} />;
}
