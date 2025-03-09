import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { toast } from "react-toastify";
import Loading from "../../components/loading/loading";
import "./login.css";

function CriarSenha() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    toast.error("Erro ao recuperar e-mail.");
    navigate("/");
    return null;
  }

  const handleCriarSenha = async (e) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      // 🔥 Buscar o nome do usuário na tabela `usuarios`
      const { data: usuario, error: fetchError } = await supabase
        .from("usuarios")
        .select("nome")
        .eq("email", email)
        .single();

      if (fetchError || !usuario) {
        throw new Error("Usuário não encontrado.");
      }

      // 🔥 Criar o usuário no Auth do Supabase (igual ao Cadastro.js)
      const { error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { nome: usuario.nome },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (authError) {
        throw authError;
      }

      // 🔥 Atualizar a tabela `usuarios` para indicar que agora tem senha
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ senha: senha, auth_google: false })
        .eq("email", email);

      if (updateError) {
        throw updateError;
      }

      toast.success("Senha cadastrada com sucesso! Confirme seu e-mail antes de fazer login.");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao cadastrar senha: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading && <Loading />}

      <h1>Criar Senha</h1>

      <form onSubmit={handleCriarSenha}>
        <input
          type="password"
          placeholder="Nova Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirme a Senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Salvar Senha"}
        </button>
      </form>
    </div>
  );
}

export default CriarSenha;
