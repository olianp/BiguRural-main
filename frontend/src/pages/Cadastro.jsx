import React from "react";
import "../styles/Cadastro.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"

function Cadastro() {
  const navigate = useNavigate()

  const [nome, setNome] = useState("")
  const [matricula, setMatricula] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [erro, setErro] = useState("")

  async function cadastrar() {
    if (nome === "" || matricula === "" || email === "" || senha === "" || confirmarSenha === "") {
      setErro("Preencha todos os campos")
      return
    }

    if (!email.endsWith("@ufrpe.br")) {
      setErro("Use seu e-mail institucional @ufrpe.br")
      return
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem")
      return
    }

    setErro("")
    
    try {
      // Faz a requisição para o backend
      const response = await axios.post('http://192.168.1.13:3000/api/auth/cadastro', {
        nome,
        matricula,
        email,
        senha
      });

      // Exibe a mensagem de sucesso e redireciona para a tela de Login
      alert(response.data.message);
      navigate("/");
    } catch (error) {
      // Captura os erros retornados pelo backend (como "Matrícula já existe")
      if (error.response) {
        setErro(error.response.data.error);
      } else {
        setErro("Erro ao conectar com o servidor. O backend está rodando?");
      }
    }
  }

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <img 
          src="/logo.png" 
          alt="Logo Bigu Rural" 
          style={{ width: '100px', margin: '0 auto 10px auto', display: 'block', borderRadius: '50%' }} 
        />
        <h1 className="cadastro-logo">Bigu Rural</h1>
        <h2>Cadastro</h2>

        <input className="cadastro-input" type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
        <input className="cadastro-input" type="text" placeholder="Matrícula" value={matricula} onChange={(e) => setMatricula(e.target.value)} />
        <input className="cadastro-input" type="email" placeholder="E-mail institucional" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="cadastro-input" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
        <input className="cadastro-input" type="password" placeholder="Confirmar senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />

        <p className="erro-texto">{erro}</p>

        <button className="cadastro-button" onClick={cadastrar}>
          Cadastrar
        </button>

        <p className="cadastro-link" onClick={() => navigate("/")}>
          Voltar para Login
        </p>
      </div>
    </div>
  )
}

export default Cadastro