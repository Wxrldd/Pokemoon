import LoginForm from "../../components/LoginForm";
import { onLogin } from "./login.telefunc";

export default function LoginPage() {
  return <LoginForm onLoginFn={onLogin} />;
}