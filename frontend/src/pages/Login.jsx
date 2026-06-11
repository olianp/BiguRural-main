import React from "react";
import "../styles/Login.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  async function entrar() {
    if (email === "" || senha === "") {
      setErro("Preencha e-mail e senha")
      return
    }

    if (!email.endsWith("@ufrpe.br")) {
      setErro("Use seu e-mail institucional @ufrpe.br")
      return
    }

    setErro("")
    
    try {
      // Faz a requisição de login para o backend
      const response = await axios.post('http://192.168.1.13:3000/api/auth/login', {
        email,
        senha
      });

      // Salva os dados do usuário logado no navegador
      localStorage.setItem("usuario", JSON.stringify(response.data.user));

      // Se a senha estiver correta e a conta verificada, vai para a Home
      navigate("/home");
    } catch (error) {
      // Exibe os bloqueios do backend (Senha incorreta, conta não verificada, etc)
      if (error.response) {
        setErro(error.response.data.error);
      } else {
        setErro("Erro ao conectar com o servidor. O backend está rodando?");
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img 
          src="/logo.png" 
          alt="Logo Bigu Rural" 
          style={{ width: '100px', margin: '0 auto 10px auto', display: 'block', borderRadius: '50%' }} 
        />
        <h1 className="login-logo">Bigu Rural</h1>
        <h2>Login</h2>

        <input
          className="login-input"
          type="email"
          placeholder="E-mail institucional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="login-input"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <p className="erro-texto">{erro}</p>

        <button className="login-button" onClick={entrar}>
          Entrar
        </button>

        <p className="login-link" onClick={() => navigate("/esqueci-senha")} style={{ marginBottom: '10px' }}>
          Esqueci minha senha
        </p>

        <p className="login-link" onClick={() => navigate("/cadastro")}>
          Não tem conta? Cadastre-se
        </p>
      </div>
    </div>
  )
}

export default Login