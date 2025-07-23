"use client"

import { useQueryState, parseAsBoolean } from "nuqs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImagePlus, Plus, Upload } from "lucide-react";
import CreateMediaWithAI from "./create-media-with-ai";
import CreateMediaManual from "./create-media-manual";

export default function CreateMediaDropdownButton() {
  const [openAI, setOpenAI] = useQueryState(
    "create-media-ai",
    parseAsBoolean.withDefault(false),
  );
  const [openManual, setOpenManual] = useQueryState(
    "create-media-manual",
    parseAsBoolean.withDefault(false),
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="w-4 h-4" /> Añadir contenido
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenAI(true)}>
            <ImagePlus className="w-4 h-4" />
            Generar imagen con IA
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenManual(true)}>
            <Upload className="w-4 h-4" />
            Subir contenido manualmente
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateMediaWithAI open={openAI} setOpen={setOpenAI} />
      <CreateMediaManual open={openManual} setOpen={setOpenManual} />
    </>
  );
}
