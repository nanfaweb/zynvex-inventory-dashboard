import { z } from "zod";

const number = (label: string) =>
  z.number({ error: `${label} is required` }).refine(Number.isFinite, `${label} must be a number`);

export const productFormSchema = z
  .object({
    title: z.string().trim().min(3, "Give the product a name (3+ characters)").max(80, "Keep it under 80 characters"),
    brand: z.string().trim().max(40, "Keep it under 40 characters"),
    category: z.string().trim().min(1, "Choose a category"),
    price: number("Price").min(0.01, "Price must be above zero").max(100_000, "That price looks off"),
    discountPercent: number("Discount").min(0, "Can't be negative").max(90, "Max discount is 90%"),
    stock: number("Stock").int("Whole units only").min(0, "Can't be negative"),
    minimumOrder: number("Minimum order").int("Whole units only").min(1, "At least 1"),
    tags: z
      .array(z.string().trim().toLowerCase().min(2).max(24))
      .max(8, "Up to 8 tags")
      .refine((tags) => new Set(tags).size === tags.length, "Tags must be unique"),
    description: z.string().trim().max(500, "Keep it under 500 characters"),
    thumbnail: z.union([z.literal(""), z.url("Must be a full URL (https://…)")]),
  })
  .refine((value) => value.minimumOrder <= Math.max(value.stock, 1), {
    path: ["minimumOrder"],
    message: "Minimum order can't exceed stock",
  });

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;

export const emptyProductForm: ProductFormInput = {
  title: "",
  brand: "",
  category: "",
  price: Number.NaN,
  discountPercent: 0,
  stock: 0,
  minimumOrder: 1,
  tags: [],
  description: "",
  thumbnail: "",
};
