import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState.jsx";

export default function TransactionList() {
  const { transactions, deleteTransaction } = useContext(GlobalContext);

  return (
    <>
      <h3>History</h3>
      <ul className="list">
        {transactions.map(t => (
          <li key={t.id} className={t.amount < 0 ? "minus" : "plus"}>
            <div className="transaction-details">
              <span className="transaction-text">{t.text}</span>
              {t.date && <span className="transaction-date">{t.date}</span>}
            </div>
            <div className="transaction-amount-section">
              <span className={`transaction-amount ${t.amount < 0 ? "negative" : "positive"}`}>
                {t.amount < 0 ? "-" : "+"}₹{Math.abs(t.amount).toFixed(2)}
              </span>
              <button onClick={() => deleteTransaction(t.id)} className="delete-btn">×</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
