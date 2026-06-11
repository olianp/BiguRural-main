import { useNavigate, useParams, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Paginas.css"
import Header from "../components/Header"

export default function Avaliacoes() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()
  
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState("")
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))
  const nomeMotorista = state?.nome || "Motorista"

  useEffect(() => {
    // Se não tem ID na URL, significa que ele acessou pela Home
    // Vamos buscar as avaliações que ele RECEBEU nas suas caronas
    if (!id && usuarioLogado) {
      axios.get(`http://192.168.1.13:3000/api/avaliacoes/minhas/${usuarioLogado.id}`)
        .then(res => {
          setMinhasAvaliacoes(res.data)
          setCarregando(false)
        })
        .catch(err => {
          console.error(err)
          setCarregando(false)
        })
    }
  }, [id, usuarioLogado])

  async function enviarAvaliacao() {
    if (nota === 0) {
      alert("Por favor, selecione uma nota clicando nas estrelas.")
      return
    }

    try {
      await axios.post('http://192.168.1.13:3000/api/avaliacoes/nova', {
        motorista_id: id,
        passageiro_id: usuarioLogado.id,
        nota: nota,
        comentario: comentario
      })
      alert("Avaliação enviada com sucesso! Muito obrigado.")
      navigate("/historico")
    } catch (error) {
      console.error(error)
      alert("Erro ao enviar avaliação.")
    }
  }

  // 1️⃣ Renderização caso tenha vindo pela HOME (Para Visualizar Comentários Recebidos)
  if (!id) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
        <Header />
        <div className="pagina-card">
          <h1>⭐ Minhas Avaliações</h1>
          <p>Veja o que os passageiros dizem sobre as suas viagens.</p>
          
          {carregando ? (
            <p style={{marginTop: '20px', color: '#777'}}>Buscando avaliações...</p>
          ) : minhasAvaliacoes.length === 0 ? (
             <p style={{marginTop: '20px', color: '#777'}}>Você ainda não recebeu nenhuma avaliação.</p>
          ) : (
            minhasAvaliacoes.map((av, index) => (
              <div key={index} className="motorista-card" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                  <h2 style={{fontSize: '18px'}}>{av.passageiro_nome}</h2>
                  <div className="nota-media" style={{fontSize: '20px'}}>{"⭐".repeat(av.nota)}</div>
                </div>
                {av.comentario && <p style={{fontStyle: 'italic', fontSize: '16px', margin: 0, color: '#333'}}>"{av.comentario}"</p>}
                <span style={{fontSize: '12px', color: '#999'}}>{new Date(av.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  // 2️⃣ Renderização caso tenha vindo pelo HISTÓRICO (Para Avaliar um Motorista)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header />

      <div className="pagina-card">

        <h1>⭐ Avaliar Motorista</h1>
        <p>Avalie sua experiência após a viagem com o motorista abaixo.</p>

        <div className="motorista-card" style={{justifyContent: 'center'}}>
          <div style={{textAlign: 'center'}}>
            <h2>{nomeMotorista}</h2>
            <span style={{color: '#7f8c8d', fontSize: '14px'}}>Viagem realizada</span>
          </div>
        </div>

        <div className="avaliacao-box">

          <h3 style={{marginBottom: '10px'}}>Sua avaliação (Clique nas estrelas)</h3>

          <div className="estrelas" style={{cursor: 'pointer', display: 'flex', gap: '10px', justifyContent: 'center'}}>
            {[1, 2, 3, 4, 5].map(num => (
              <span 
                key={num} 
                onClick={() => setNota(num)}
                style={{ 
                  color: num <= nota ? '#f1c40f' : '#ccc', 
                  fontSize: '40px',
                  transition: '0.2s' 
                }}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="input-textarea"
            style={{marginTop: '20px'}}
            placeholder="Escreva um comentário sobre a viagem (Opcional)..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />

          <button className="btn-enviar-avaliacao" onClick={enviarAvaliacao} style={{width: '100%'}}>
            📩 Enviar Avaliação
          </button>

        </div>

      </div>

    </div>
  )
}