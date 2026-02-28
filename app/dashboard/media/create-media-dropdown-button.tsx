"use client";

import { Globe, ImagePlus, Plus, Upload } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateMediaManual from "./create-media-manual";
import CreateMediaWithAI from "./create-media-with-ai";
import SearchImagesDialog from "./search-images-button";

export default function CreateMediaDropdownButton() {
  const [openAI, setOpenAI] = useQueryState(
    "create-media-ai",
    parseAsBoolean.withDefault(false)
  );
  const [openManual, setOpenManual] = useQueryState(
    "create-media-manual",
    parseAsBoolean.withDefault(false)
  );
  const [openSearch, setOpenSearch] = useQueryState(
    "search-dialog",
    parseAsBoolean.withDefault(false)
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>
          <Plus className="h-4 w-4" /> Añadir contenido
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setOpenAI(true)}>
            <ImagePlus className="h-4 w-4" />
            Generar imagen con IA
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenSearch(true)}>
            <Globe className="h-4 w-4" />
            Buscar en internet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenManual(true)}>
            <Upload className="h-4 w-4" />
            Subir manualmente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateMediaWithAI open={openAI} setOpen={setOpenAI} />
      <CreateMediaManual open={openManual} setOpen={setOpenManual} />
      <SearchImagesDialog open={openSearch} setOpen={setOpenSearch} />
    </>
  );
}
