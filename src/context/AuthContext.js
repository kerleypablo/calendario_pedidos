import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const hasFetchedUser = useRef(false); // 🔥 Evita execuções múltiplas no `useEffect`
  const usuarioSalvo = sessionStorage.getItem("usuario");
  const [usuario, setUsuario] = useState(usuarioSalvo ? JSON.parse(usuarioSalvo) : null);
  const [loading, setLoading] = useState(!usuario);

  useEffect(() => {
    if (usuario || hasFetchedUser.current) return; // ✅ Se já tem usuário, evita a requisição

    hasFetchedUser.current = true;

    const buscarUsuario = async () => {
      setLoading(true);
      try {
        const { data: userData, error } = await supabase.auth.getUser();
        if (!error && userData?.user) {
          sessionStorage.setItem("usuario", JSON.stringify(userData.user)); // 🚀 Cache antes de setar estado
          setUsuario(userData.user);
        }
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      }
      setLoading(false);
    };

    buscarUsuario();
  }, []); 

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
