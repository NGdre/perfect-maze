import { PROJECT_NAME } from "@constants";

import { Link, Outlet } from "react-router";

import Logo from "./Logo.tsx";

function Header() {
  return (
    <div className="w-full border-b-2 border-primary-100 bg-bg-primary">
      <header className="px-between-header-main-sidebar py-3">
        <Link to="/">
          <Logo logoText={PROJECT_NAME} />
        </Link>
      </header>
    </div>
  );
}

function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
    </div>
  );
}

export default Layout;
