import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { GlobalProvider } from "./context/GlobalState.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { GroupProvider } from "./context/GroupContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider>
    <GlobalProvider>
      <GroupProvider>
        <App />
      </GroupProvider>
    </GlobalProvider>
  </ThemeProvider>
);
