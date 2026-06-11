import { useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"
import "../styles/Paginas.css"
import Header from "../components/Header"

export default function CadastroVeiculo() {
  const navigate = useNavigate()

  const [modelo, setModelo] = useState("")
  const [placa, setPlaca] = useState("")
  const [cor, setCor] = useState("")
  const [vagas, setVagas] = useState("")

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

  async function salvarVeiculo() {
    if (modelo === "" || placa === "" || cor === "" || vagas === "") {
      alert("Por favor, preencha todos os campos do veículo.")
      return
    }

    if (!usuarioLogado) return;

    try {
      await axios.post("http://192.168.1.13:3000/api/veiculos", {
        motorista_id: usuarioLogado.id,
        modelo,
        placa,
        cor,
        vagas
      });
      alert("🚙 Veículo cadastrado com sucesso!")
      navigate("/home")
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar veículo.");
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Header />

      <div className="pagina-card">

        <h1>🚙 Cadastro de Veículo</h1>

        <p>
          Cadastre os dados do veículo que será utilizado nas caronas.
        </p>

        <div className="avaliacao-box">

          <input
            className="input-veiculo"
            type="text"
            placeholder="Modelo do veículo (ex: Fiat Uno)"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
          />

          <br /><br />

          <input
            className="input-veiculo"
            type="text"
            placeholder="Placa do veículo (ex: ABC-1234)"
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
          />

          <br /><br />

          <input
            className="input-veiculo"
            type="text"
            placeholder="Cor do veículo"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
          />

          <br /><br />

          <input
            className="input-veiculo"
            type="number"
            placeholder="Quantidade de vagas"
            value={vagas}
            onChange={(e) => setVagas(e.target.value)}
          />

          <br /><br />

          <button className="btn-enviar-avaliacao" onClick={salvarVeiculo}>
            💾 Salvar Veículo
          </button>

        </div>

      </div>

    </div>
  )
}