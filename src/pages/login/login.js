import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { toast } from "react-toastify";
import Loading from "../../components/loading/loading"; // ✅ Mantendo o loading
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Estado de loading
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        navigate("/home");
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/home");
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async () => {
    setErrorMessage("");
    setLoading(true); // ✅ Inicia o loading

    if (!email) {
      toast.error("Digite um email válido!");
      setLoading(false);
      return;
    }

    // 🔹 Buscar usuário na tabela `usuarios`
    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("id, nome, senha, auth_google")
      .eq("email", email)
      .single();

    if (error || !usuario) {
      toast.error("Usuário não encontrado.");
      setLoading(false);
      return;
    }

    if (usuario.auth_google) {
      toast.info("Este usuário foi cadastrado pelo Google. Use o login com Google.");
      setLoading(false);
      return;
    }

    if (!usuario.senha) {
      navigate("/cadastro", { state: { email: usuario.email, nome: usuario.nome } }); // ✅ Redireciona para cadastro
      setLoading(false);
      return;
    }

    // 🔹 Login com email e senha
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (loginError) {
      toast.error("Senha incorreta. Tente novamente.");
      setLoading(false);
    } else {
      navigate("/home");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true); // ✅ Exibe o loading
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });

    if (error) {
      toast.error("Erro ao fazer login com Google.");
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading && <Loading />} {/* ✅ Exibe o loading enquanto `loading` for true */}
      <div className="logoemplogin">
        <img src="files/images/logoemp.webp" id="logoemp" />
      </div>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Digite seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Digite sua senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <hr />

      <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
        {loading ? "Entrando..." : "Entrar com Google"}
      </button>

      <p className="register-link" onClick={() => navigate("/cadastro")}>
        Criar uma conta
      </p>
    </div>
  );
}

export default Login;
