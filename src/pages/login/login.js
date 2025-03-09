import React, { useEffect, useState } from "react";
import { loginGoogle, supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
// eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Função para fazer login com Google
  const handleLogin = async () => {
    const { data, error } = await loginGoogle();

    if (error) {
      console.error("Erro no login:", error);
      return;
    }

    if (data?.session) {
      await checkUserSession(); // Atualiza sessão e redireciona
    }
  };

  // Verifica se o usuário já está logado
  const checkUserSession = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Erro ao buscar usuário:", error);
      return;
    }

    if (data?.user) {
      setUser(data.user);
      navigate("/home"); // Redireciona para Home
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
        const { data, error } = await supabase.auth.getUser();
    
        if (error) {
          console.error("Erro ao buscar usuário:", error);
          return;
        }
    
        if (data?.user) {
          setUser(data.user);
          navigate("/home");
        }
      };
      checkUserSession(); 
  }, [navigate]);

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={handleLogin}>Entrar com Google</button>
    </div>
  );
}

export default Login;
