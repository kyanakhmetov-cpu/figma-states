import { z } from "zod";
import { ElementStateType } from "@prisma/client";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required."),
  description: z.string().optional().nullable(),
});

export const stateCreateSchema = z.object({
  type: z.nativeEnum(ElementStateType),
  title: z.string().min(1, "Title is required."),
  message: z.string().min(1, "Message is required."),
  condition: z.string().optional().nullable(),
  severity: z.string().optional().nullable(),
  locale: z.string().default("en"),
  sortOrder: z.number().int().optional(),
});

export const stateUpdateSchema = z.object({
  type: z.nativeEnum(ElementStateType).optional(),
  title: z.string().optional(),
  message: z.string().optional(),
  condition: z.string().optional().nullable(),
  severity: z.string().optional().nullable(),
  locale: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const elementUpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  figmaUrl: z.string().trim().min(1).optional(),
  projectId: z.string().optional().nullable(),
});
