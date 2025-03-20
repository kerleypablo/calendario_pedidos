"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../services/supabase"
import { useNavigate, useParams } from "react-router-dom"
import { Form, Button, Container, Card, Row, Col, Table, Alert, Spinner } from "react-bootstrap"
import { toast } from "react-toastify"
import Navbar from "../../components/buttomNav/NavBar"
import "./PedidosForm.css"

function PedidoForm() {
  const navigate = useNavigate()
  const { id } = useParams() // Para edição de pedidos existentes
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState([])
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [pedido, setPedido] = useState({
    cliente: "",
    telefone: "",
    titulo: "",
    data_entrega: "",
    hora_entrega: "",
    descricao: "",
    tipo_entrega: "Retirada em Casa",
    status: "pendente",
  })

  const [produtos, setProdutos] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  // Buscar clientes para o select
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoadingClientes(true)
        const { data, error } = await supabase.from("clientes").select("*").order("nome", { ascending: true })

        if (error) throw error
        setClientes(data || [])
      } catch (err) {
        console.error("Erro ao buscar clientes:", err)
        toast.error("Erro ao carregar lista de clientes")
      } finally {
        setLoadingClientes(false)
      }
    }

    fetchClientes()
  }, [])

  // Buscar pedido existente se estiver editando
  useEffect(() => {
    if (id) {
      setIsEditing(true)
      const fetchPedido = async () => {
        try {
          setLoading(true)
          const { data, error } = await supabase.from("pedidos").select("*").eq("id", id).single()

          if (error) throw error

          if (data) {
            // Formatar data e hora para os inputs
            const dataEntrega = data.data_entrega
            const horaEntrega = data.hora_entrega?.substring(0, 5) || "" // HH:MM

            setPedido({
              ...data,
              data_entrega: dataEntrega,
              hora_entrega: horaEntrega,
            })

            // Carregar produtos se existirem
            if (data.produtos && Array.isArray(data.produtos)) {
              setProdutos(data.produtos)
            }
          }
        } catch (err) {
          console.error("Erro ao buscar pedido:", err)
          toast.error("Erro ao carregar dados do pedido")
        } finally {
          setLoading(false)
        }
      }

      fetchPedido()
    }
  }, [id])

  // Adicionar novo produto
  const adicionarProduto = () => {
    setProdutos([...produtos, { nome: "", quantidade: 1, valor: 0 }])
  }

  // Atualizar produto
  const atualizarProduto = (index, campo, valor) => {
    const novosProdutos = [...produtos]
    novosProdutos[index][campo] = valor
    setProdutos(novosProdutos)
  }

  // Remover produto
  const removerProduto = (index) => {
    const novosProdutos = produtos.filter((_, i) => i !== index)
    setProdutos(novosProdutos)
  }

  // Atualizar campos do pedido
  const handleChange = (e) => {
    const { name, value } = e.target
    setPedido({ ...pedido, [name]: value })
  }

  // Selecionar cliente existente
  const handleClienteSelect = (e) => {
    const clienteId = e.target.value
    if (clienteId === "novo") {
      setPedido({
        ...pedido,
        cliente: "",
        telefone: "",
      })
      return
    }

    const clienteSelecionado = clientes.find((c) => c.id.toString() === clienteId)
    if (clienteSelecionado) {
      setPedido({
        ...pedido,
        cliente: clienteSelecionado.nome,
        telefone: clienteSelecionado.telefone || "",
      })
    }
  }

  // Salvar pedido
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!pedido.cliente || !pedido.titulo || !pedido.data_entrega || !pedido.hora_entrega) {
      toast.error("Preencha todos os campos obrigatórios!")
      return
    }

    try {
      setLoading(true)

      // Calcular valor total
      const valorTotal = produtos.reduce((total, produto) => {
        return total + Number.parseFloat(produto.valor) * Number.parseInt(produto.quantidade)
      }, 0)

      const pedidoData = {
        cliente: pedido.cliente,
        telefone: pedido.telefone,
        titulo: pedido.titulo,
        produtos: produtos,
        data_entrega: pedido.data_entrega,
        hora_entrega: pedido.hora_entrega + ":00", // Adicionar segundos
        descricao: pedido.descricao,
        tipo_entrega: pedido.tipo_entrega,
        status: pedido.status,
        valor_total: valorTotal,
      }

      let result

      if (isEditing) {
        // Atualizar pedido existente
        const { data, error } = await supabase.from("pedidos").update(pedidoData).eq("id", id).select()

        if (error) throw error
        result = data
        toast.success("Pedido atualizado com sucesso!")
      } else {
        // Criar novo pedido
        const { data, error } = await supabase.from("pedidos").insert([pedidoData]).select()

        if (error) throw error
        result = data
        toast.success("Pedido criado com sucesso!")
      }

      // Verificar se o cliente já existe, se não, criar
      if (pedido.cliente && pedido.telefone) {
        const clienteExistente = clientes.find((c) => c.nome.toLowerCase() === pedido.cliente.toLowerCase())

        if (!clienteExistente) {
          await supabase.from("clientes").insert([
            {
              nome: pedido.cliente,
              telefone: pedido.telefone,
            },
          ])
        }
      }

      navigate("/pedidos")
    } catch (err) {
      console.error("Erro ao salvar pedido:", err)
      toast.error("Erro ao salvar pedido. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="pedido-form-page">
      <Container className="pedido-form-container">
        <Card className="pedido-form-card">
          <Card.Header as="h2" className="text-center">
            {isEditing ? "Editar Pedido" : "Novo Pedido"}
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={12} lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cliente *</Form.Label>
                    {loadingClientes ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <Form.Select onChange={handleClienteSelect} className="mb-2">
                        <option value="">Selecione um cliente ou cadastre novo</option>
                        <option value="novo">+ Novo Cliente</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id} selected={pedido.cliente === cliente.nome}>
                            {cliente.nome}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                    <Form.Control
                      type="text"
                      placeholder="Nome do cliente"
                      name="cliente"
                      value={pedido.cliente}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={12} lg={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="(00) 00000-0000"
                      name="telefone"
                      value={pedido.telefone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Título do Pedido *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: Bolo de Aniversário"
                  name="titulo"
                  value={pedido.titulo}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data de Entrega *</Form.Label>
                    <Form.Control
                      type="date"
                      name="data_entrega"
                      value={pedido.data_entrega}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Hora de Entrega *</Form.Label>
                    <Form.Control
                      type="time"
                      name="hora_entrega"
                      value={pedido.hora_entrega}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Entrega</Form.Label>
                    <Form.Select name="tipo_entrega" value={pedido.tipo_entrega} onChange={handleChange}>
                      <option value="Retirada em Casa">Retirada em Casa</option>
                      <option value="Delivery">Delivery</option>
                      <option value="MRV">MRV</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={pedido.status} onChange={handleChange}>
                      <option value="pendente">Pendente</option>
                      <option value="em_producao">Em Produção</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Detalhes adicionais sobre o pedido"
                  name="descricao"
                  value={pedido.descricao}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="produtos-section">
                <h4 className="produtos-title">Produtos</h4>

                {produtos.length === 0 ? (
                  <Alert variant="info">
                    Nenhum produto adicionado. Clique no botão abaixo para adicionar produtos.
                  </Alert>
                ) : (
                  <Table responsive striped bordered hover className="produtos-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Quantidade</th>
                        <th>Valor (R$)</th>
                        <th>Subtotal</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.map((produto, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Control
                              type="text"
                              placeholder="Nome do produto"
                              value={produto.nome}
                              onChange={(e) => atualizarProduto(index, "nome", e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              value={produto.quantidade}
                              onChange={(e) => atualizarProduto(index, "quantidade", e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              step="0.01"
                              min="0"
                              value={produto.valor}
                              onChange={(e) => atualizarProduto(index, "valor", e.target.value)}
                              required
                            />
                          </td>
                          <td className="subtotal">R$ {(produto.quantidade * produto.valor).toFixed(2)}</td>
                          <td>
                            <Button variant="danger" size="sm" onClick={() => removerProduto(index)}>
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>Total:</strong>
                        </td>
                        <td colSpan="2">
                          <strong>
                            R${" "}
                            {produtos
                              .reduce((total, produto) => {
                                return total + produto.quantidade * produto.valor
                              }, 0)
                              .toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </Table>
                )}

                <Button variant="success" onClick={adicionarProduto} className="add-produto-btn">
                  + Adicionar Produto
                </Button>
              </div>

              <div className="form-actions">
                <Button variant="secondary" onClick={() => navigate("/pedidos")}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Salvando...
                    </>
                  ) : isEditing ? (
                    "Atualizar Pedido"
                  ) : (
                    "Criar Pedido"
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

export default PedidoForm

