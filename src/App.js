import React from "react";
import Balance from "./components/Balance";
import IncomeExpenses from "./components/IncomeExpenses";
import TransactionList from "./components/TransactionList";
import AddTransaction from "./components/AddTransaction";
import ExpenseChart from "./components/ExpenseChart";
import TransactionHistoryChart from "./components/TransactionHistoryChart"; // ✅ new chart
import "./index.css";

function App() {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>💰 Expense Tracker</h2>
        <nav>
          <ul>
            <li>Dashboard</li>
            <li>Transactions</li>
            <li>Reports</li>
          </ul>
        </nav>
      </aside>

      {/* Main Section */}
      <main className="main-content">
        <header className="header">
          <h1>Dashboard</h1>
        </header>

        <section className="stats">
          <Balance />
          <IncomeExpenses />
        </section>

        {/* ✅ Charts Section */}
        <section className="chart-section">
          <ExpenseChart />
          <TransactionHistoryChart /> {/* ✅ Added */}
        </section>

        <section className="transactions">
          <TransactionList />
        </section>

        <section className="add-transaction">
          <AddTransaction />
        </section>
      </main>
    </div>
  );
}

export default App;
