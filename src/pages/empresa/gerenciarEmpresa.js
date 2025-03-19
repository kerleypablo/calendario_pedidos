import React, { useState } from "react";
import { useEmpresa } from "../../context/EmpresaContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Modal } from "react-bootstrap";
import Header from "../../components/header/header";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "../../components/loading/loading";
import UploadLogo from "../../components/upload/uploadLogo";
import "./gerenciarEmpresa.css";

function GerenciarEmpresa() {
  const { empresa, setEmpresa, loading: loadingEmpresa } = useEmpresa();
  const { usuario, loading: loadingUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleExcluirEmpresa = async () => {
    if (!empresa) return;

    const { error: erroUsuario } = await supabase
      .from("usuarios")
      .update({ empresa_id: null })
      .eq("empresa_id", empresa.id);

    if (erroUsuario) {
      console.error("Erro ao atualizar usuário:", erroUsuario);
      return;
    }

    const { error: erroEmpresa } = await supabase
      .from("empresas")
      .delete()
      .eq("id", empresa.id);

    if (erroEmpresa) {
      console.error("Erro ao excluir empresa:", erroEmpresa);
      return;
    }

    setEmpresa(null);
    sessionStorage.removeItem("empresa");
    setShowModal(false);

    toast.success("Empresa excluída com sucesso!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  return (
    <>
      <Header />
      <Container className="empresa-container">
        <h2 className="text-center">Gerenciar Empresa</h2>

        {loadingUser || loadingEmpresa ? (
          <Loading />
        ) : empresa ? (
          <Card className="empresa-card">
            <Card.Body>
              <Card.Title>{empresa.nome}</Card.Title>
              {empresa?.logo_url ? (
                 <img src={empresa.logo_url} alt="Logo da Empresa" className="empresa-logo" />
              ) : (
                  <p className="text-muted">Nenhuma logo cadastrada</p>
                )}
              <Card.Text>
                <strong>CNPJ:</strong> {empresa.cnpj || "Não informado"}
              </Card.Text>
              <Card.Text>
                <strong>Endereço:</strong> {empresa.endereco || "Não informado"}
              </Card.Text>

              <UploadLogo /> {/* 🔥 Adicionando o componente de upload */}

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
