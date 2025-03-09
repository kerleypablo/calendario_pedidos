import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Modal } from "react-bootstrap";
import Header from "../../components/header/header";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importação do CSS do Toastify
import "./gerenciarEmpresa.css";

function GerenciarEmpresa() {
  const [empresa, setEmpresa] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const buscarEmpresa = async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData.user) return;

      setUserId(userData.user.id); // Armazena o ID do usuário logado

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", userData.user.id)
        .single();

      if (usuario?.empresa_id) {
        const { data: empresaData } = await supabase
          .from("empresas")
          .select("*")
          .eq("id", usuario.empresa_id)
          .single();
        setEmpresa(empresaData);
      }
    };

    buscarEmpresa();
  }, []);

  const handleExcluirEmpresa = async () => {
    if (!empresa) return;

    // Primeiro, remover o vínculo da empresa no usuário SEM excluir o usuário
    const { error: erroUsuario } = await supabase
      .from("usuarios")
      .update({ empresa_id: null }) // Apenas atualiza, sem deletar
      .eq("empresa_id", empresa.id);

    if (erroUsuario) {
      console.error("Erro ao atualizar usuário:", erroUsuario);
      return;
    }

    // Agora, excluir a empresa do banco
    const { error: erroEmpresa } = await supabase
      .from("empresas")
      .delete()
      .eq("id", empresa.id);

    if (erroEmpresa) {
      console.error("Erro ao excluir empresa:", erroEmpresa);
      return;
    }

    setEmpresa(null);
    setShowModal(false);

    // 🔥 Exibir toast de sucesso
    toast.success("Empresa excluída com sucesso!", {
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
    <>
      <Header />
      <Container className="empresa-container">
        <h2 className="text-center">Gerenciar Empresa</h2>

        {empresa ? (
          <Card className="empresa-card">
            <Card.Body>
              <Card.Title>{empresa.nome}</Card.Title>
              <Card.Text><strong>CNPJ:</strong> {empresa.cnpj || "Não informado"}</Card.Text>
              <Card.Text><strong>Endereço:</strong> {empresa.endereco || "Não informado"}</Card.Text>

              <div className="empresa-actions">
                <Button variant="warning" onClick={() => navigate(`/editar-empresa/${empresa.id}`)}>
                  <FaEdit /> Editar
                </Button>
                <Button variant="danger" onClick={() => setShowModal(true)}>
                  <FaTrash /> Excluir
                </Button>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <div className="text-center sem-empresa">
            <p className="text-muted">Nenhuma empresa cadastrada.</p>
            <Button variant="primary" onClick={() => navigate("/cadastro-empresa")}>
              <FaPlus /> Cadastrar Empresa
            </Button>
          </div>
        )}
      </Container>

      {/* Modal de Confirmação para Excluir */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>Tem certeza que deseja excluir esta empresa?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleExcluirEmpresa}>Excluir</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default GerenciarEmpresa;
