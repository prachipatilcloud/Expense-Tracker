import React, { useState, useContext } from "react";
import { GlobalContext } from "../context/GlobalState";

export default function AddTransaction() {
  const [text, setText] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(""); // ✅ new state
  const { addTransaction } = useContext(GlobalContext);

  const onSubmit = e => {
    e.preventDefault();
    const newTransaction = {
      id: Math.floor(Math.random() * 100000),
      text,
      amount: +amount,
      date: date || new Date().toLocaleDateString() // fallback to today
    };
    addTransaction(newTransaction);
    setText("");
    setAmount(0);
    setDate("");
  };

  return (
    <div className="form-container">
      <h3>Add Transaction</h3>
      <form onSubmit={onSubmit}>
        <div className="form-control">
          <label>Text</label>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter text..." />
        </div>
        <div className="form-control">
          <label>Amount (negative = expense, positive = income)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount..." />
        </div>
        <div className="form-control">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <button className="btn">Add Transaction</button>
      </form>
    </div>
  );
}
