import React, { useState, useEffect } from "react";
import axios from "axios";
import { useEmpresa } from "../../context/EmpresaContext";
import { useAuth } from "../../context/AuthContext"; // 🔥 Importando autenticação
import { toast } from "react-toastify";
import { supabase } from "../../services/supabase";
import "react-toastify/dist/ReactToastify.css";

const UploadLogo = () => {
  const { empresa, setEmpresa } = useEmpresa();
  const { usuario } = useAuth(); // 🔥 Pegando usuário autenticado
  const [preview, setPreview] = useState(empresa?.logo_url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (empresa?.logo_url) {
      setPreview(empresa.logo_url);
    }
  }, [empresa]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const fetchEmpresaAtualizada = async () => {
    const { data, error } = await supabase
      .from("empresas")
      .select("*")
      .eq("id", empresa.id)
      .single();

    if (error) {
      console.error("Erro ao buscar empresa:", error);
      return;
    }

    setEmpresa(data);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning("Por favor, selecione uma imagem.");
      return;
    }

    if (!empresa?.id) {
      toast.error("Erro: ID da empresa não informado.");
      return;
    }

    if (!usuario) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Enviando logo...");

      const token = (await supabase.auth.getSession()).data?.session?.access_token;

      const formData = new FormData();
      formData.append("logo", selectedFile);
      formData.append("empresaId", empresa.id);

      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // 🔥 Enviando token no header
          },
        }
      );

      toast.success("Logo enviada com sucesso!");
      await fetchEmpresaAtualizada();
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao enviar a imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h3>Upload de Logo</h3>
      {preview && <img src={preview} alt="Logo da Empresa" className="logo-preview" />}
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
      {selectedFile && (
        <button className="upload-btn" onClick={handleUpload} disabled={loading}>
          {loading ? "Enviando..." : "Salvar"}
        </button>
      )}
    </div>
  );
};

export default UploadLogo;
