import React from "react"
import "../styles/OferecerCarona.css"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import Header from "../components/Header"

function OferecerCarona() {
  const navigate = useNavigate()

  const [origem, setOrigem] = useState("")
  const [destino, setDestino] = useState("")
  const [data, setData] = useState("")
  const [horario, setHorario] = useState("")
  const [vagas, setVagas] = useState("")
  const [veiculos, setVeiculos] = useState([])
  const [veiculoId, setVeiculoId] = useState("")

  useEffect(() => {
    const userStorage = localStorage.getItem("usuario");
    if (userStorage) {
      const userLogado = JSON.parse(userStorage);
      axios.get(`http://192.168.1.13:3000/api/veiculos/meus/${userLogado.id}`)
        .then(res => {
          setVeiculos(res.data);
          if (res.data.length > 0) {
            setVeiculoId(res.data[0].id); // Seleciona o primeiro veículo por padrão
            setVagas(res.data[0].vagas);  // Preenche a quantidade de vagas baseada no veículo
          }
        })
        .catch(err => console.error(err));
    }
  }, []);

  function handleVeiculoChange(e) {
    const selectedId = e.target.value;
    setVeiculoId(selectedId);
    const selectedVeiculo = veiculos.find(v => String(v.id) === String(selectedId));
    if (selectedVeiculo) {
      setVagas(selectedVeiculo.vagas);
    }
  }

  async function publicarCarona() {
    if (!origem || !destino || !data || !horario || !vagas) {
      alert("Por favor, preencha origem, destino, data, horário e vagas disponíveis.")
      return
    }

    const userStorage = localStorage.getItem("usuario")
    if (!userStorage) {
      alert("Você precisa estar logado para oferecer uma carona.")
      navigate("/")
      return
    }

    if (veiculos.length === 0) {
      alert("Você precisa cadastrar um veículo antes de oferecer carona.");
      navigate("/cadastro-veiculo");
      return;
    }

    const usuarioLogado = JSON.parse(userStorage)

    try {
      await axios.post('http://192.168.1.13:3000/api/oferecer', {
        motorista_id: usuarioLogado.id,
        origem,
        destino,
        data,
        horario,
        vagas
      })
      alert("Carona publicada com sucesso! 🚗")
      navigate("/buscar-carona") // Redireciona para a lista para você ver a carona criada
    } catch (error) {
      alert("Erro ao publicar carona. Verifique o console.")
      console.error(error)
    }
  }

  return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <div className="oferecer-container" style={{ flex: 1 }}>

      <div className="oferecer-card">

        <h1 className="oferecer-title">
          Oferecer Carona
        </h1>

        <input
          className="oferecer-input"
          type="text"
          placeholder="Origem"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
        />

        <input
          className="oferecer-input"
          type="text"
          placeholder="Destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />

        <input
          className="oferecer-input"
          type={data ? "date" : "text"}
          placeholder="Data (dd/mm/aaaa)"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => !data && (e.target.type = 'text')}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <input
          className="oferecer-input"
          type={horario ? "time" : "text"}
          placeholder="Horário (--:--)"
          onFocus={(e) => e.target.type = 'time'}
          onBlur={(e) => !horario && (e.target.type = 'text')}
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
        />

        {veiculos.length === 0 ? (
          <input className="oferecer-input" type="text" placeholder="Nenhum veículo cadastrado" disabled />
        ) : (
          <select 
            className="oferecer-input" 
            value={veiculoId} 
            onChange={handleVeiculoChange}
          >
            {veiculos.map(v => (
              <option key={v.id} value={v.id}>🚗 {v.modelo} ({v.placa})</option>
            ))}
          </select>
        )}

        <input
          className="oferecer-input"
          type="number"
          placeholder="Vagas disponíveis"
          value={vagas}
          onChange={(e) => setVagas(e.target.value)}
        />

        <input
          className="oferecer-input"
          type="text"
          placeholder="Valor sugerido"
        />

        <button className="oferecer-button" onClick={publicarCarona}>
          Publicar Carona
        </button>

      </div>
      </div>

    </div>
  )
}

export default OferecerCarona