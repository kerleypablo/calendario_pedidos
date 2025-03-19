import React, { useState, useEffect } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './OrderList.css';
import { supabase } from '../../supabaseClient';

const OrderList = ({ selectedDate }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          clientes (nome, telefone),
          produtos (nome, preco)
        `);
      
      if (error) {
        console.error('Erro ao buscar pedidos:', error);
        setLoading(false);
        return;
      }
      
      setOrders(data || []);
      setLoading(false);
    };
    
    fetchOrders();
  }, []);
  
  // Filtrar pedidos para o dia selecionado
  const filteredOrders = orders.filter(order => 
    isSameDay(parseISO(order.data_entrega), selectedDate)
  );
  
  // Determinar a cor do pedido baseado no tipo
  const getOrderColor = (order) => {
    switch (order.tipo) {
      case 'urgente':
        return 'red';
      case 'especial':
        return 'orange';
      case 'normal':
        return 'blue';
      default:
        return 'green';
    }
  };
  
  if (loading) {
    return <div className="loading">Carregando pedidos...</div>;
  }
  
  return (
    <div className="order-list">
      <h3>Pedidos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</h3>
      
      {filteredOrders.length === 0 ? (
        <div className="no-orders">Nenhum pedido para esta data</div>
      ) : (
        filteredOrders.map(order => (
          <div 
            key={order.id} 
            className={`order-card ${getOrderColor(order)}`}
          >
            <div className="order-header">
              <h4>{order.clientes?.nome || 'Cliente'}</h4>
              <div className="order-actions">
                <button className="action-button">•••</button>
              </div>
            </div>
            
            <div className="order-details">
              <div className="order-date">
                <span className="icon">📅</span>
                <span>{format(parseISO(order.data_entrega), "dd/MM/yyyy")}</span>
              </div>
              
              <div className="order-time">
                <span className="icon">⏰</span>
                <span>{order.hora_entrega || 'Horário não definido'}</span>
              </div>
              
              <div className="order-product">
                <span className="icon">🎂</span>
                <span>{order.produtos?.nome || 'Produto não especificado'}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default OrderList;
