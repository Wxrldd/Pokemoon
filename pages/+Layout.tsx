import "./Layout.css";
import "./tailwind.css";
import logoUrl from "../assets/logo.svg";
import { Link } from "../components/Link";
import { usePageContext } from "vike-react/usePageContext";
import type { Data } from "./+data";
import { navigate } from "vike/client/router";
import onLogout from "./layout.telefunc";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Content>{children}</Content>
      <Footer />
    </div>
  );
}

function Navbar() {
  const pageContext = usePageContext();
  const { user } = pageContext.data as Data;
  console.log("USER in Navbar", user);

  const handleLogout = async () => {
    const userIsUnlogged = await onLogout();
    if (userIsUnlogged.success) {
      console.log("User is unlogged : ", user);
      navigate("/");
    } else {
      alert(userIsUnlogged.error);
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-8">
          {user ? (
            <>
              <span className="text-sm text-gray-700">Hello, {user.email}</span>
              <Link href="/map">Map</Link>
              <Link href="/battle">Battle</Link>
              <Link href="/team">Gérer mon équipe</Link>
              <button
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Sign Up</Link>
            </>
          )}
          <Link href="/pokedex">Pokédex</Link>
          <Link href="/leaderboard">Classement général</Link>
        </div>
      </nav>
    </header>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <main id="page-container" className="flex-1">
      <div id="page-content">
        {children}
      </div>
    </main>
  );
}

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <img src={logoUrl} height={48} width={48} alt="logo" />
      <span className="text-xl font-bold">Pokemoon</span>
    </a>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">2026 Pokemoon By Thibaud, Killian & Maxime</p>
      </div>
    </footer>
  );
}