import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md space-y-4 rounded-2xl border border-border/60 bg-card/90 p-8 text-center shadow-sm">
        <h1 className="font-display text-2xl font-semibold">Not found</h1>
        <p className="text-sm text-muted-foreground">
          The element you are looking for doesn&apos;t exist or was removed.
        </p>
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
