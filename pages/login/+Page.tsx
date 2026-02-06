import { useState } from "react";
import { onLogin } from "./login.telefunc";
import { navigate } from "vike/client/router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setAlertMessage(null);
    const data = await onLogin({ email, password });
    console.log("Login data", data);
    if (data.success) {
      setEmail("");
      setPassword("");
      setAlertMessage(null);
      navigate("/map");
    } else {
      setAlertMessage("Identifiants invalides");
      setErrors({ password: data.error || "Invalid credentials" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Pokemon-themed Card */}
        <div className="bg-linear-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-400">
          {/* Header with Pokemon Ball Design */}
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-8 text-center relative">
            <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full border-4 border-gray-800 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
              Welcome Back, Trainer!
            </h1>
            <p className="text-blue-100 text-sm">
              Sign in to your Pokemon Universe account
            </p>
          </div>

          {/* Form Content */}
          <div className="bg-white px-8 py-8">
            {alertMessage && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                <span className="font-medium">{alertMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-red-600">✉</span>
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-300 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                  placeholder="trainer@pokemon.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-red-600">🔒</span>
                    Password
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors({ ...errors, password: undefined });
                    }}
                    className={`w-full px-4 py-3 rounded-lg border-2 pr-12 ${errors.password
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-300 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span>
                    {errors.password}
                  </p>
                )}
                <p className="mt-2">
                  <a
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot password?
                  </a>
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-yellow-700"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">⚡</span>
                  Sign In
                </span>
              </button>
            </form>

            {/* Decorative Elements */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                New to the Pokemon Universe?{" "}
                <a
                  href="/subscribe"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Create an account
                </a>
              </p>
            </div>
          </div>

          {/* Footer Decoration */}
          <div className="bg-linear-to-r from-yellow-400 to-yellow-500 h-2"></div>
        </div>

        {/* Pokemon-themed decorative text */}
        <p className="text-center mt-6 text-gray-500 text-sm">
          <span className="inline-block animate-pulse">✨</span> Gotta catch 'em
          all! <span className="inline-block animate-pulse">✨</span>
        </p>
      </div>
    </div>
  );
}
