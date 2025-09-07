import React, { useContext } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { GlobalContext } from "../context/GlobalState.jsx";

export default function ExpenseChart() {
  const { transactions } = useContext(GlobalContext);

  const amounts = transactions.map(t => t.amount);

  const income = amounts
    .filter(a => a > 0)
    .reduce((acc, item) => acc + item, 0);

  const expense = amounts
    .filter(a => a < 0)
    .reduce((acc, item) => acc + item, 0) * -1;

  const data = [
    { name: "Income", value: income },
    { name: "Expense", value: expense }
  ];

  const COLORS = ["#00C49F", "#FF4D4F"];

  return (
    <div className="chart-container">
      <h3>Income vs Expense</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
