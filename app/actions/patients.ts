"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  type NewPatient,
  type NewPatientSession,
  type NewPatientTest,
  patientInsertSchema,
  patientSessionInsertSchema,
  patientSessions,
  patientSessionUpdateSchema,
  patients,
  patientTestInsertSchema,
  patientTests,
  patientTestUpdateSchema,
  patientUpdateSchema,
} from "@/lib/db/schema";
import { getCurrentUser } from "./users";

const patientInputSchema = patientInsertSchema.omit({
  createdAt: true,
  creatorId: true,
  id: true,
  updatedAt: true,
});
const patientEditSchema = patientUpdateSchema.omit({
  createdAt: true,
  creatorId: true,
  id: true,
  updatedAt: true,
});
const sessionInputSchema = patientSessionInsertSchema.omit({
  createdAt: true,
  creatorId: true,
  id: true,
  updatedAt: true,
});
const sessionEditSchema = patientSessionUpdateSchema.omit({
  createdAt: true,
  creatorId: true,
  id: true,
  patientId: true,
  updatedAt: true,
});
const testInputSchema = patientTestInsertSchema.omit({
  createdAt: true,
  creatorId: true,
  id: true,
  updatedAt: true,
});
const testEditSchema = patientTestUpdateSchema.omit({
  createdAt: true,
  creatorId: true,
  id: true,
  patientId: true,
  updatedAt: true,
});

async function requirePatientUser() {
  // Preserve the existing mutation error and getCurrentUser's session handling.
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

async function assertPatientAccess(patientId: number, userId: string) {
  const patient = await db.query.patients.findFirst({
    columns: { id: true },
    where: and(eq(patients.id, patientId), eq(patients.creatorId, userId)),
  });
  if (!patient) {
    throw new Error("Paciente no encontrado.");
  }
}

async function assertSessionAccess(
  sessionId: number | null | undefined,
  patientId: number,
  userId: string
) {
  if (sessionId === null || sessionId === undefined) {
    return;
  }
  const session = await db.query.patientSessions.findFirst({
    columns: { id: true },
    where: and(
      eq(patientSessions.id, sessionId),
      eq(patientSessions.patientId, patientId),
      eq(patientSessions.creatorId, userId)
    ),
  });
  if (!session) {
    throw new Error("Sesión no encontrada.");
  }
}

// --- Patients ---

export async function getPatients() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    return await db.query.patients.findMany({
      orderBy: desc(patients.createdAt),
      where: eq(patients.creatorId, user.id),
    });
  } catch (error) {
    console.error("Error getting patients:", error);
    return [];
  }
}

export async function getPatientById(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    return await db.query.patients.findFirst({
      where: and(eq(patients.id, id), eq(patients.creatorId, user.id)),
      with: {
        patientSessions: {
          orderBy: desc(patientSessions.date),
        },
        patientTests: {
          orderBy: desc(patientTests.date),
        },
      },
    });
  } catch (error) {
    console.error("Error getting patient by id:", error);
    return null;
  }
}

