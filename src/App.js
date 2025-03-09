import React, { useEffect } from "react";
import AppRoutes from "./routes/appRoutes";
import { pedirPermissaoNotificacao } from "./services/firebase";
import { ToastContainer } from "react-toastify";

function App() {
  useEffect(() => {
    pedirPermissaoNotificacao();
  }, []);

  return <>
  <AppRoutes />
  <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

  </>;
}

export default App;
