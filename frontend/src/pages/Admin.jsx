import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Paginas.css"
import Header from "../components/Header"

export default function Admin() {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Busca as denúncias reais
    axios.get("http://192.168.1.13:3000/api/admin/denuncias")
      .then(res => {
        setDenuncias(res.data);
        setCarregando(false);
      })
      .catch(err => {
        console.error(err);
        setCarregando(false);
      });
  }, []);

  async function banirUsuario(denunciadoId, nome) {
    const confirmar = window.confirm(`ATENÇÃO: Deseja realmente BANIR o usuário ${nome} da plataforma? Esta ação é irreversível e excluirá o usuário e suas caronas oferecidas.`);
    if (!confirmar) return;

    try {
      await axios.delete(`http://192.168.1.13:3000/api/admin/banir/${denunciadoId}`);
      alert(`🚫 O usuário ${nome} foi banido com sucesso!`);
      // Remove todas as denúncias desse usuário da tela, pois ele não existe mais
      setDenuncias(denuncias.filter(d => d.denunciado_id !== denunciadoId));
    } catch (error) {
      alert("Erro ao banir usuário.");
    }
  }

  async function ignorarDenuncia(id) {
    const confirmar = window.confirm("Deseja arquivar/ignorar esta denúncia?");
    if (!confirmar) return;

    try {
      await axios.delete(`http://192.168.1.13:3000/api/admin/denuncias/${id}`);
      setDenuncias(denuncias.filter(d => d.id !== id));
    } catch (error) {
      alert("Erro ao arquivar denúncia.");
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header title="Bigu Rural - Admin" />

      <div className="pagina-card" style={{ flex: 1, maxWidth: '800px', margin: '20px auto', padding: '30px', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '28px', color: '#c0392b' }}>🚨 Central de Denúncias</h1>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: '30px' }}>Analise os relatos e tome as devidas providências para manter a plataforma segura.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {carregando ? (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '18px' }}>Carregando denúncias...</p>
          ) : denuncias.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#e8f8f5', borderRadius: '10px', border: '1px solid #d1f2eb' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🎉</span>
              <p style={{ fontSize: '18px', color: '#117864', fontWeight: 'bold' }}>Excelente! Nenhuma denúncia pendente no momento.</p>
            </div>
          ) : (
            denuncias.map((denuncia) => (
              <div key={denuncia.id} style={{ border: '1px solid #e74c3c', padding: '20px', borderRadius: '10px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#7f8c8d', display: 'block' }}>Denunciado:</strong>
                    <span style={{ fontSize: '20px', color: '#c0392b', fontWeight: 'bold' }}>{denuncia.denunciado}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '14px', color: '#7f8c8d', display: 'block' }}>Data:</strong>
                    <span style={{ fontSize: '14px', color: '#333' }}>{new Date(denuncia.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '14px', color: '#7f8c8d', display: 'block' }}>Motivo Oficial:</strong>
                  <span style={{ fontSize: '18px', color: '#333', fontWeight: 'bold' }}>{denuncia.motivo}</span>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #e74c3c' }}>
                  <strong style={{ fontSize: '14px', color: '#7f8c8d', display: 'block', marginBottom: '5px' }}>Relato do Denunciante ({denuncia.denunciante}):</strong>
                  <span style={{ fontSize: '16px', color: '#444', fontStyle: 'italic' }}>"{denuncia.texto}"</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => banirUsuario(denuncia.denunciado_id, denuncia.denunciado)} style={{ flex: 1, backgroundColor: '#c0392b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                    🚫 Banir Usuário
                  </button>
                  <button onClick={() => ignorarDenuncia(denuncia.id)} style={{ flex: 1, backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                    ❌ Ignorar / Arquivar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}