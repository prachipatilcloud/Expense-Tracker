import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";

export default function TransactionList() {
  const { transactions, deleteTransaction } = useContext(GlobalContext);

  return (
    <>
      <h3>History</h3>
      <ul className="list">
        {transactions.map(t => (
          <li key={t.id} className={t.amount < 0 ? "minus" : "plus"}>
            {t.text} <span>{t.amount < 0 ? "-" : "+"}${Math.abs(t.amount)}</span>
            <button onClick={() => deleteTransaction(t.id)} className="delete-btn">x</button>
          </li>
        ))}
      </ul>
    </>
  );
}
