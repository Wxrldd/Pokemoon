import SignupForm from "../../components/SignupForm";
import { onSignUp } from "./Signup.telefunc";

export default function SignupPage() {
  return <SignupForm onSignupFn={onSignUp} />;
}