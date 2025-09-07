import React, { useState } from "react";
import Balance from "./components/Balance";
import IncomeExpenses from "./components/IncomeExpenses";
import TransactionList from "./components/TransactionList";
import AddTransaction from "./components/AddTransaction";
import ExpenseChart from "./components/ExpenseChart";
import TransactionHistoryChart from "./components/TransactionHistoryChart"; // ✅ new chart
import "./index.css";

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>💰 Expense Tracker</h2>
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
    </div>
  );
}

export default App;
