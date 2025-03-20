import { Link, useLocation } from "react-router-dom"
import { Home, Calendar, User, Plus, MessageSquare } from "lucide-react"
import "./NavBar.css"

const NavBar = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="bottom-navbar">
      <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
        <Home size={20} />
        <span>Hoje</span>
      </Link>

      <Link to="/calendario" className={`nav-item ${isActive("/calendario") ? "active" : ""}`}>
        <Calendar size={20} />
        <span>Calendário</span>
      </Link>

      <div className="nav-item-center">
        <Link to="/novo-pedido" className="new-pedido-button">
          <Plus size={24} />
        </Link>
      </div>

      <Link to="/empresa" className={`nav-item ${isActive("/mensagens") ? "active" : ""}`}>
        <MessageSquare size={20} />
        <span>Empresa</span>
      </Link>

      <Link to="/perfil" className={`nav-item ${isActive("/perfil") ? "active" : ""}`}>
        <User size={20} />
        <span>Perfil</span>
      </Link>
    </div>
  )
}

export default NavBar

