import "../styles/Home.css"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import Header from "../components/Header"
import { Search, Car, MapPin, User, Bell, CheckCircle, CarFront, Star, AlertTriangle } from "lucide-react"

function Home() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [isMotorista, setIsMotorista] = useState(false)

  useEffect(() => {
    const userStorage = localStorage.getItem("usuario")

    if (userStorage) {
      const userParsed = JSON.parse(userStorage)
      setUsuario(userParsed)

      // Verifica no backend se o usuário ofereceu alguma carona (se é motorista)
      axios.get('http://192.168.1.13:3000/api/caronas')
        .then(response => {
          const ofereceuCarona = response.data.some(c => c.motorista_id === userParsed.id)
          setIsMotorista(ofereceuCarona)
        })
        .catch(err => console.error("Erro ao verificar caronas do motorista:", err))
    }
  }, [])

  return (
    <div className="home-container">
      <Header />

      <div className="home-content">
        <h1>Olá, {usuario ? usuario.nome : "seja bem-vindo(a)"}!</h1>
        <p>O que você deseja fazer hoje?</p>

        <div className="home-grid">
          <div className="home-card" onClick={() => navigate("/buscar-carona")}>
            <Search size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
            Buscar Carona
          </div>

          <div className="home-card" onClick={() => navigate("/oferecer-carona")}>
            <Car size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
            Oferecer Carona
          </div>

          <div className="home-card" onClick={() => navigate("/historico")}>
            <MapPin size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
            Histórico
          </div>

          <div className="home-card" onClick={() => navigate("/perfil")}>
            <User size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
            Perfil
          </div>

          <div className="home-card" onClick={() => navigate("/notificacoes")}>
            <Bell size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
            Notificações
          </div>

      {/* O botão só aparece se o usuário for motorista (tiver caronas oferecidas) */}
      {isMotorista && (
        <div className="home-card" onClick={() => navigate("/solicitacoes")}>
          <CheckCircle size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
          Solicitações
        </div>
      )}

          <div className="home-card" onClick={() => navigate("/cadastro-veiculo")}>
            <CarFront size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
            Cadastrar Veículo
          </div>

          <div className="home-card" onClick={() => navigate("/avaliacoes")}>
            <Star size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
            Avaliações
          </div>

          <div className="home-card" onClick={() => navigate("/denuncia")}>
            <AlertTriangle size={48} strokeWidth={1.5} style={{ marginBottom: '10px' }} />
            Denúncia
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home