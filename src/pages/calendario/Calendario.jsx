"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useSupabaseQuery } from "../../hooks/useSupabaseQuery"
import Calendar from "../../components/Calendar/calendar"
import PedidosList from "../../components/pedidosList/PedidosList"
import Navbar from "../../components/buttomNav/NavBar"
import { supabase } from "../../services/supabase"
import "./Calendario.css"

const Calendario = () => {
  const [selectedDate, setSelectedDate] = useState(null)

  // Buscar todos os pedidos para o calendário
  const { data: todosPedidos, loading: loadingTodosPedidos } = useSupabaseQuery("pedidos", {
    cacheKey: "todos-pedidos",
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Buscar pedidos do dia selecionado
  const { data: pedidosDia, loading: loadingPedidosDia } = useSupabaseQuery("pedidos", {
    enabled: !!selectedDate,
    queryFn: async () => {
      if (!selectedDate) return []

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("data_entrega", selectedDate)
        .order("hora_entrega", { ascending: true })

      if (error) throw error
      return data || []
    },
    dependencies: [selectedDate],
    cacheKey: `pedidos-dia-${selectedDate}`,
    staleTime: 2 * 60 * 1000, // 2 minutos
  })

  // Buscar pedidos da semana
  const { data: pedidosSemana, loading: loadingPedidosSemana } = useSupabaseQuery("pedidos", {
    queryFn: async () => {
      const today = new Date()
      const startDate = format(today, "yyyy-MM-dd")
      const endDate = format(new Date(today.setDate(today.getDate() + 7)), "yyyy-MM-dd")

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .gte("data_entrega", startDate)
        .lte("data_entrega", endDate)
        .order("data_entrega", { ascending: true })

      if (error) throw error
      return data || []
    },
    cacheKey: "pedidos-semana",
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  const handleDayClick = (date) => {
    setSelectedDate(date)
  }

  return (
    <div className="calendario-container">
      <div className="calendario-content">
        <h1>Calendário de Pedidos</h1>

        <Calendar onDayClick={handleDayClick} pedidos={todosPedidos || []} loading={loadingTodosPedidos} />

        {selectedDate ? (
          <PedidosList
            pedidos={pedidosDia || []}
            loading={loadingPedidosDia}
            title={`Pedidos para ${selectedDate ? format(parseISO(selectedDate), "dd/MM/yyyy", { locale: ptBR }) : ""}`}
          />
        ) : (
          <PedidosList
            pedidos={pedidosSemana || []}
            loading={loadingPedidosSemana}
            title="Pedidos da Semana"
            resumido={true}
          />
        )}
      </div>

      <Navbar />
    </div>
  )
}

export default Calendario

