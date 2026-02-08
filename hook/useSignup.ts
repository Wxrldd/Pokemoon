import { useState } from "react";
import { signupSchema } from "../validation/auth.schema";
import { ValidationErrors } from "../type/auth";
import { ZodError } from "zod";

interface UseSignupProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseSignupReturn {
  email: string;
  password: string;
  errors: ValidationErrors;
  isLoading: boolean;
  showPassword: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  toggleShowPassword: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, onSignupFn: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>) => Promise<void>;
  clearErrors: () => void;
}

/**
 * Hook personnalisé pour gérer le formulaire d'inscription
 * Gère la validation côté client avec Zod, l'état du formulaire et les erreurs
 */
export function useSignup({ onSuccess, onError }: UseSignupProps = {}): UseSignupReturn {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Efface une erreur spécifique quand l'utilisateur modifie le champ
   */
  const clearFieldError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Gère le changement de l'email avec nettoyage de l'erreur
   */
  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearFieldError("email");
  };

  /**
   * Gère le changement du password avec nettoyage de l'erreur
   */
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearFieldError("password");
  };

  /**
   * Toggle l'affichage du mot de passe
   */
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  /**
   * Efface toutes les erreurs
   */
  const clearErrors = () => {
    setErrors({});
  };

  /**
   * Gère la soumission du formulaire avec validation Zod
   */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    onSignupFn: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  ) => {
    e.preventDefault();

    // Validation côté client avec Zod
    try {
      const validatedData = signupSchema.parse({ email, password });

      setErrors({});
      setIsLoading(true);

      // Appel à la fonction Telefunc
      const response = await onSignupFn(validatedData);

      if (response.success) {
        // Réinitialisation du formulaire
        setEmail("");
        setPassword("");
        setErrors({});

        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Gestion des erreurs serveur
        const errorMessage = response.error || "Une erreur est survenue lors de l'inscription";
        setErrors({ email: errorMessage });

        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Transformation des erreurs Zod en format utilisable
        const formattedErrors: ValidationErrors = {};

        error.issues.forEach((err) => {
          const field = err.path[0] as keyof ValidationErrors;
          if (field && !formattedErrors[field]) {
            formattedErrors[field] = err.message;
          }
        });

        setErrors(formattedErrors);
      } else {
        // Erreur inattendue
        setErrors({ email: "Une erreur inattendue est survenue" });

        if (onError) {
          onError("Une erreur inattendue est survenue");
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
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    toggleShowPassword,
    handleSubmit,
    clearErrors,
  };
}