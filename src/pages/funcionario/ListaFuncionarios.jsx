"use client"

import { useState, useEffect } from "react"
import { Container, Card, Button, Table, Spinner, Modal, Alert } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabase"
import { toast } from "react-toastify"
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"
import Navbar from "../../components/buttomNav/NavBar"
import "./Funcionarios.css"

const ListaFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  const fetchFuncionarios = async () => {
    try {
      setLoading(true)
      setError("")

      // Buscar empresa do usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Você precisa estar logado para visualizar funcionários")
        return
      }

      const { data: usuarioAtual } = await supabase
        .from("usuarios")
        .select("empresa_id, is_admin")
        .eq("id", user.id)
        .single()

      if (!usuarioAtual?.empresa_id) {
        setError("Você precisa ter uma empresa cadastrada para visualizar funcionários")
        return
      }

      if (!usuarioAtual.is_admin) {
        setError("Você não tem permissão para acessar esta página")
        return
      }

      // Buscar funcionários da empresa
      const { data, error } = await supabase.from("usuarios").select("*").eq("empresa_id", usuarioAtual.empresa_id)

      if (error) throw error

      setFuncionarios(data || [])
    } catch (err) {
      console.error("Erro ao buscar funcionários:", err)
      setError("Erro ao buscar funcionários. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleExcluir = (funcionario) => {
    setFuncionarioParaExcluir(funcionario)
    setShowModal(true)
  }

  const confirmarExclusao = async () => {
    if (!funcionarioParaExcluir) return

    try {
      setLoading(true)

      // Excluir usuário da tabela usuarios
      const { error: dbError } = await supabase.from("usuarios").delete().eq("id", funcionarioParaExcluir.id)

      if (dbError) throw dbError

      // Excluir usuário do Auth do Supabase
      const { error: authError } = await supabase.auth.admin.deleteUser(funcionarioParaExcluir.id)

      if (authError) throw authError

      // Atualizar lista
      setFuncionarios(funcionarios.filter((f) => f.id !== funcionarioParaExcluir.id))

      toast.success("Funcionário excluído com sucesso!")
      setShowModal(false)
    } catch (err) {
      console.error("Erro ao excluir funcionário:", err)
      toast.error("Erro ao excluir funcionário. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="funcionarios-page">
      <Container className="funcionarios-container">
        <div className="page-header">
          <h2>Funcionários</h2>
          <Button variant="primary" onClick={() => navigate("/cadastro-funcionario")}>
            <FaPlus /> Novo Funcionário
          </Button>
        </div>

        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : loading ? (
          <div className="loading-container">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
          </div>
        ) : funcionarios.length === 0 ? (
          <Alert variant="info">Nenhum funcionário cadastrado. Clique no botão acima para adicionar.</Alert>
        ) : (
          <Card className="funcionarios-card">
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Função</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((funcionario) => (
                    <tr key={funcionario.id}>
                      <td>{funcionario.nome}</td>
                      <td>{funcionario.email}</td>
                      <td>{funcionario.is_admin ? "Administrador" : "Funcionário"}</td>
                      <td>
                        <div className="table-actions">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/editar-funcionario/${funcionario.id}`)}
                          >
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleExcluir(funcionario)}>
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Modal de confirmação de exclusão */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Tem certeza que deseja excluir o funcionário <strong>{funcionarioParaExcluir?.nome}</strong>?
          </p>
          <p className="text-danger">
            <strong>Atenção:</strong> Esta ação não pode ser desfeita.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarExclusao}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      <Navbar />
    </div>
  )
}

export default ListaFuncionarios

