const { z } = require("zod");

const loginSchema = z.object({
  userid: z.string().min(1, "userid required"),
  password: z.string().min(1, "password required")
});

const registerSchema = z.object({
  userid: z.string().min(1, "userid required"),
  password: z.string().min(4, "password min 4 chars"),
  role: z.string().min(1, "role required"),
  created_by: z.string().optional()
});

const savePFSchema = z.object({
  empName: z.string().min(1, "Employee name required"),
  department: z.string().min(1, "Department required"),
  pfNo: z.string().min(1, "PF number required"),
  created_by: z.string().optional(),
  category: z.string().optional(),
  data: z.array(z.object({
    month: z.string(),
    year: z.number(),
    basic: z.number(),
    da: z.number(),
    vpf: z.number(),
    employee_share: z.number(),
    employer_share: z.number(),
    month_order: z.number().optional(),
    eps: z.number().optional()
  }))
});

const applyDASchema = z.object({
  month: z.string().min(1, "Month required"),
  year: z.number({ required_error: "Year required" }),
  da_percent: z.number().min(0, "DA % min 0").max(100, "DA % max 100"),
  category: z.enum(["Worker", "Executive"], { message: "Invalid category" })
});

const updateCategorySchema = z.object({
  employeeId: z.number({ required_error: "employeeId required" }),
  category: z.enum(["Worker", "Executive"], { message: "Invalid category" })
});

module.exports = { loginSchema, registerSchema, savePFSchema, applyDASchema, updateCategorySchema };