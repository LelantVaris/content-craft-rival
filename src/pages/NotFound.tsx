
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <Card className="card-elevated max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <div className="text-6xl font-bold text-primary mb-4">404</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
            <p className="text-muted-foreground">
              Sorry, we couldn't find the page you're looking for.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Link to="/">
              <Button className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
