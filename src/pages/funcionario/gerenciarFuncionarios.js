import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Button, Container, Table } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import Header from "../../components/header/header";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import "./gerenciarFuncionario.css";


function GerenciarFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  const buscarFuncionarios = async () => {
    const empresaId = localStorage.getItem("empresa_id");
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("empresa_id", empresaId)
      .neq("role", "admin"); // Não mostrar admins

    if (error) {
      console.error("Erro ao buscar funcionários:", error);
      toast.error("Erro ao carregar funcionários.");
    } else {
      setFuncionarios(data);
    }
  };

  const excluirFuncionario = async (id) => {
    const { error } = await supabase.from("usuarios").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir funcionário:", error);
      toast.error("Erro ao excluir funcionário.");
    } else {
      toast.success("Funcionário excluído com sucesso!");
      buscarFuncionarios(); // Atualiza lista
    }
  };

  return (
    <Container>
      <Header />
      <h2>Gerenciar Funcionários</h2>
      <Button variant="primary" onClick={() => navigate("/cadastro-funcionario")}>
        + Adicionar Funcionário
      </Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {funcionarios.length > 0 ? (
            funcionarios.map((func) => (
              <tr key={func.id}>
                <td>{func.nome}</td>
                <td>{func.email}</td>
                <td>
                  <Button variant="warning" className="me-2" onClick={() => navigate(`/editar-funcionario/${func.id}`)}>
                    <FaEdit />
                  </Button>
                  <Button variant="danger" onClick={() => excluirFuncionario(func.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">Nenhum funcionário cadastrado.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default GerenciarFuncionarios;
