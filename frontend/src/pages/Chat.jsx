import { useNavigate, useParams } from "react-router-dom"
import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { io } from "socket.io-client"
import "../styles/Paginas.css"
import Header from "../components/Header"

// Conecta ao servidor WebSocket do Backend
const socket = io("http://192.168.1.13:3000")

function converterDataLocal(dataString) {
  if (!dataString) return new Date();
  // Se a data vier do SQLite (ex: "2024-05-20 15:30:00"), trocamos espaço por 'T' e adicionamos 'Z' (UTC)
  if (typeof dataString === 'string' && !dataString.includes('T')) {
    return new Date(dataString.replace(' ', 'T') + 'Z');
  }
  return new Date(dataString);
}

function formatarDataChat(dataString) {
  const data = converterDataLocal(dataString);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (data.toDateString() === hoje.toDateString()) {
    return "Hoje";
  } else if (data.toDateString() === ontem.toDateString()) {
    return "Ontem";
  } else {
    return data.toLocaleDateString('pt-BR');
  }
}

export default function Chat() {
  const navigate = useNavigate()
  const { id } = useParams() // Captura o ID da carona diretamente da URL

  const [mensagemAtual, setMensagemAtual] = useState("")
  const [historico, setHistorico] = useState([])
  
  const fimDoChatRef = useRef(null)
  
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
      
      // Toca o som de notificação para nova mensagem recebida
      const audio = new Audio("/notificacao.mp3")
      audio.play().catch(err => console.log("Áudio bloqueado pelo navegador:", err))
    })

    return () => socket.off("receber_mensagem")
  }, [caronaId, navigate])

  // Rola para baixo sempre que o histórico de mensagens for atualizado
  useEffect(() => {
    if (fimDoChatRef.current) {
      fimDoChatRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [historico])

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

              // Verifica se deve exibir o divisor de data comparando com a mensagem anterior
              let mostrarData = false;
              if (index === 0) {
                mostrarData = true;
              } else {
                const dataAtual = converterDataLocal(msg.created_at).toDateString();
                const dataAnterior = converterDataLocal(historico[index - 1].created_at).toDateString();
                if (dataAtual !== dataAnterior) {
                  mostrarData = true;
                }
              }

              return (
                <React.Fragment key={index}>
                  {mostrarData && (
                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                      <span style={{ backgroundColor: '#e2e8f0', color: '#555', padding: '4px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: 'bold' }}>
                        {formatarDataChat(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div style={{
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
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ fontSize: '16px', color: '#333', wordBreak: 'break-word' }}>{msg.texto}</span>
                    <span style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap', marginBottom: '-2px' }}>
                      {converterDataLocal(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                </React.Fragment>
              )
            })
          )}
          {/* Elemento invisível para forçar a rolagem até o final */}
          <div ref={fimDoChatRef} />
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