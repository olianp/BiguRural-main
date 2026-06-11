import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Paginas.css"
import Header from "../components/Header"

export default function Notificacoes() {
  const navigate = useNavigate()

  const [notificacoes, setNotificacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/")
      return
    }

    async function buscarNotificacoes() {
      try {
        const notifs = [];

        // 1. Busca solicitações pendentes (Avisos para o Motorista)
        const resSolicitacoes = await axios.get(`http://192.168.1.13:3000/api/solicitacoes/pendentes/${usuarioLogado.id}`);
        if (resSolicitacoes.data && resSolicitacoes.data.length > 0) {
          resSolicitacoes.data.forEach(sol => {
            notifs.push({
              id: `sol-${sol.reserva_id}`,
              icone: "✅",
              titulo: "Nova Solicitação de Carona",
              texto: `${sol.nome} solicitou uma vaga para ${sol.origem} → ${sol.destino}. Clique para avaliar.`,
              link: "/solicitacoes",
              cor: "#e8f8f5",
              borda: "#27ae60"
            });
          });
        }

        // 2. Busca viagens agendadas (Avisos para o Passageiro)
        const resViagens = await axios.get(`http://192.168.1.13:3000/api/reservas/minhas/${usuarioLogado.id}`);
        if (resViagens.data && resViagens.data.length > 0) {
          resViagens.data.forEach(reserva => {
            notifs.push({
              id: `viagem-${reserva.reserva_id}`,
              icone: "🚗",
              titulo: "Lembrete de Viagem",
              texto: `Sua vaga na carona de ${reserva.origem} para ${reserva.destino} está reservada com ${reserva.motorista_nome}.`,
              link: `/chat/${reserva.carona_id}`,
              cor: "#ebf5fb",
              borda: "#2980b9"
            });
          });

          // 3. Adiciona uma notificação de "Mensagem do Chat" dinamicamente na primeira viagem ativa
          const primeiraViagem = resViagens.data[0];
          notifs.push({
            id: `msg-${primeiraViagem.reserva_id}`,
            icone: "💬",
            titulo: "Nova Mensagem",
            texto: `Você tem mensagens não lidas no chat da carona para ${primeiraViagem.destino}.`,
            link: `/chat/${primeiraViagem.carona_id}`,
            cor: "#fef9e7",
            borda: "#f1c40f"
          });
        }

        setNotificacoes(notifs);
        setCarregando(false);

      } catch (error) {
        console.error("Erro ao carregar notificações", error);
        setCarregando(false);
      }
    }

    buscarNotificacoes();
  }, [navigate, usuarioLogado?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header />

      <div className="pagina-card" style={{ flex: 1, maxWidth: '600px', margin: '20px auto', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '26px' }}>🔔 Notificações</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {carregando ? (
            <p style={{ textAlign: 'center', color: '#999' }}>Buscando novidades...</p>
          ) : notificacoes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '18px', padding: '30px 0' }}>Você não tem novas notificações no momento. 📭</p>
          ) : (
            notificacoes.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => navigate(notif.link)}
                style={{ cursor: 'pointer', padding: '15px', backgroundColor: notif.cor, borderLeft: `6px solid ${notif.borda}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: '0.2s' }}
              >
                <div style={{ fontSize: '32px' }}>{notif.icone}</div>
                <div style={{ textAlign: 'left' }}>
                  <strong style={{ display: 'block', fontSize: '18px', color: '#333', marginBottom: '4px' }}>{notif.titulo}</strong>
                  <span style={{ color: '#555', fontSize: '15px' }}>{notif.texto}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}