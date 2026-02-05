const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password: string) => {
    return password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password);
};

export default function validateData(data: { email: string; password: string; pseudo: string }): { email?: string; password?: string; pseudo?: string } {
    const errors: { email?: string; password?: string; pseudo?: string } = {};

    if (!data.email) {
        errors.email = "Email is required";
    } else if (!validateEmail(data.email)) {
        errors.email = "Please enter a valid email address";
    }

    if (!data.password) {
        errors.password = "Password is required";
    } else if (!validatePassword(data.password)) {
        errors.password = "Password must be at least 12 characters and including at least one uppercase letter, one number and one special character";
    }

    if (!data.pseudo) {
        errors.pseudo = "Pseudo is required";
    } else if (data.pseudo.length < 3) {
        errors.pseudo = "Pseudo must be at least 3 characters";
    }

    return errors;
}