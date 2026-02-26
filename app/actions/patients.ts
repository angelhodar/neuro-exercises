"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  type NewPatient,
  type NewPatientSession,
  type NewPatientTest,
  patientSessions,
  patients,
  patientTests,
} from "@/lib/db/schema";
import { getCurrentUser } from "./users";

// --- Patients ---

export async function getPatients() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    return await db.query.patients.findMany({
      where: eq(patients.creatorId, user.id),
      orderBy: desc(patients.createdAt),
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
      where: eq(patients.id, id),
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
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const [newPatient] = await db
      .insert(patients)
      .values({ ...data, creatorId: user.id })
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
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const [updated] = await db
      .update(patients)
      .set(data)
      .where(eq(patients.id, id))
      .returning();

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
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    await db.delete(patients).where(eq(patients.id, id));

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
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const [newSession] = await db
      .insert(patientSessions)
      .values({ ...data, creatorId: user.id })
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
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const [updated] = await db
      .update(patientSessions)
      .set(data)
      .where(eq(patientSessions.id, id))
      .returning();

    revalidatePath(`/dashboard/patients/${patientId}`);
    return updated;
  } catch (error) {
    console.error("Error updating patient session:", error);
    throw error;
  }
}

export async function deletePatientSession(id: number, patientId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    await db.delete(patientSessions).where(eq(patientSessions.id, id));

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
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const [newTest] = await db
      .insert(patientTests)
      .values({ ...data, creatorId: user.id })
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
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const [updated] = await db
      .update(patientTests)
      .set(data)
      .where(eq(patientTests.id, id))
      .returning();

    revalidatePath(`/dashboard/patients/${patientId}`);
    return updated;
  } catch (error) {
    console.error("Error updating patient test:", error);
    throw error;
  }
}

export async function deletePatientTest(id: number, patientId: number) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    await db.delete(patientTests).where(eq(patientTests.id, id));

    revalidatePath(`/dashboard/patients/${patientId}`);
  } catch (error) {
    console.error("Error deleting patient test:", error);
    throw error;
  }
}
