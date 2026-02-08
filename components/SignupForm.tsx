import { useSignup } from "../hook/useSignup";
import { navigate } from "vike/client/router";

interface SignupFormProps {
  onSignupFn: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
}

export default function SignupForm({ onSignupFn }: SignupFormProps) {
  const {
    email,
    password,
    errors,
    isLoading,
    showPassword,
    setEmail,
    setPassword,
    toggleShowPassword,
    handleSubmit,
  } = useSignup({
    onSuccess: () => {
      navigate("/pokedex/starter");
    },
    onError: (error) => {
      console.error("Signup error:", error);
    },
  });

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden border-4 border-red-400">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center relative">
            <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full border-4 border-gray-800 flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
              Join the Pokemon Universe
            </h1>
            <p className="text-blue-100 text-sm">
              Become a Pokemon Trainer Today!
            </p>
          </div>

          <div className="bg-white px-8 py-8">
            <form onSubmit={(e) => handleSubmit(e, onSignupFn)} className="space-y-6">
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
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email
                      ? "border-red-500 focus:border-red-600"
                      : "border-gray-300 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                  placeholder="trainer@pokemon.com"
                  disabled={isLoading}
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span>
                    {errors.email}
                  </p>
                )}
              </div>
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
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 pr-12 ${errors.password
                        ? "border-red-500 focus:border-red-600"
                        : "border-gray-300 focus:border-blue-500"
                      } focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error password-hint" : "password-hint"}
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span>⚠</span>
                    {errors.password}
                  </p>
                )}
                <p id="password-hint" className="mt-1 text-xs text-gray-500">
                  Must be at least 12 characters and including at least one uppercase letter, one number and one special character
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Creating your account...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">⚡</span>
                      Start Your Adventure
                    </>
                  )}
                </span>
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Already a trainer?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-semibold focus:outline-none focus:underline"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-400 to-red-500 h-2"></div>
        </div>
        <p className="text-center mt-6 text-gray-500 text-sm">
          <span className="inline-block animate-pulse">✨</span> Catch 'em all!{" "}
          <span className="inline-block animate-pulse">✨</span>
        </p>
      </div>
    </div>
  );
}