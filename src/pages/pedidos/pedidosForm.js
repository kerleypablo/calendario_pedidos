import React, { useState } from "react";
import { supabase } from "../../services/supabase";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Table } from "react-bootstrap";

function PedidoForm() {
  const navigate = useNavigate();
  const [pedido, setPedido] = useState({
    nome_cliente: "",
    telefone: "",
    titulo: "",
    data_entrega: "",
    hora_entrega: "",
    descricao: "",
    tipo_entrega: "Retirada em Casa",
    imagem: null,
  });

  const [produtos, setProdutos] = useState([]); // Lista de produtos

  // Função para adicionar um novo produto
  const adicionarProduto = () => {
    setProdutos([...produtos, { nome: "", quantidade: 1, valor: 0 }]);
  };

  // Função para atualizar um produto específico
  const atualizarProduto = (index, campo, valor) => {
    const novosProdutos = [...produtos];
    novosProdutos[index][campo] = valor;
    setProdutos(novosProdutos);
  };

  // Função para remover um produto
  const removerProduto = (index) => {
    const novosProdutos = produtos.filter((_, i) => i !== index);
    setProdutos(novosProdutos);
  };

  // Atualiza os campos do pedido (exceto produtos)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPedido({ ...pedido, [name]: value });
  };

  // Formatação correta para salvar no banco
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pedido.nome_cliente || !pedido.titulo || !pedido.data_entrega || !pedido.hora_entrega) {
      alert("Preencha os campos obrigatórios!");
      return;
    }

    const formattedDate = new Date(pedido.data_entrega).toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = pedido.hora_entrega + ":00"; // HH:MM:SS

    try {
      const { data, error } = await supabase
        .from("pedidos")
        .insert([
          {
            cliente: pedido.nome_cliente,
            telefone: pedido.telefone,
            titulo: pedido.titulo,
            produtos: produtos, // Salva a lista de produtos como JSONB
            data_entrega: formattedDate,
            hora_entrega: formattedTime,
            descricao: pedido.descricao,
            tipo_entrega: pedido.tipo_entrega,
          },
        ]);

      if (error) {
        console.error("Erro ao salvar pedido:", error);
        alert("Erro ao salvar pedido. Verifique os campos e tente novamente.");
      } else {
        alert("Pedido salvo com sucesso!");
        navigate("/home"); // Redireciona para a Home
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      alert("Erro inesperado ao salvar o pedido.");
    }
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow">
        <h2 className="text-center">Novo Pedido</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nome do Cliente *</Form.Label>
            <Form.Control type="text" name="nome_cliente" onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Telefone</Form.Label>
            <Form.Control type="tel" name="telefone" onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Título *</Form.Label>
            <Form.Control type="text" name="titulo" onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Data de Entrega *</Form.Label>
            <Form.Control type="date" name="data_entrega" onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hora de Entrega *</Form.Label>
            <Form.Control type="time" name="hora_entrega" onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control as="textarea" rows={3} name="descricao" onChange={handleChange} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Entrega</Form.Label>
            <Form.Select name="tipo_entrega" onChange={handleChange}>
              <option value="Retirada em Casa">Retirada em Casa</option>
              <option value="Delivery">Delivery</option>
              <option value="MRV">MRV</option>
            </Form.Select>
          </Form.Group>

          {/* Tabela de Produtos */}
          <h4 className="mt-4">Produtos</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Quantidade</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto, index) => (
                <tr key={index}>
                  <td>
                    <Form.Control
                      type="text"
                      value={produto.nome}
                      onChange={(e) => atualizarProduto(index, "nome", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      value={produto.quantidade}
                      onChange={(e) => atualizarProduto(index, "quantidade", e.target.value)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={produto.valor}
                      onChange={(e) => atualizarProduto(index, "valor", e.target.value)}
                    />
                  </td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => removerProduto(index)}>
                      ❌
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button variant="success" onClick={adicionarProduto}>
            ➕ Adicionar Produto
          </Button>

          {/* Botão de Salvar */}
          <Button variant="primary" type="submit" className="w-100 mt-4">
            Salvar Pedido
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default PedidoForm;
