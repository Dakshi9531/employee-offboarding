import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Employees from "./pages/Employees.jsx";
import CreateOffboarding from "./pages/CreateOffboarding.jsx";
import OffboardingDetails from "./pages/OffboardingDetails.jsx";

function App() {
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/employees", label: "Employees" },
    { path: "/offboarding/new", label: "New Offboarding" },
  ];

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">BlazeUp HROS - Offboarding</div>
        <div className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={location.pathname === link.path ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/offboarding/new" element={<CreateOffboarding />} />
          <Route path="/offboarding/:id" element={<OffboardingDetails />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
