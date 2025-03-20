"use client"

import { useState } from "react"
import { Form, Button, Container, Card, Alert, Spinner } from "react-bootstrap"
import { supabase } from "../../services/supabase"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import Navbar from "../../components/buttomNav/NavBar"
import "./Funcionarios.css"

const CadastroFuncionario = () => {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nome || !email) {
      setError("Nome e email são obrigatórios")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Verificar se o usuário já existe
      const { data: usuarioExistente } = await supabase.from("usuarios").select("*").eq("email", email).single()

      if (usuarioExistente) {
        setError("Este email já está cadastrado")
        return
      }

      // Buscar empresa do usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("Você precisa estar logado para cadastrar funcionários")
        return
      }

      const { data: usuarioAtual } = await supabase.from("usuarios").select("empresa_id").eq("id", user.id).single()

      if (!usuarioAtual?.empresa_id) {
        setError("Você precisa ter uma empresa cadastrada para adicionar funcionários")
        return
      }

      // Criar usuário no Auth do Supabase (sem senha)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { nome, isAdmin },
      })

      if (authError) throw authError

      // Criar usuário na tabela usuarios
      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          id: authData.user.id,
          nome,
          email,
          empresa_id: usuarioAtual.empresa_id,
          auth_google: false,
          is_admin: isAdmin,
        },
      ])

      if (dbError) throw dbError

      toast.success("Funcionário cadastrado com sucesso!")
      navigate("/funcionarios")
    } catch (err) {
      console.error("Erro ao cadastrar funcionário:", err)
      setError("Erro ao cadastrar funcionário. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="funcionarios-page">
      <Container className="funcionarios-container">
        <Card className="funcionario-form-card">
          <Card.Header as="h2" className="text-center">
            Cadastrar Novo Funcionário
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Nome *</Form.Label>
                <Form.Control type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Administrador"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Administradores podem gerenciar funcionários e configurações da empresa.
                </Form.Text>
              </Form.Group>

              <div className="form-actions">
                <Button variant="secondary" onClick={() => navigate("/funcionarios")}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Cadastrando...
                    </>
                  ) : (
                    "Cadastrar Funcionário"
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <Navbar />
    </div>
  )
}

export default CadastroFuncionario

