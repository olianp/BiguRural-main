import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import "../styles/Paginas.css"
import Header from "../components/Header"

// Conecta ao servidor WebSocket do Backend
const socket = io("http://192.168.1.13:3000")

export default function Chat() {
  const navigate = useNavigate()
  const { id } = useParams() // Captura o ID da carona diretamente da URL

  const [mensagemAtual, setMensagemAtual] = useState("")
  const [historico, setHistorico] = useState([])
  
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))
  const caronaId = id // O ID agora é dinâmico baseado na URL!

  useEffect(() => {
    if (!usuarioLogado) {
      alert("Você precisa estar logado para acessar o chat.")
      navigate("/")
      return
    }

    // 1. Entra na sala do Socket exclusiva para esta carona
    socket.emit("entrar_sala", caronaId)

    // 2. Busca as mensagens que já estão salvas no banco
    async function carregarHistorico() {
      try {
        const response = await axios.get(`http://192.168.1.13:3000/api/mensagens/${caronaId}`)
        setHistorico(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Erro ao buscar histórico de mensagens:", error)
      }
    }
    carregarHistorico()

    // 3. Fica "escutando" se chega mensagem nova
    socket.on("receber_mensagem", (novaMensagem) => {
      setHistorico((mensagensAnteriores) => [...mensagensAnteriores, novaMensagem])
    })

    return () => socket.off("receber_mensagem")
  }, [caronaId, navigate])

  const enviarMensagem = async () => {
    if (mensagemAtual.trim() !== "") {
      const dadosMensagem = {
        carona_id: caronaId,
        remetente_id: usuarioLogado.id,
        remetente_nome: usuarioLogado.nome,
        texto: mensagemAtual,
      }

      await socket.emit("enviar_mensagem", dadosMensagem)
      setHistorico((prev) => [...prev, dadosMensagem])
      setMensagemAtual("")
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header />

      <div className="pagina-card" style={{ display: 'flex', flexDirection: 'column', height: '70vh' }}>
        <h1 style={{ marginBottom: '20px' }}>💬 Chat da Carona</h1>

        {/* Área de Mensagens */}
        <div style={{ flex: 1, backgroundColor: '#f4faf4', borderRadius: '12px', padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', border: '1px solid #ddd' }}>
          {!historico || historico.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', margin: 'auto' }}>
              Nenhuma mensagem ainda. Dê um 'Oi' para combinar os detalhes! 👋
            </p>
          ) : (
            historico.map((msg, index) => {
              const ehMinha = msg.remetente_id === usuarioLogado?.id
              return (
                <div key={index} style={{
                  alignSelf: ehMinha ? 'flex-end' : 'flex-start',
                  backgroundColor: ehMinha ? '#dcf8c6' : '#fff',
                  padding: '10px 15px',
                  borderRadius: '15px',
                  maxWidth: '75%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '4px', fontWeight: 'bold' }}>
                    {ehMinha ? "Você" : msg.remetente_nome}
                  </span>
                  <span style={{ fontSize: '16px', color: '#333' }}>{msg.texto}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Input de Digitação */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={mensagemAtual}
            onChange={(e) => setMensagemAtual(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
            placeholder="Digite sua mensagem..."
            className="input-veiculo"
            style={{ flex: 1, margin: 0 }}
          />
          <button
            onClick={enviarMensagem}
            className="btn-aceitar"
          >
            Enviar
          </button>
        </div>
      </div>

    </div>
  )
}