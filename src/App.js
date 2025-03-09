import React, { useEffect } from "react";
import AppRoutes from "./routes/appRoutes";
import { pedirPermissaoNotificacao } from "./services/firebase";

function App() {
  useEffect(() => {
    pedirPermissaoNotificacao();
  }, []);

  return <AppRoutes />;
}

export default App;
