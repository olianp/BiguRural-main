import "../styles/Historico.css"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import Header from "../components/Header"

function Historico() {

  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [minhasCaronas, setMinhasCaronas] = useState([])
  const [minhasReservas, setMinhasReservas] = useState([])

  useEffect(() => {
    const userStorage = localStorage.getItem("usuario")
    if (userStorage) {
      const userLogado = JSON.parse(userStorage)
      setUsuario(userLogado)
      carregarHistorico(userLogado.id)
    } else {
      navigate("/")
    }
  }, [navigate])

  async function carregarHistorico(userId) {
    try {
      const response = await axios.get('http://192.168.1.13:3000/api/caronas')
      const todasCaronas = response.data
      // Filtra para exibir apenas as caronas onde você é o motorista
      const caronasDoUsuario = todasCaronas.filter(carona => carona.motorista_id === userId)
      setMinhasCaronas(caronasDoUsuario)

      // Busca também as caronas onde você é passageiro
      const responseReservas = await axios.get(`http://192.168.1.13:3000/api/reservas/minhas/${userId}`)
      
      const reservasCompletas = responseReservas.data.map(reserva => {
        const caronaVinculada = todasCaronas.find(c => String(c.id) === String(reserva.carona_id))
        return {
          ...reserva,
          origem: reserva.origem || (caronaVinculada ? caronaVinculada.origem : "Desconhecida"),
          destino: reserva.destino || (caronaVinculada ? caronaVinculada.destino : "Desconhecida"),
          motorista_nome: reserva.motorista_nome || (caronaVinculada ? caronaVinculada.motorista_nome : "Motorista"),
          motorista_id: reserva.motorista_id || (caronaVinculada ? caronaVinculada.motorista_id : null),
          horario: reserva.horario || (caronaVinculada ? caronaVinculada.horario : "Sem horário"),
          data: reserva.data || (caronaVinculada ? caronaVinculada.data : null)
        }
      })
      setMinhasReservas(reservasCompletas)
    } catch (error) {
      console.error("Erro ao buscar histórico:", error)
    }
  }

  async function excluirCarona(caronaId) {
    const confirmar = window.confirm("Tem certeza que deseja excluir esta carona? Esta ação não pode ser desfeita.");
    if (!confirmar) return;

    try {
      // Chama a rota do backend para deletar a carona
      await axios.delete(`http://192.168.1.13:3000/api/caronas/${caronaId}`);
      // Atualiza a lista na tela removendo a carona excluída instantaneamente
      setMinhasCaronas(minhasCaronas.filter(carona => carona.id !== caronaId));
      alert("Carona excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir carona:", error);
      alert("Erro ao excluir a carona. Verifique se o servidor está rodando.");
    }
  }

  async function finalizarCarona(caronaId) {
    const confirmar = window.confirm("Deseja finalizar esta carona? O cálculo de CO2 economizado será gerado!");
    if (!confirmar) return;

    try {
      // Chama a rota do backend que finaliza a carona e traz a mensagem de CO2
      const response = await axios.patch(`http://192.168.1.13:3000/api/caronas/${caronaId}/finalizar`);
      setMinhasCaronas(minhasCaronas.filter(carona => carona.id !== caronaId));
      alert(response.data.message);
    } catch (error) {
      console.error("Erro ao finalizar carona:", error);
      alert("Erro ao finalizar a carona. Verifique o servidor.");
    }
  }

  async function cancelarReserva(reservaId) {
    const confirmar = window.confirm("Tem certeza que deseja cancelar sua reserva nesta carona?");
    if (!confirmar) return;

    try {
      // Chama a rota do backend para deletar a reserva
      await axios.delete(`http://192.168.1.13:3000/api/reservas/${reservaId}`);
      // Atualiza a lista removendo a reserva da tela instantaneamente
      setMinhasReservas(minhasReservas.filter(reserva => reserva.reserva_id !== reservaId));
      alert("Reserva cancelada com sucesso!");
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
      alert("Erro ao cancelar a reserva. Verifique se o servidor está rodando.");
    }
  }

  function avaliarMotorista(motoristaId, motoristaNome) {
    // Navega para a tela de avaliação levando o nome do motorista na memória
    navigate(`/avaliacoes/${motoristaId}`, { state: { nome: motoristaNome } });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div className="historico-container" style={{ flex: 1 }}>

      <h1 className="historico-title">
        Histórico de Viagens
      </h1>

      <h2 style={{ color: '#555', marginBottom: '15px' }}>🚗 Caronas que Ofereci</h2>

      {minhasCaronas.length === 0 ? (
        <p style={{textAlign: 'center', color: '#555', fontSize: '18px'}}>Você ainda não publicou nenhuma carona.</p>
      ) : (
        minhasCaronas.map((carona) => (

          <div
            className="historico-card"
            key={carona.id}
          >

            <h2 className="historico-rota">
              {carona.origem} → {carona.destino}
            </h2>

            <p className="historico-info">
              📅 {carona.data ? new Date(carona.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "Data não informada"} - 🕒 {carona.horario}
            </p>

            <p className="historico-info">
              💺 Vagas restantes: {carona.vagas}
            </p>

            <span className="historico-status">
              Publicada
            </span>

            <button 
              onClick={() => navigate(`/chat/${carona.id}`)}
              style={{ display: 'block', marginTop: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              title="Abrir chat da viagem"
            >
              💬 Abrir Chat
            </button>

            <button 
              onClick={() => finalizarCarona(carona.id)}
              style={{ display: 'block', marginTop: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              title="Finalizar viagem"
            >
              🏁 Finalizar Viagem
            </button>

            <button 
              onClick={() => excluirCarona(carona.id)}
              style={{ display: 'block', marginTop: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              title="Excluir esta carona"
            >
              🗑️ Excluir Carona
            </button>

          </div>

        ))
      )}

      <h2 style={{ color: '#555', marginTop: '40px', marginBottom: '15px' }}>🎒 Caronas que Solicitei</h2>
      
      {minhasReservas.length === 0 ? (
        <p style={{textAlign: 'center', color: '#555', fontSize: '18px'}}>Você ainda não solicitou nenhuma carona.</p>
      ) : (
        minhasReservas.map((reserva, index) => (
          <div className="historico-card" key={`reserva-${index}`}>
            <h2 className="historico-rota">{reserva.origem} → {reserva.destino}</h2>
            <p className="historico-info">👤 Motorista: {reserva.motorista_nome}</p>
            <p className="historico-info">📅 {reserva.data ? new Date(reserva.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "Data não informada"} - 🕒 {reserva.horario}</p>
            <span className="historico-status" style={{ background: '#d4e6f1', color: '#2980b9' }}>
              Vaga Reservada
            </span>

            <button 
              onClick={() => navigate(`/chat/${reserva.carona_id}`)}
              style={{ display: 'block', marginTop: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              title="Abrir chat da viagem"
            >
              💬 Abrir Chat
            </button>

            <button 
              onClick={() => cancelarReserva(reserva.reserva_id)}
              style={{ display: 'block', marginTop: '15px', backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              title="Cancelar esta reserva"
            >
              ❌ Cancelar Reserva
            </button>

            <button 
              onClick={() => avaliarMotorista(reserva.motorista_id, reserva.motorista_nome)}
              style={{ display: 'block', marginTop: '10px', backgroundColor: '#f1c40f', color: '#333', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              title="Avaliar motorista"
            >
              ⭐ Avaliar Motorista
            </button>
          </div>
        ))
      )}
      </div>

    </div>
  )
}

export default Historico