import { useState } from "react";
import { loginSchema } from "../validation/auth.schema";
import { ValidationErrors } from "../type/auth";
import { ZodError } from "zod";

interface UseLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseLoginReturn {
  email: string;
  password: string;
  errors: ValidationErrors;
  isLoading: boolean;
  showPassword: boolean;
  alertMessage: string | null;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  toggleShowPassword: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, onLoginFn: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>) => Promise<void>;
  clearErrors: () => void;
  setAlertMessage: (message: string | null) => void;
}

export function useLogin({ onSuccess, onError }: UseLoginProps = {}): UseLoginReturn {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);


  const clearFieldError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearFieldError("email");
    setAlertMessage(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearFieldError("password");
    setAlertMessage(null);
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const clearErrors = () => {
    setErrors({});
    setAlertMessage(null);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onLoginFn: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  ) => {
    e.preventDefault();

    try {
      const validatedData = loginSchema.parse({ email, password });

      setErrors({});
      setAlertMessage(null);
      setIsLoading(true);

      const response = await onLoginFn(validatedData);

      if (response.success) {
        setEmail("");
        setPassword("");
        setErrors({});
        setAlertMessage(null);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorMessage = response.error || "Identifiants invalides";
        setAlertMessage("Identifiants invalides");
        setErrors({ password: errorMessage });

        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: ValidationErrors = {};

        error.issues.forEach((err) => {
          const field = err.path[0] as keyof ValidationErrors;
          if (field && !formattedErrors[field]) {
            formattedErrors[field] = err.message;
          }
        });

        setErrors(formattedErrors);
      } else {
        const errorMsg = "Une erreur inattendue est survenue";
        setAlertMessage(errorMsg);
        setErrors({ password: errorMsg });

        if (onError) {
          onError(errorMsg);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    errors,
    isLoading,
    showPassword,
    alertMessage,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    toggleShowPassword,
    handleSubmit,
    clearErrors,
    setAlertMessage,
  };
}