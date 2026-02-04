import "./Layout.css";
import "./tailwind.css";
import logoUrl from "../assets/logo.svg";
import { Link } from "../components/Link";
import { usePageContext } from "vike-react/usePageContext";
import type { Data } from "./+data";

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

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-8">
          {user ? (
            <>
              <span className="text-sm text-gray-700">Hello, {user.pseudo}</span>
              {/* logout route */}
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/subscribe">Subscribe</Link>
            </>
          )}
          <Link href="/pokedex">Pokédex</Link>
          <Link href="/random">Random Encounter</Link>
        </div>
      </div>
    </nav>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <div id="page-container" className="flex-1">
      <div id="page-content">
        {children}
      </div>
    </div>
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
        <p className="text-sm text-gray-600">© 2025 Pokemoon</p>
        <div className="flex gap-6">
          <Link href="/contact">Contact</Link>
          <Link href="/mention-legales">Mentions légales</Link>
        </div>
      </div>
    </footer>
  );
}