export async function createPatient(
  data: Omit<NewPatient, "id" | "creatorId" | "createdAt" | "updatedAt">
) {
  try {
    const user = await requirePatientUser();

    const [newPatient] = await db
      .insert(patients)
      .values({ ...patientInputSchema.parse(data), creatorId: user.id })
      .returning();

    revalidatePath("/dashboard/patients");
    return newPatient;
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
}

export async function updatePatient(
  id: number,
  data: Partial<
    Omit<NewPatient, "id" | "creatorId" | "createdAt" | "updatedAt">
  >
) {
  try {
    const user = await requirePatientUser();

    const [updated] = await db
      .update(patients)
      .set(patientEditSchema.parse(data))
      .where(and(eq(patients.id, id), eq(patients.creatorId, user.id)))
      .returning();

    if (!updated) {
      throw new Error("Paciente no encontrado.");
    }

    revalidatePath("/dashboard/patients");
    revalidatePath(`/dashboard/patients/${id}`);
    return updated;
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
}

export async function deletePatient(id: number) {
  try {
    const user = await requirePatientUser();

    const [deleted] = await db
      .delete(patients)
      .where(and(eq(patients.id, id), eq(patients.creatorId, user.id)))
      .returning({ id: patients.id });
    if (!deleted) {
      throw new Error("Paciente no encontrado.");
    }

    revalidatePath("/dashboard/patients");
  } catch (error) {
    console.error("Error deleting patient:", error);
    throw error;
  }
}

// --- Patient Sessions ---

export async function createPatientSession(
  data: Omit<NewPatientSession, "id" | "creatorId" | "createdAt" | "updatedAt">
) {
  try {
    const user = await requirePatientUser();

    const input = sessionInputSchema.parse(data);
    await assertPatientAccess(input.patientId, user.id);
    const [newSession] = await db
      .insert(patientSessions)
      .values({ ...input, creatorId: user.id })
      .returning();

    revalidatePath(`/dashboard/patients/${data.patientId}`);
    return newSession;
  } catch (error) {
    console.error("Error creating patient session:", error);
    throw error;
  }
}

export async function updatePatientSession(
  id: number,
  patientId: number,
  data: Partial<
    Omit<NewPatientSession, "id" | "creatorId" | "createdAt" | "updatedAt">
  >
) {
  try {
    const user = await requirePatientUser();

    await assertPatientAccess(patientId, user.id);
    const [updated] = await db
      .update(patientSessions)
      .set(sessionEditSchema.parse(data))
      .where(
        and(
          eq(patientSessions.id, id),
          eq(patientSessions.patientId, patientId),
          eq(patientSessions.creatorId, user.id)
        )
      )
      .returning();

    if (!updated) {
      throw new Error("Sesión no encontrada.");
    }

    revalidatePath(`/dashboard/patients/${patientId}`);
    return updated;
  } catch (error) {
    console.error("Error updating patient session:", error);
    throw error;
  }
}

export async function deletePatientSession(id: number, patientId: number) {
  try {
    const user = await requirePatientUser();

    await assertPatientAccess(patientId, user.id);
    const [deleted] = await db
      .delete(patientSessions)
      .where(
        and(
          eq(patientSessions.id, id),
          eq(patientSessions.patientId, patientId),
          eq(patientSessions.creatorId, user.id)
        )
      )
      .returning({ id: patientSessions.id });
    if (!deleted) {
      throw new Error("Sesión no encontrada.");
    }

    revalidatePath(`/dashboard/patients/${patientId}`);
  } catch (error) {
    console.error("Error deleting patient session:", error);
    throw error;
  }
}

// --- Patient Tests ---

export async function createPatientTest(
  data: Omit<NewPatientTest, "id" | "creatorId" | "createdAt" | "updatedAt">
) {
  try {
    const user = await requirePatientUser();

    const input = testInputSchema.parse(data);
    await assertPatientAccess(input.patientId, user.id);
    await assertSessionAccess(input.sessionId, input.patientId, user.id);
    const [newTest] = await db
      .insert(patientTests)
      .values({ ...input, creatorId: user.id })
      .returning();

    revalidatePath(`/dashboard/patients/${data.patientId}`);
    return newTest;
  } catch (error) {
    console.error("Error creating patient test:", error);
    throw error;
  }
}

export async function updatePatientTest(
  id: number,
  patientId: number,
  data: Partial<
    Omit<NewPatientTest, "id" | "creatorId" | "createdAt" | "updatedAt">
  >
) {
  try {
    const user = await requirePatientUser();

    const input = testEditSchema.parse(data);
    await assertPatientAccess(patientId, user.id);
    await assertSessionAccess(input.sessionId, patientId, user.id);
    const [updated] = await db
      .update(patientTests)
      .set(input)
      .where(
        and(
          eq(patientTests.id, id),
          eq(patientTests.patientId, patientId),
          eq(patientTests.creatorId, user.id)
        )
      )
      .returning();

    if (!updated) {
      throw new Error("Prueba no encontrada.");
    }

    revalidatePath(`/dashboard/patients/${patientId}`);
    return updated;
  } catch (error) {
    console.error("Error updating patient test:", error);
    throw error;
  }
}

export async function deletePatientTest(id: number, patientId: number) {
  try {
    const user = await requirePatientUser();

    await assertPatientAccess(patientId, user.id);
    const [deleted] = await db
      .delete(patientTests)
      .where(
        and(
          eq(patientTests.id, id),
          eq(patientTests.patientId, patientId),
          eq(patientTests.creatorId, user.id)
        )
      )
      .returning({ id: patientTests.id });
    if (!deleted) {
      throw new Error("Prueba no encontrada.");
    }

    revalidatePath(`/dashboard/patients/${patientId}`);
  } catch (error) {
    console.error("Error deleting patient test:", error);
    throw error;
  }
}
