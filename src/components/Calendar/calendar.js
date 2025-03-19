"use client"

import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { supabase } from "../../services/supabase"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import "./calendar.css"

const Calendar = ({ onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPedidos()
  }, [currentDate])

  const fetchPedidos = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      const startDate = format(startOfMonth(currentDate), "yyyy-MM-dd")
      const endDate = format(endOfMonth(currentDate), "yyyy-MM-dd")

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .gte("data_entrega", startDate)
        .lte("data_entrega", endDate)

      if (error) throw error
      setPedidos(data || [])
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    return eachDayOfInterval({ start, end })
  }

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const hasPedidoOnDay = (day) => {
    const formattedDay = format(day, "yyyy-MM-dd")
    return pedidos.some((pedido) => pedido.data_entrega === formattedDay)
  }

  const getPedidoColor = (day) => {
    const formattedDay = format(day, "yyyy-MM-dd")
    const pedidosDoDay = pedidos.filter((pedido) => pedido.data_entrega === formattedDay)

    if (pedidosDoDay.length === 0) return ""

    // Cores diferentes baseadas na quantidade ou status dos pedidos
    if (pedidosDoDay.length > 2) return "pedido-vermelho"
    if (pedidosDoDay.length > 1) return "pedido-laranja"
    return "pedido-verde"
  }

  const handleDayClick = (day) => {
    if (onDayClick && isSameMonth(day, currentDate)) {
      onDayClick(format(day, "yyyy-MM-dd"))
    }
  }

  const days = getDaysInMonth()
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"]

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={previousMonth} className="month-nav">
          <ChevronLeft size={20} />
        </button>
        <h2>{format(currentDate, "MMMM yyyy", { locale: ptBR })}</h2>
        <button onClick={nextMonth} className="month-nav">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="weekdays">
        {weekDays.map((day, index) => (
          <div key={index} className="weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="days">
        {days.map((day, index) => {
          const dayNumber = day.getDate()
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())
          const pedidoColor = getPedidoColor(day)

          return (
            <div
              key={index}
              className={`day ${!isCurrentMonth ? "other-month" : ""} ${isToday ? "today" : ""} ${pedidoColor}`}
              onClick={() => handleDayClick(day)}
            >
              {dayNumber}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar

