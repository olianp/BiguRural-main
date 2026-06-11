import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function RedefinirSenha() {
  const navigate = useNavigate();
  const { token } = useParams(); // Pega o token da URL enviado no e-mail
  
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");

  async function salvarSenha() {
    if (novaSenha === "" || confirmarSenha === "") {
      setErro("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setErro("");

    try {
      // Envia a nova senha e o token de validação para o banco de dados
      const response = await axios.post("http://192.168.1.13:3000/api/auth/redefinir-senha", { token, novaSenha });
      alert(response.data.message);
      navigate("/"); // Redireciona de volta ao login
    } catch (error) {
      setErro(error.response ? error.response.data.error : "Erro ao conectar ao servidor.");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-logo" style={{ marginBottom: "20px" }}>Bigu Rural</h1>
        <h2>Criar Nova Senha</h2>

        <input className="login-input" type="password" placeholder="Nova Senha" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
        <input className="login-input" type="password" placeholder="Confirmar Nova Senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />

        {erro && <p className="erro-texto">{erro}</p>}

        <button className="login-button" onClick={salvarSenha}>Salvar Senha</button>
      </div>
    </div>
  );
}

export default RedefinirSenha;