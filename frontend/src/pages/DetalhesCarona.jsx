import "../styles/DetalhesCarona.css"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Header from "../components/Header"

function DetalhesCarona() {
  const { id } = useParams() // Pega o ID da carona da URL
  const navigate = useNavigate()
  const [carona, setCarona] = useState(null)
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [minhasReservas, setMinhasReservas] = useState([])

  useEffect(() => {
    // Pega os dados do usuário logado para verificações
    const userStorage = localStorage.getItem("usuario");
    if (userStorage) {
      const user = JSON.parse(userStorage);
      setUsuarioLogado(user);

      // Busca as reservas atuais do usuário para saber se ele já solicitou essa carona
      axios.get(`http://192.168.1.13:3000/api/reservas/minhas/${user.id}`)
        .then(res => setMinhasReservas(res.data))
        .catch(err => console.error(err));
    }

    // Se não tiver ID, não faz nada
    if (!id) return;

    async function carregarDetalhes() {
      try {
        const response = await axios.get(`http://192.168.1.13:3000/api/caronas/${id}`)
        setCarona(response.data)
      } catch (error) {
        console.error("Erro ao buscar detalhes da carona:", error)
        alert("Ops! Carona não encontrada.")
        navigate("/buscar-carona") // Volta para a busca se der erro
      }
    }
    carregarDetalhes()
  }, [id, navigate])

  async function solicitarCarona() {
    if (!usuarioLogado) {
      alert("Você precisa estar logado para solicitar uma carona.");
      navigate("/");
      return;
    }

    // Convertendo para String para evitar falsos negativos por diferença de tipo (número vs texto)
    if (String(usuarioLogado.id) === String(carona.motorista_id)) {
      alert("Você não pode solicitar uma vaga na sua própria carona.");
      return;
    }

    if (carona.vagas <= 0) {
      alert("Esta carona não tem mais vagas disponíveis.");
      return;
    }

    try {
      // Chama a rota do backend para diminuir 1 vaga
      const response = await axios.patch(`http://192.168.1.13:3000/api/caronas/${id}/reservar`, {
        passageiro_id: usuarioLogado.id
      });
      
      // Atualiza o estado local para refletir a mudança imediatamente na tela
      setCarona(response.data);

      alert("Vaga reservada com sucesso! Combine os detalhes com o motorista.");
    } catch (error) {
      // Exibe o erro vindo do backend (ex: "Esgotado!")
      const mensagemErro = error.response ? error.response.data.error : "Ocorreu um erro ao tentar reservar a vaga.";
      alert(`Erro: ${mensagemErro}`);
      console.error("Erro ao reservar vaga:", error);
    }
  }

  // Mostra uma mensagem de "carregando" enquanto busca os dados
  if (!carona) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '20px' }}>Carregando detalhes...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div className="detalhes-container" style={{ flex: 1 }}>
        <div className="detalhes-card">
          <h1 className="detalhes-title">
            Detalhes da Carona
          </h1>

          <h2 className="detalhes-rota">
            {carona.origem} → {carona.destino}
          </h2>

          <p className="detalhes-info">
            👤 Motorista: {carona.motorista_nome}
          </p>

          <p className="detalhes-info">
             {carona.data ? new Date(carona.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "Data não informada"} - 🕒 {carona.horario}
          </p>

          <p className="detalhes-info">
            💺 Vagas disponíveis: {carona.vagas}
          </p>

          <p className="detalhes-info">
            💰 Valor sugerido: A combinar
          </p>

          {usuarioLogado && String(usuarioLogado.id) === String(carona.motorista_id) ? (
            <button className="detalhes-button" style={{ backgroundColor: '#95a5a6', cursor: 'not-allowed' }}>
              🚗 Esta é a sua carona
            </button>
          ) : minhasReservas.some(r => String(r.carona_id) === String(carona.id)) ? (
            <button className="detalhes-button" style={{ backgroundColor: '#95a5a6', cursor: 'not-allowed' }}>
              ✅ Você já solicitou esta vaga
            </button>
          ) : (
            <button 
              className="detalhes-button" 
              onClick={solicitarCarona} 
              style={{ backgroundColor: carona.vagas <= 0 ? '#95a5a6' : 'green', cursor: carona.vagas <= 0 ? 'not-allowed' : 'pointer' }}
            >
              {carona.vagas > 0 ? 'Solicitar Carona' : 'Vagas Esgotadas'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetalhesCarona