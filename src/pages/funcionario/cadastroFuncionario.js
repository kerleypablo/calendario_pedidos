import React, { useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Button, Form, Container } from "react-bootstrap";
import Header from "../../components/header/header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importação do CSS do Toastify

/* eslint-disable no-unused-vars */

function CadastroFuncionario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();

    const empresaId = localStorage.getItem("empresa_id"); // Pega o ID da empresa logada
    if (!empresaId) {
      toast.error("Erro: Nenhuma empresa associada!");
      return;
    }

    const { data, error } = await supabase
      .from("usuarios")
      .insert([{ nome, email, empresa_id: empresaId, role: "funcionario" }]);

    if (error) {
      console.error("Erro ao cadastrar funcionário:", error);
      toast.error("Erro ao cadastrar funcionário.");
    } else {
      toast.success("Funcionário cadastrado com sucesso!");
      navigate("/gerenciar-funcionarios"); 
      console.log("Usuário logado:", data);

    }
  };

  return (
    <>
  
    <Header />
    <Container>
      <h2>Cadastrar Funcionário</h2>
      <Form onSubmit={handleCadastro}>
        <Form.Group controlId="nome">
          <Form.Label>Nome</Form.Label>
          <Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </Form.Group>

        <Form.Group controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>

        <Button variant="success" type="submit">Cadastrar Funcionário</Button>
      </Form>
    </Container>
    </>
  );
}

export default CadastroFuncionario;
