export const AUTH_ERROR_MESSAGES = {
  email: {
    required: "L'adresse email est requise",
    invalid: "L'adresse email n'est pas valide",
    format: "Veuillez entrer une adresse email valide",
  },
  password: {
    required: "Le mot de passe est requis",
    tooShort: "Le mot de passe doit contenir au moins 12 caractères",
    missingUppercase: "Le mot de passe doit contenir au moins une majuscule",
    missingLowercase: "Le mot de passe doit contenir au moins une minuscule",
    missingNumber: "Le mot de passe doit contenir au moins un chiffre",
    missingSpecial: "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)",
    invalid: "Le mot de passe ne respecte pas les critères de sécurité",
  },
  general: {
    invalidCredentials: "Identifiants incorrect",
    serverError: "Une erreur est survenue, veuillez réessayer",
    userExists: "Un compte existe déjà",
    userNotFound: "Aucun compte trouvé",
  },
} as const;