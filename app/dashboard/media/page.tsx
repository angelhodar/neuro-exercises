import {
  DashboardHeader,
  DashboardHeaderActions,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "@/app/dashboard/dashboard-header";
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

      <MediaGrid />
    </div>
  );
}
