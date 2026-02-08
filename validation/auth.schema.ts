import { z } from "zod";
import { AUTH_ERROR_MESSAGES } from "../utils/errorMessages";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

export const emailSchema = z
  .string({
    message: AUTH_ERROR_MESSAGES.email.required,
  })
  .trim()
  .min(1, AUTH_ERROR_MESSAGES.email.required)
  .email(AUTH_ERROR_MESSAGES.email.invalid)
  .regex(EMAIL_REGEX, AUTH_ERROR_MESSAGES.email.format);

export const passwordSchema = z
  .string({
    message: AUTH_ERROR_MESSAGES.password.required,
  })
  .min(12, AUTH_ERROR_MESSAGES.password.tooShort)
  .regex(/[A-Z]/, AUTH_ERROR_MESSAGES.password.missingUppercase)
  .regex(/[a-z]/, AUTH_ERROR_MESSAGES.password.missingLowercase)
  .regex(/\d/, AUTH_ERROR_MESSAGES.password.missingNumber)
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, AUTH_ERROR_MESSAGES.password.missingSpecial);

export const loginPasswordSchema = z
  .string({
    message: AUTH_ERROR_MESSAGES.password.required,
  })
  .min(1, AUTH_ERROR_MESSAGES.password.required);

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const signupServerSchema = z.object({
  email: emailSchema.transform((email) => email.toLowerCase()),
  password: passwordSchema,
});

export const loginServerSchema = z.object({
  email: emailSchema.transform((email) => email.toLowerCase()),
  password: loginPasswordSchema,
});