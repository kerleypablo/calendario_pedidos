"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../services/supabase"
import { useEmpresa } from "../../context/EmpresaContext"
import { Calendar, ShoppingBag, Users, Settings } from "lucide-react"
import BottomNavBar from "../../components/buttomNav/NavBar"
import "./Home.css"

const Home = () => {
  const navigate = useNavigate()
  const { empresa, loading: loadingEmpresa } = useEmpresa()
  const [pedidosHoje, setPedidosHoje] = useState(0)
  const [pedidosSemana, setPedidosSemana] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        navigate("/login")
      }
    }

    checkUser()
    fetchPedidosCount()
  }, [navigate])

  const fetchPedidosCount = async () => {
    try {
      setLoading(true)

      // Obter data de hoje formatada
      const today = new Date()
      const formattedToday = today.toISOString().split("T")[0]

      // Obter data de uma semana atrás
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const formattedOneWeekAgo = oneWeekAgo.toISOString().split("T")[0]

      // Buscar pedidos de hoje
      const { data: pedidosHojeData, error: errorHoje } = await supabase
        .from("pedidos")
        .select("id")
        .eq("data_entrega", formattedToday)

      if (errorHoje) throw errorHoje

      // Buscar pedidos da semana
      const { data: pedidosSemanaData, error: errorSemana } = await supabase
        .from("pedidos")
        .select("id")
        .gte("data_entrega", formattedOneWeekAgo)
        .lte("data_entrega", formattedToday)
        console.log(pedidosSemana,loading);


      if (errorSemana) throw errorSemana

      setPedidosHoje(pedidosHojeData?.length || 0)
      setPedidosSemana(pedidosSemanaData?.length || 0)
    } catch (error) {
      console.error("Erro ao buscar contagem de pedidos:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular porcentagem para o círculo de progresso
  const progressPercentage = Math.min(100, (pedidosHoje / 10) * 100) // Assumindo 10 como máximo para exemplo

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="status-bar">
          <span className="time">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <div className="status-icons">
            <span className="signal-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M10 12L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M14 6L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="battery-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M20 10H22C23.1046 10 24 10.8954 24 12V12C24 13.1046 23.1046 14 22 14H20V10Z"
                  fill="currentColor"
                />
                <rect x="4" y="8" width="14" height="8" fill="currentColor" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="home-content">
        <div className="logo-progress-container">
          <div className="logo-progress" style={{ "--progress": `${progressPercentage}%` }}>
            {loadingEmpresa ? (
              <div className="logo-placeholder"></div>
            ) : empresa?.logo_url ? (
              <img src={empresa.logo_url || "/placeholder.svg"} alt="Logo da Empresa" className="logo-image" />
            ) : (
              <div className="logo-placeholder">{empresa?.nome ? empresa.nome.charAt(0).toUpperCase() : "C"}</div>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <div className="action-row">
            <div className="action-button" onClick={() => navigate("/calendario")}>
              <div className="action-icon">
                <Calendar size={24} />
              </div>
              <span className="action-label">Calendário</span>
            </div>

            <div className="action-button" onClick={() => navigate("/pedidos")}>
              <div className="action-icon">
                <ShoppingBag size={24} />
              </div>
              <span className="action-label">Pedidos</span>
            </div>
          </div>

          <div className="action-row">
            <div className="action-button" onClick={() => navigate("/funcionarios")}>
              <div className="action-icon">
                <Users size={24} />
              </div>
              <span className="action-label">Funcionários</span>
            </div>

            <div className="action-button" onClick={() => navigate("/empresa")}>
              <div className="action-icon">
                <Settings size={24} />
              </div>
              <span className="action-label">Configurações</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  )
}

export default Home

