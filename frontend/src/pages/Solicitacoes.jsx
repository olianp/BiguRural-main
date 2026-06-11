import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Paginas.css"
import Header from "../components/Header"

export default function Solicitacoes() {
  const navigate = useNavigate()

  const [perfilAberto, setPerfilAberto] = useState(null);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const userStorage = localStorage.getItem("usuario");
    if (userStorage) {
      const userLogado = JSON.parse(userStorage);
      // Busca no backend as solicitações REAIS feitas nas caronas deste motorista
      axios.get(`http://192.168.1.13:3000/api/solicitacoes/pendentes/${userLogado.id}`)
        .then(response => {
          setSolicitacoes(response.data);
          setCarregando(false);
        })
        .catch(error => {
          console.error("Erro ao buscar solicitações:", error);
          setCarregando(false);
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  function aceitarSolicitacao(reservaId, nome) {
    // Como a vaga já é debitada na hora da solicitação, aqui apenas removemos o card visualmente
    setSolicitacoes(solicitacoes.filter(s => s.reserva_id !== reservaId));
    alert(`✅ Solicitação de ${nome} confirmada com sucesso!`);
  }

  async function recusarSolicitacao(reservaId, nome) {
    const confirmar = window.confirm(`Deseja realmente recusar o pedido de ${nome}? A vaga será devolvida.`);
    if (!confirmar) return;

    try {
      // Deleta a reserva do banco e devolve a vaga usando a rota existente
      await axios.delete(`http://192.168.1.13:3000/api/reservas/${reservaId}`);
      setSolicitacoes(solicitacoes.filter(s => s.reserva_id !== reservaId));
      alert(`❌ Solicitação de ${nome} recusada. A vaga voltou a ficar disponível.`);
    } catch (error) {
      console.error("Erro ao recusar solicitação:", error);
      alert("Erro ao recusar a solicitação.");
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header />

      <div className="pagina-card" style={{ flex: 1, maxWidth: '600px', margin: '20px auto', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '24px', lineHeight: '1.4' }}>✅ Solicitações Pendentes</h1>

        <p style={{ textAlign: 'center', color: '#555', marginBottom: '20px' }}>Analise os pedidos de estudantes interessados na sua carona.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {carregando ? (
            <p style={{ textAlign: 'center', color: '#999' }}>Buscando solicitações reais...</p>
          ) : solicitacoes.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>Não há novas solicitações no momento.</p>
          ) : (
            solicitacoes.map((solicitacao) => (
              <div key={solicitacao.reserva_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '18px' }}>{solicitacao.nome}</strong>
                  <span style={{ color: '#555' }}>Solicitou vaga para: <br/><strong>{solicitacao.origem} → {solicitacao.destino}</strong></span>
                  <span style={{ display: 'block', fontSize: '12px', color: '#888', marginTop: '4px' }}>Vagas restantes no carro: {solicitacao.vagas}</span>
                  <button 
                    onClick={() => setPerfilAberto(solicitacao)} 
                    style={{ display: 'block', marginTop: '10px', padding: '5px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    👤 Ver Perfil
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => aceitarSolicitacao(solicitacao.reserva_id, solicitacao.nome)} style={{ backgroundColor: '#27ae60', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>✔️ Aceitar</button>
                  <button onClick={() => recusarSolicitacao(solicitacao.reserva_id, solicitacao.nome)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>❌ Recusar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Perfil do Passageiro */}
      {perfilAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <img src={`https://ui-avatars.com/api/?name=${perfilAberto.nome}&background=27ae60&color=fff&size=100`} alt="Avatar" style={{ borderRadius: '50%', marginBottom: '15px' }} />
            <h2 style={{ marginBottom: '10px', color: '#333' }}>{perfilAberto.nome}</h2>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '8px' }}><strong>🎓 Matrícula:</strong> {perfilAberto.curso}</p>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '8px' }}><strong>⭐ Reputação:</strong> 5.0 / 5.0</p>
            <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}><strong>🚗 Status:</strong> Verificado ✅</p>
            <button 
              onClick={() => setPerfilAberto(null)} 
              style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', width: '100%' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}