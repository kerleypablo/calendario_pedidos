import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import "./pedidosList.css"

const PedidosList = ({ pedidos, title }) => {
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
          <div key={pedido.id} className="pedido-card">
            <div className="pedido-header">
              <h4>{pedido.nome_cliente}</h4>
              <span className="pedido-status">{pedido.status}</span>
            </div>
            <div className="pedido-info">
              <p>
                <strong>Produto:</strong> {pedido.produto}
              </p>
              <p>
                <strong>Data de Entrega:</strong>{" "}
                {format(parseISO(pedido.data_entrega), "dd/MM/yyyy", { locale: ptBR })}
              </p>
              <p>
                <strong>Horário:</strong> {pedido.horario_entrega || "Não definido"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PedidosList

