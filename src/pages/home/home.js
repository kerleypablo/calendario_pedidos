"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../services/supabase"
import { useNavigate } from "react-router-dom"
import { startOfWeek, endOfWeek, format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import Calendar from "../../components/Calendar/calendar"
import PedidosList from "../../components/pedidosList/pedidosList"
import BottomNavBar from "../../components/buttomNav/buttomNavBar"
import "./home.css"

const Home = () => {
  const [pedidosSemana, setPedidosSemana] = useState([])
  const [pedidosDia, setPedidosDia] = useState([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
    fetchPedidosSemana()
  }, [])

  useEffect(() => {
    fetchPedidosDia(selectedDate)
  }, [selectedDate])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      navigate("/login")
    }
  }

  const fetchPedidosSemana = async () => {
    try {
      setLoading(true)
      const today = new Date()
      const start = startOfWeek(today, { weekStartsOn: 0 })
      const end = endOfWeek(today, { weekStartsOn: 0 })

      const startDate = format(start, "yyyy-MM-dd")
      const endDate = format(end, "yyyy-MM-dd")

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .gte("data_entrega", startDate)
        .lte("data_entrega", endDate)
        .order("data_entrega", { ascending: true })

      if (error) throw error
      setPedidosSemana(data || [])
    } catch (error) {
      console.error("Erro ao buscar pedidos da semana:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPedidosDia = async (date) => {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("data_entrega", date)
        .order("horario_entrega", { ascending: true })

      if (error) throw error
      setPedidosDia(data || [])
    } catch (error) {
      console.error("Erro ao buscar pedidos do dia:", error)
    }
  }

  const handleDayClick = (date) => {
    setSelectedDate(date)
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Calendário de Pedidos</h1>

        <Calendar onDayClick={handleDayClick} />

        {selectedDate && (
          <PedidosList
            pedidos={pedidosDia}
            title={`Pedidos para ${format(parseISO(selectedDate), "dd/MM/yyyy", { locale: ptBR })}`}
          />
        )}

        <PedidosList pedidos={pedidosSemana} title="Pedidos da Semana" />
      </div>

      <BottomNavBar />
    </div>
  )
}

export default Home

