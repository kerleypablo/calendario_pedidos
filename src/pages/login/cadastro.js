import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { toast } from "react-toastify";
import "./login.css";

/* eslint-disable no-unused-vars */


function Cadastro() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🚀 Recebe `nome` e `email` caso venham da tela de login
  const [nome, setNome] = useState(location.state?.nome || "");
  const [email, setEmail] = useState(location.state?.email || "");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (email) {
      toast.info("Complete o cadastro criando uma senha.");
    }
  }, [email]);

  // Criar conta no Supabase (Auth + Banco)
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      // 🔹 Criar o usuário no Auth do Supabase
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome },
          emailRedirectTo: `${window.location.origin}/login`, // ✅ Redireciona após confirmação do e-mail
        },
      });

      if (authError) throw authError;

      // 🔹 Atualizar a tabela `usuarios`, adicionando a senha e confirmando que não é Google
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ senha: senha, auth_google: false })
        .eq("email", email);

      if (updateError) throw updateError;

      toast.success("Conta criada com sucesso! Confirme seu e-mail antes de fazer login.");
      setSuccessMessage("Um e-mail de confirmação foi enviado. Verifique sua caixa de entrada antes de fazer login.");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao criar conta: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <h1>Cadastro</h1>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={!!location.state?.email} // Desativa se veio da tela de login
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Criar Conta</button>
      </form>

      <p>
        Já tem uma conta?{" "}
        <span className="link" onClick={() => navigate("/")}>
          Faça login
        </span>
      </p>
    </div>
  );
}

export default Cadastro;
