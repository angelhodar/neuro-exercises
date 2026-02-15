import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-8 w-3/4" />
          <Skeleton className="mx-auto h-4 w-1/2" />
          <Skeleton className="mx-auto h-4 w-1/3" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div className="rounded-lg border p-6" key={`skeleton-${item}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
