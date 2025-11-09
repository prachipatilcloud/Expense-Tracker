import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState.jsx";

export default function Balance() {
  const { transactions } = useContext(GlobalContext);

  const amounts = transactions.map(t => t.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);

  return (
    <div className="balance-container">
      <div className="balance-card">
        <h2>Your Balance</h2>
        <h1 className="balance-amount">
          <span className="currency">₹</span>{total}
        </h1>
      </div>
    </div>
  );
}
