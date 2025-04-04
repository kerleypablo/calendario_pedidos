"use client"

import { useState, useEffect } from "react"
import { useEmpresa } from "../../context/EmpresaContext"
import { useAuth } from "../../context/AuthContext"
import { supabase } from "../../services/supabase"
import { useNavigate } from "react-router-dom"
import { Container, Card, Button, Modal, Form, Row, Col, Spinner, Alert } from "react-bootstrap"
import { FaEdit, FaTrash, FaPlus, FaSave, FaUpload } from "react-icons/fa"
import { toast } from "react-toastify"
import Navbar from "../../components/buttomNav/NavBar"
import "./gerenciarEmpresa.css"

function GerenciarEmpresa() {
  const { empresa, setEmpresa, loading: loadingEmpresa } = useEmpresa()
  const { usuario } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
    instagram: "",
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (empresa) {
      setFormData({
        nome: empresa.nome || "",
        cnpj: empresa.cnpj || "",
        endereco: empresa.endereco || "",
        telefone: empresa.telefone || "",
        email: empresa.email || "",
        instagram: empresa.instagram || "",
      })
      console.log(logoPreview);

      if (empresa.logo_url) {
        setLogoPreview(empresa.logo_url)
      }
    }
  }, [empresa])

  const handleExcluirEmpresa = async () => {
    if (!empresa) return

    try {
      const { error: erroUsuario } = await supabase
        .from("usuarios")
        .update({ empresa_id: null })
        .eq("empresa_id", empresa.id)

      if (erroUsuario) throw erroUsuario

      const { error: erroEmpresa } = await supabase.from("empresas").delete().eq("id", empresa.id)

      if (erroEmpresa) throw erroEmpresa

      // Remover logo se existir
      if (empresa.logo_path) {
        await supabase.storage.from("logos").remove([empresa.logo_path])
      }

      setEmpresa(null)
      sessionStorage.removeItem("empresa")
      setShowModal(false)

      toast.success("Empresa excluída com sucesso!")
      navigate("/home")
    } catch (error) {
      console.error("Erro ao excluir empresa:", error)
      toast.error("Erro ao excluir empresa. Tente novamente.")
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }

    setLogoFile(file)

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadLogo = async () => {
    if (!logoFile || !empresa) return

    try {
      setUploading(true)

      // Gerar nome único para o arquivo
      const fileExt = logoFile.name.split(".").pop()
      const fileName = `${empresa.id}_${Date.now()}.${fileExt}`
      const filePath = `empresa_${empresa.id}/${fileName}`

      // Upload para o Storage
      const { error: uploadError } = await supabase.storage.from("logos").upload(filePath, logoFile)

      if (uploadError) throw uploadError

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(filePath)

      // Atualizar empresa com a URL da logo
      const { error: updateError } = await supabase
        .from("empresas")
        .update({
          logo_url: publicUrl,
          logo_path: filePath,
        })
        .eq("id", empresa.id)

      if (updateError) throw updateError

      // Atualizar contexto
      setEmpresa({
        ...empresa,
        logo_url: publicUrl,
        logo_path: filePath,
      })

      // Atualizar sessionStorage
      const empresaCache = JSON.parse(sessionStorage.getItem("empresa") || "{}")
      empresaCache.logo_url = publicUrl
      empresaCache.logo_path = filePath
      sessionStorage.setItem("empresa", JSON.stringify(empresaCache))

      toast.success("Logo atualizada com sucesso!")
    } catch (error) {
      console.error("Erro ao fazer upload da logo:", error)
      toast.error("Erro ao fazer upload da logo. Tente novamente.")
    } finally {
      setUploading(false)
    }
  }

  const handleSaveEmpresa = async () => {
    if (!formData.nome) {
      toast.error("O nome da empresa é obrigatório")
      return
    }

    try {
      setSaving(true)

      if (empresa) {
        // Atualizar empresa existente
        const { error } = await supabase.from("empresas").update(formData).eq("id", empresa.id)

        if (error) throw error

        // Atualizar contexto
        setEmpresa({
          ...empresa,
          ...formData,
        })

        // Atualizar sessionStorage
        const empresaCache = JSON.parse(sessionStorage.getItem("empresa") || "{}")
        sessionStorage.setItem(
          "empresa",
          JSON.stringify({
            ...empresaCache,
            ...formData,
          }),
        )

        toast.success("Empresa atualizada com sucesso!")
      } else {
        // Criar nova empresa
        const { data, error } = await supabase.from("empresas").insert([formData]).select()

        if (error) throw error

        if (data && data[0]) {
          // Vincular empresa ao usuário
          await supabase.from("usuarios").update({ empresa_id: data[0].id }).eq("id", usuario.id)

          setEmpresa(data[0])
          sessionStorage.setItem("empresa", JSON.stringify(data[0]))

          toast.success("Empresa criada com sucesso!")
        }
      }

      setShowEditModal(false)
    } catch (error) {
      console.error("Erro ao salvar empresa:", error)
      toast.error("Erro ao salvar empresa. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  if (loadingEmpresa) {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    )
  }

  return (
    <div className="gerenciar-empresa-page">
      <Container className="gerenciar-empresa-container">
        <h2 className="page-title">Gerenciar Empresa</h2>

        {empresa ? (
          <Card className="empresa-card">
            <Card.Body>
              <div className="empresa-header">
                <div className="empresa-logo-container">
                  {empresa.logo_url ? (
                    <img src={empresa.logo_url || "/placeholder.svg"} alt="Logo da Empresa" className="empresa-logo" />
                  ) : (
                    <div className="empresa-logo-placeholder">{empresa.nome.charAt(0).toUpperCase()}</div>
                  )}

                  <div className="logo-upload">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="logo-input"
                    />
                    <label htmlFor="logo-upload" className="logo-label">
                      <FaUpload /> {empresa.logo_url ? "Alterar Logo" : "Adicionar Logo"}
                    </label>

                    {logoFile && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleUploadLogo}
                        disabled={uploading}
                        className="upload-btn"
                      >
                        {uploading ? (
                          <>
                            <Spinner animation="border" size="sm" /> Enviando...
                          </>
                        ) : (
                          <>
                            <FaSave /> Salvar Logo
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="empresa-info">
                  <h3>{empresa.nome}</h3>

                  {empresa.cnpj && (
                    <p>
                      <strong>CNPJ:</strong> {empresa.cnpj}
                    </p>
                  )}

                  {empresa.endereco && (
                    <p>
                      <strong>Endereço:</strong> {empresa.endereco}
                    </p>
                  )}

                  {empresa.telefone && (
                    <p>
                      <strong>Telefone:</strong> {empresa.telefone}
                    </p>
                  )}

                  {empresa.email && (
                    <p>
                      <strong>Email:</strong> {empresa.email}
                    </p>
                  )}

                  {empresa.instagram && (
                    <p>
                      <strong>Instagram:</strong> {empresa.instagram}
                    </p>
                  )}
                </div>
              </div>

              <div className="empresa-actions">
                <Button variant="primary" onClick={() => setShowEditModal(true)} className="action-btn">
                  <FaEdit /> Editar Dados
                </Button>

                <Button variant="danger" onClick={() => setShowModal(true)} className="action-btn">
                  <FaTrash /> Excluir Empresa
                </Button>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <div className="sem-empresa">
            <Alert variant="info">
              <Alert.Heading>Nenhuma empresa cadastrada</Alert.Heading>
              <p>Você ainda não possui uma empresa cadastrada. Clique no botão abaixo para criar sua empresa.</p>
              <Button variant="primary" onClick={() => setShowEditModal(true)} className="mt-3">
                <FaPlus /> Cadastrar Empresa
              </Button>
            </Alert>
          </div>
        )}
      </Container>

      {/* Modal de confirmação de exclusão */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tem certeza que deseja excluir esta empresa?</p>
          <p className="text-danger">
            <strong>Atenção:</strong> Esta ação não pode ser desfeita.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleExcluirEmpresa}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de edição/criação de empresa */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{empresa ? "Editar Empresa" : "Cadastrar Empresa"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome da Empresa *</Form.Label>
                  <Form.Control type="text" name="nome" value={formData.nome} onChange={handleChange} required />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CNPJ</Form.Label>
                  <Form.Control type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Endereço</Form.Label>
              <Form.Control type="text" name="endereco" value={formData.endereco} onChange={handleChange} />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control type="tel" name="telefone" value={formData.telefone} onChange={handleChange} />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Instagram</Form.Label>
              <Form.Control type="text" name="instagram" value={formData.instagram} onChange={handleChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEmpresa} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" /> Salvando...
              </>
            ) : (
              <>
                <FaSave /> {empresa ? "Atualizar" : "Cadastrar"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Navbar />
    </div>
  )
}

export default GerenciarEmpresa

