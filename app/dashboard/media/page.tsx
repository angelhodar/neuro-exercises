import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import MediaPageContent from "./media-page-content";

export default function MediasPage() {
  return (
    <Suspense
      fallback={
        <div className="mt-16 flex justify-center">
          <Spinner className="size-8 text-muted-foreground" />
        </div>
      }
    >
      <MediaPageContent />
    </Suspense>
  );
}
