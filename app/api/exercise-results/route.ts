import { NextResponse } from "next/server";
import { saveExerciseResults } from "@/app/actions/links";

export async function POST(request: Request) {
  try {
    const { exerciseItemId, results } = await request.json();
    if (!exerciseItemId || !results) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }
    await saveExerciseResults(exerciseItemId, results);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error guardando resultados" }, { status: 500 });
  }
} 