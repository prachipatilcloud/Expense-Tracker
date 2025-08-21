import React, { useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { GlobalContext } from "../context/GlobalState";

export default function TransactionHistoryChart() {
  const { transactions } = useContext(GlobalContext);

  // Group transactions by date
  const groupedData = transactions.reduce((acc, t) => {
    const date = t.date || "Unknown"; // Add a "date" when adding transactions
    if (!acc[date]) acc[date] = { date, income: 0, expense: 0 };
    if (t.amount > 0) {
      acc[date].income += t.amount;
    } else {
      acc[date].expense += Math.abs(t.amount);
    }
    return acc;
  }, {});

  const data = Object.values(groupedData);

  return (
    <div className="chart-container">
      <h3>Transaction History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="income" fill="#00C49F" />
          <Bar dataKey="expense" fill="#FF4D4F" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
