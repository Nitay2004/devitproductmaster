import { z } from "zod"

export const schemaProduct = z.object({
  make: z.string().min(2, "Make must be at least 2 characters"),
  modelNumber: z.string().min(2, "Model Number must be at least 2 characters"),
  cpu: z.string().optional(),
  generation: z.string().optional(),
  productName: z.string().optional(),
  ram: z.string().optional(),
  ssd: z.string().optional(),
  hdd: z.string().optional(),
  salePrice: z.coerce.number().min(0, "Sale price must be 0 or greater"),
})

export const schemaSparePart = z.object({
  make: z.string().min(2, "Make must be at least 2 characters"),
  modelNumber: z.string().min(2, "Model Number must be at least 2 characters"),
  cpu: z.string().optional(),
  generation: z.string().optional(),
  productName: z.string().optional(),
  frontPanel: z.coerce.number().optional(),
  panel: z.coerce.number().optional(),
  screenNonTouch: z.coerce.number().optional(),
  screenTouch: z.coerce.number().optional(),
  hinge: z.coerce.number().optional(),
  touchPad: z.coerce.number().optional(),
  base: z.coerce.number().optional(),
  keyboard: z.coerce.number().optional(),
  battery: z.coerce.number().optional(),
})

export type ProductFormValues = z.infer<typeof schemaProduct>
export type SparePartFormValues = z.infer<typeof schemaSparePart>
