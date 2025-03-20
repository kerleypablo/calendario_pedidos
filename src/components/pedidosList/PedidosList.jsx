"use client"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { Button, Spinner } from "react-bootstrap"
import "./PedidosList.css"

const PedidosList = ({ pedidos, loading, title, resumido = false }) => {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="pedidos-list-container">
        <h3>{title || "Pedidos"}</h3>
        <div className="loading-container">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      </div>
    )
  }

  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="pedidos-list-container">
        <h3>{title || "Pedidos"}</h3>
        <div className="no-pedidos">Nenhum pedido encontrado</div>
      </div>
    )
  }

  return (
    <div className="pedidos-list-container">
      <h3>{title || "Pedidos"}</h3>
      <div className="pedidos-list">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="pedido-card" onClick={() => navigate(`/pedido/${pedido.id}`)}>
            <div className="pedido-header">
              <h4>{pedido.titulo || "Pedido sem título"}</h4>
              <span className={`pedido-status status-${pedido.status || "pendente"}`}>
                {pedido.status || "Pendente"}
              </span>
            </div>

            <div className="pedido-info">
              <p>
                <strong>Cliente:</strong> {pedido.cliente || "Não informado"}
              </p>
              <p>
                <strong>Data de Entrega:</strong>{" "}
                {format(parseISO(pedido.data_entrega), "dd/MM/yyyy", { locale: ptBR })}
              </p>

              {!resumido && (
                <>
                  <p>
                    <strong>Horário:</strong> {pedido.hora_entrega || "Não definido"}
                  </p>
                  {pedido.tipo_entrega && (
                    <p>
                      <strong>Tipo de Entrega:</strong> {pedido.tipo_entrega}
                    </p>
                  )}
                  {pedido.descricao && (
                    <p>
                      <strong>Descrição:</strong> {pedido.descricao}
                    </p>
                  )}
                </>
              )}
            </div>

            {!resumido && (
              <div className="pedido-actions">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/pedido/${pedido.id}`)
                  }}
                >
                  Ver detalhes
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/editar-pedido/${pedido.id}`)
                  }}
                >
                  Editar
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PedidosList

