import { z } from "zod";
import {
  signupSchema,
  loginSchema,
  signupServerSchema,
  loginServerSchema,
} from "../validation/auth.schema";

export type SignupFormData = z.infer<typeof signupSchema>;

export type LoginFormData = z.infer<typeof loginSchema>;

export type SignupServerData = z.infer<typeof signupServerSchema>;

export type LoginServerData = z.infer<typeof loginServerSchema>;

export type AuthResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
};

export type ValidationErrors = {
  email?: string;
  password?: string;
};