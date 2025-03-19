import React, { useEffect } from "react";
import AppRoutes from "./routes/appRoutes";
import { pedirPermissaoNotificacao } from "./services/firebase";
import { ToastContainer } from "react-toastify";
import { EmpresaProvider } from "./context/EmpresaContext";
import { AuthProvider } from "./context/AuthContext";


function App() {
  useEffect(() => {
    pedirPermissaoNotificacao();
  }, []);

  return <>
  <AuthProvider>
    <EmpresaProvider>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </EmpresaProvider>
  </AuthProvider>
  </>;
}

export default App;
