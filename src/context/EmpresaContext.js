import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../services/supabase";

const EmpresaContext = createContext();

export const EmpresaProvider = ({ children }) => {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarEmpresa = async () => {
      setLoading(true);

      // ⚡ Primeiro, verifica se os dados já estão no sessionStorage
      const empresaSalva = sessionStorage.getItem("empresa");
      if (empresaSalva) {
        setEmpresa(JSON.parse(empresaSalva));
        setLoading(false);
        return;
      }

      // 📡 Faz a requisição apenas se não tiver os dados armazenados
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData.user) {
        setLoading(false);
        return;
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("empresa_id")
        .eq("id", userData.user.id)
        .single();

      if (usuario?.empresa_id) {
        const { data: empresaData } = await supabase
          .from("empresas")
          .select("*")
          .eq("id", usuario.empresa_id)
          .single();

        setEmpresa(empresaData);
        sessionStorage.setItem("empresa", JSON.stringify(empresaData)); // 🔥 Salva no cache
      }

      setLoading(false);
    };

    buscarEmpresa();
  }, []);

  return (
    <EmpresaContext.Provider value={{ empresa, setEmpresa, loading }}>
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => useContext(EmpresaContext);
