import React, { useState } from "react";
import Balance from "./components/Balance";
import IncomeExpenses from "./components/IncomeExpenses";
import TransactionList from "./components/TransactionList";
import AddTransaction from "./components/AddTransaction";
import ExpenseChart from "./components/ExpenseChart";
import TransactionHistoryChart from "./components/TransactionHistoryChart"; // ✅ new chart
import { useTheme } from "./context/ThemeContext.jsx";
import "./index.css";

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="app-container">
      {/* Theme Toggle Button - Desktop */}
      <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
        {isDarkMode ? "☀️" : "🌙"}
      </button>

      {/* Mobile Top Navbar */}
      <nav className="mobile-navbar">
        <div className="mobile-navbar-content">
          <div className="mobile-navbar-logo">💰 Xpensr</div>
          <button className="mobile-theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">💰 Xpensr</h2>
        <nav>
          <ul>
            <li 
              className={activeSection === "dashboard" ? "active" : ""}
              onClick={() => setActiveSection("dashboard")}
            >
              Dashboard
            </li>
            <li 
              className={activeSection === "transactions" ? "active" : ""}
              onClick={() => setActiveSection("transactions")}
            >
              Transactions
            </li>
            <li 
              className={activeSection === "reports" ? "active" : ""}
              onClick={() => setActiveSection("reports")}
            >
              Reports
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Section */}
            {/* Main Section */}
      <main className="main-content">
        <header className="header">
          <h1>
            {activeSection === "dashboard" && "Dashboard"}
            {activeSection === "transactions" && "Transactions"}
            {activeSection === "reports" && "Reports"}
          </h1>
        </header>

        {/* Dashboard Section */}
        {activeSection === "dashboard" && (
          <>
            <section className="stats">
              <Balance />
              <IncomeExpenses />
            </section>

            <section className="add-transaction">
              <AddTransaction />
            </section>
          </>
        )}

        {/* Transactions Section */}
        {activeSection === "transactions" && (
          <>
            <section className="add-transaction">
              <AddTransaction />
            </section>
            
            <section className="transactions">
              <TransactionList />
            </section>
          </>
        )}

        {/* Reports Section */}
        {activeSection === "reports" && (
          <>
            <section className="stats">
              <Balance />
              <IncomeExpenses />
            </section>

            <section className="chart-section">
              <ExpenseChart />
              <TransactionHistoryChart />
            </section>
          </>
        )}
      </main>

      {/* Mobile Navigation Footer */}
      <nav className="mobile-nav">
        <div className="mobile-nav-container">
          <div 
            className={`mobile-nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <div className="mobile-nav-icon">🏠</div>
            <div className="mobile-nav-label">Dashboard</div>
          </div>
          <div 
            className={`mobile-nav-item ${activeSection === "transactions" ? "active" : ""}`}
            onClick={() => setActiveSection("transactions")}
          >
            <div className="mobile-nav-icon">💳</div>
            <div className="mobile-nav-label">Transactions</div>
          </div>
          <div 
            className={`mobile-nav-item ${activeSection === "reports" ? "active" : ""}`}
            onClick={() => setActiveSection("reports")}
          >
            <div className="mobile-nav-icon">📊</div>
            <div className="mobile-nav-label">Reports</div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
