import { Suspense } from "react";
import {
  DashboardHeader,
  DashboardHeaderActions,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
import { Spinner } from "@/components/ui/spinner";
import CreateMediaDropdownButton from "./create-media-dropdown-button";
import MediaSearch from "./media-filters";
import { MediaGrid } from "./media-grid";

export default function MediasPage() {
  return (
    <div className="p-6">
      <DashboardHeader>
        <div>
          <DashboardHeaderTitle>Biblioteca multimedia</DashboardHeaderTitle>
          <DashboardHeaderDescription>
            Gestiona archivos multimedia para los ejercicios
          </DashboardHeaderDescription>
        </div>
        <DashboardHeaderActions>
          <MediaSearch />
          <CreateMediaDropdownButton />
        </DashboardHeaderActions>
      </DashboardHeader>

      <Suspense
        fallback={
          <div className="mt-16 flex justify-center">
            <Spinner className="size-8 text-muted-foreground" />
          </div>
        }
      >
        <MediaGrid />
      </Suspense>
    </div>
  );
}
