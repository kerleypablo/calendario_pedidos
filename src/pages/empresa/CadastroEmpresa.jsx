import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Button, Container, Form, Alert } from "react-bootstrap";
import Header from "../../components/header/header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importação do CSS do Toastify
import "./CadastroEmpresa.css";

function CadastroEmpresa() {
  const [empresaNome, setEmpresaNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [endereco, setEndereco] = useState("");
  const [jaTemEmpresa, setJaTemEmpresa] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarEmpresa = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", userData.user.id)
        .single();

      if (usuario?.empresa_id) {
        setJaTemEmpresa(true);
      }
    };

    verificarEmpresa();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data, error } = await supabase
      .from("empresas")
      .insert([{ nome: empresaNome, cnpj, endereco }])
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao cadastrar empresa:", error);
      return;
    }

    await supabase
      .from("usuarios")
      .update({ empresa_id: data.id })
      .eq("id", userData.user.id);

    localStorage.setItem("empresa_id", data.id);
    navigate("/home");
     toast.success("Empresa cadastrada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
  };

  return (
    <Container fluid className="p-0">
      {/* 🔥 Header Sempre Visível */}
      <Header />

      <Container className="cadastro-empresa-container">
        <h2>Cadastro de Empresa</h2>

        {/* Caso já tenha empresa cadastrada, exibe aviso e botão de voltar */}
        {jaTemEmpresa ? (
          <Alert variant="warning" className="alert-empresa">
            <strong>⚠️ Atenção:</strong> Você já possui uma empresa cadastrada.
            <Button variant="primary" className="btn-voltar-home" onClick={() => navigate("/home")}>
              Voltar para Home
            </Button>
          </Alert>
        ) : (
          <Form onSubmit={handleSubmit} className="empresa-form">
            <Form.Group controlId="nomeEmpresa">
              <Form.Label>Nome da Empresa</Form.Label>
              <Form.Control
                type="text"
                value={empresaNome}
                onChange={(e) => setEmpresaNome(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="cnpj">
              <Form.Label>CNPJ (Opcional)</Form.Label>
              <Form.Control
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="endereco">
              <Form.Label>Endereço (Opcional)</Form.Label>
              <Form.Control
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            </Form.Group>

            <Button variant="success" type="submit" className="btn-cadastrar">
              Cadastrar Empresa
            </Button>
          </Form>
        )}
      </Container>
    </Container>
  );
}

export default CadastroEmpresa;
