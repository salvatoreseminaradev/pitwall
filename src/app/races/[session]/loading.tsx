import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-4 w-28" />
      <div className="mt-6 flex items-center gap-4 border-b border-border pb-8">
        <Skeleton className="h-10 w-16 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <Skeleton className="mt-10 h-80 w-full" />
      <Skeleton className="mt-10 h-64 w-full" />
    </div>
  );
}
