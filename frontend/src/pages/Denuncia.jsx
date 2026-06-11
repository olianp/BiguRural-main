import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Paginas.css"
import Header from "../components/Header"

export default function Denuncia() {
  const navigate = useNavigate()
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const [motivos, setMotivos] = useState([])
  const [motoristas, setMotoristas] = useState([])

  const [motivoId, setMotivoId] = useState("")
  const [motoristaId, setMotoristaId] = useState("")
  const [descricao, setDescricao] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (user) {
      setUsuarioLogado(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    if (!usuarioLogado) return;

    // Busca os motivos de denúncia reais do banco
    axios.get("http://192.168.1.13:3000/api/denuncias/motivos")
      .then(res => setMotivos(res.data))
      .catch(err => console.error(err));

    // Busca apenas os motoristas com quem o usuário logado viajou
    axios.get(`http://192.168.1.13:3000/api/denuncias/motoristas/${usuarioLogado.id}`)
      .then(res => setMotoristas(res.data))
      .catch(err => console.error(err));
  }, [usuarioLogado?.id]);

  async function enviarDenuncia() {
    if (!motoristaId || !motivoId || descricao.trim() === "") {
      alert("Por favor, selecione o motorista, o motivo e descreva o ocorrido detalhadamente.")
      return
    }
    
    try {
      await axios.post("http://192.168.1.13:3000/api/denuncias", {
        denunciante_id: usuarioLogado.id,
        denunciado_id: motoristaId,
        motivo_id: motivoId,
        texto: descricao
      });
      alert("🚨 Denúncia registrada e arquivada com sucesso! Nossa equipe analisará o caso.")
      navigate("/home")
    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro ao enviar a denúncia. Tente novamente.");
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header />

      <div className="pagina-card">

        <h1>🚨 Denúncia</h1>

        <p>
          Relate problemas ou comportamentos inadequados durante uma viagem.
        </p>

        <div className="avaliacao-box">

          <h3>Selecione o Motorista</h3>
          <select className="input-veiculo" value={motoristaId} onChange={(e) => setMotoristaId(e.target.value)}>
            <option value="">Selecione o motorista a ser denunciado</option>
            {motoristas.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
          {motoristas.length === 0 && <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '10px', marginBottom: '15px' }}>Você ainda não realizou viagens para ter motoristas disponíveis aqui.</p>}

          <h3>Motivo da denúncia</h3>

          <select className="input-veiculo" value={motivoId} onChange={(e) => setMotivoId(e.target.value)}>
            <option value="">Selecione o motivo oficial</option>
            {motivos.map(m => (
              <option key={m.id} value={m.id}>{m.descricao}</option>
            ))}
          </select>

          <br />
          <br />

          <textarea
            className="input-textarea"
            placeholder="Descreva o ocorrido..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          />

        <button className="btn-enviar-avaliacao" onClick={enviarDenuncia}>
            🚨 Enviar Denúncia
          </button>

        </div>

      </div>

    </div>
  )
}