import {z} from "zod"



export const dsaContentSchema= z.object({
    problems: z.array(
        z.object({
            url:z.string().url(),
            difficulty: z.enum(["EASY","MEDIUM","HARD"])
        })
    ).min(1),
    note:z.string().optional(),
})



export const fullstackContentSchema=z.object({
    topic:z.string().min(1),
    description:z.string().min(1),
    brief:z.string().min(1),
    checklist:z.array(z.string()).optional()
})



export const devopsContentSchema = z.object({
  topic: z.string().min(1),
  description: z.string().min(1),
  brief: z.string().min(1),
  checklist: z.array(z.string()).optional(),
})

export const mlContentSchema = z.object({
  topic: z.string().min(1),
  description: z.string().min(1),
  brief: z.string().min(1),
  colabUrl: z.string().url().optional(), // ML assignments can link a Colab notebook
  checklist: z.array(z.string()).optional(),
})




export const contentSchemas={
    DSA:dsaContentSchema,
    FULLSTACK:fullstackContentSchema,
    DEVOPS:devopsContentSchema,
    ML:mlContentSchema
} as const



export const createAssignmentSchema=z.object({
    type:z.enum(["DSA","FULLSTACK","DEVOPS","ML"]),
    content:z.unknown(),
    batchIds:z.array(z.string()).min(1),
    dueDate:z.string().datetime()
})