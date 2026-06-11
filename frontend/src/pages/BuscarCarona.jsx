import "../styles/BuscarCarona.css"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import Header from "../components/Header"

function BuscarCarona() {

  const navigate = useNavigate()

  const [caronas, setCaronas] = useState([])
  const [buscaOrigem, setBuscaOrigem] = useState("")
  const [buscaDestino, setBuscaDestino] = useState("")
  const [buscaData, setBuscaData] = useState("")
  const [buscaHorario, setBuscaHorario] = useState("")

  useEffect(() => {
    // Busca as caronas reais salvas no SQLite via Backend
    async function carregarCaronas() {
      try {
        const response = await axios.get('http://192.168.1.13:3000/api/caronas')
        setCaronas(response.data)
      } catch (error) {
        console.error("Erro ao buscar caronas:", error)
      }
    }
    carregarCaronas()
  }, [])

  // Filtra a lista de acordo com o que o usuário digita
  const caronasFiltradas = caronas.filter(carona => {
    const matchOrigem = carona.origem ? carona.origem.toLowerCase().includes(buscaOrigem.toLowerCase()) : true;
    const matchDestino = carona.destino ? carona.destino.toLowerCase().includes(buscaDestino.toLowerCase()) : true;
    const matchData = buscaData ? carona.data === buscaData : true;
    
    // Arquivamento automático no Frontend: não exibir caronas do passado
    let isFuturo = true;
    if (carona.data) {
      const agora = new Date();
      // Trata a string da data + hora para criar o objeto Date da viagem
      const dataHoraCarona = new Date(`${carona.data}T${carona.horario || '00:00'}:00`);
      if (dataHoraCarona < agora) {
        isFuturo = false;
      }
    }

    return matchOrigem && matchDestino && matchData && isFuturo;
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div className="buscar-container" style={{ flex: 1 }}>

      <h1 className="buscar-title">
        Buscar Carona
      </h1>

      <div className="buscar-filtros">

        <input
          className="buscar-input"
          type="text"
          placeholder="Origem"
          value={buscaOrigem}
          onChange={(e) => setBuscaOrigem(e.target.value)}
        />

        <input
          className="buscar-input"
          type="text"
          placeholder="Destino"
          value={buscaDestino}
          onChange={(e) => setBuscaDestino(e.target.value)}
        />

        <input
          className="buscar-input"
          type={buscaData ? "date" : "text"}
          placeholder="Data (dd/mm/aaaa)"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => !buscaData && (e.target.type = 'text')}
          value={buscaData}
          onChange={(e) => setBuscaData(e.target.value)}
        />

        <input
          className="buscar-input"
          type={buscaHorario ? "time" : "text"}
          placeholder="Horário (--:--)"
          onFocus={(e) => e.target.type = 'time'}
          onBlur={(e) => !buscaHorario && (e.target.type = 'text')}
          value={buscaHorario}
          onChange={(e) => setBuscaHorario(e.target.value)}
        />

      </div>

      {caronasFiltradas.length === 0 ? <p style={{textAlign: 'center', marginTop: '30px', color: '#555', fontSize: '18px'}}>Nenhuma carona encontrada.</p> : caronasFiltradas.map((carona) => (

        <div
          className="carona-card"
          key={carona.id}
        >

          <h3>
            {carona.origem} → {carona.destino}
          </h3>

          <div className="carona-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(carona.motorista_nome)}&background=27ae60&color=fff&size=32&bold=true`} 
              alt={`Avatar de ${carona.motorista_nome}`} 
              style={{ borderRadius: '50%', width: '32px', height: '32px' }}
            />
            <span>
              Motorista: <strong>{carona.motorista_nome}</strong>
            </span>
          </div>

          <p className="carona-info">
            📅 {carona.data ? new Date(carona.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "Data não informada"} - 🕒 {carona.horario}
          </p>

          <p className="carona-info">
            💺 Vagas: {carona.vagas}
          </p>

          <p className="carona-info">
            💰 Valor sugerido: A combinar
          </p>

          {/* Botão de integração nativa e rápida com o Google Maps */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(carona.origem)}&destination=${encodeURIComponent(carona.destino)}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', margin: '15px 0', color: '#27ae60', textDecoration: 'none', fontWeight: 'bold' }}
          >
            🗺️ Ver Rota no Google Maps
          </a>

          <button
            className="carona-button"
            onClick={() => navigate(`/detalhes-carona/${carona.id}`)}
          >
            Ver detalhes
          </button>

        </div>

      ))}
      </div>

    </div>
  )
}

export default BuscarCarona