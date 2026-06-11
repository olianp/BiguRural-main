import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css"; // Usa os mesmos estilos do login

function EsqueciSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function solicitarRecuperacao() {
    if (email === "") {
      setErro("Preencha o e-mail.");
      return;
    }
    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      const response = await axios.post("http://192.168.1.13:3000/api/auth/esqueci-senha", { email });
      setMensagem(response.data.message);
      setEmail("");

      // Mágica para a apresentação: redireciona automaticamente com o token real!
      if (response.data.token) {
        setTimeout(() => {
          navigate(`/redefinir-senha/${response.data.token}`);
        }, 1500);
      }
    } catch (error) {
      setErro(error.response ? error.response.data.error : "Erro ao conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-logo" style={{ marginBottom: "20px" }}>Bigu Rural</h1>
        <h2>Recuperar Senha</h2>
        <p style={{ color: "#555", fontSize: "14px", marginBottom: "15px" }}>
          Digite seu e-mail institucional para receber um link de redefinição de senha.
        </p>

        <input 
          className="login-input" 
          type="email" 
          placeholder="E-mail institucional" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && solicitarRecuperacao()}
        />

        <p className="erro-texto">{erro}</p>
        <p style={{ color: "green", fontWeight: "bold", fontSize: "14px", minHeight: "20px", margin: "0 0 10px 0" }}>{mensagem}</p>

        <button 
          className="login-button" 
          onClick={solicitarRecuperacao} 
          disabled={carregando}
          style={{ opacity: carregando ? 0.7 : 1, cursor: carregando ? 'not-allowed' : 'pointer' }}
        >
          {carregando ? "Enviando..." : "Enviar Link"}
        </button>
        <p className="login-link" onClick={() => navigate("/")}>Voltar para o Login</p>
      </div>
    </div>
  );
}

export default EsqueciSenha;