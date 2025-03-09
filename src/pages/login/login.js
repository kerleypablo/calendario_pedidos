import React, { useEffect, useState } from "react";
import { loginGoogle, supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Função para fazer login
  const handleLogin = async () => {
    const { data, error } = await loginGoogle();
    if (error) {
      console.error("Erro no login:", error);
      return;
    }
    
    // Após login, recarregar o usuário e redirecionar
    await checkUserSession();
  };

  // Verifica se o usuário já está logado ao abrir a página
  const checkUserSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      navigate("/home"); // Redireciona para Home
    }
  };

  // Executa a verificação ao montar o componente
  useEffect(() => {
    checkUserSession();
  }, []);

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={handleLogin}>Entrar com Google</button>
    </div>
  );
}

export default Login;
