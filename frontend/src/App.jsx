import { Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Cadastro from "./pages/Cadastro"
import Home from "./pages/Home"
import BuscarCarona from "./pages/BuscarCarona"
import OferecerCarona from "./pages/OferecerCarona"
import Perfil from "./pages/Perfil"
import Historico from "./pages/Historico"
import DetalhesCarona from "./pages/DetalhesCarona"
import Chat from "./pages/Chat"
import Notificacoes from "./pages/Notificacoes"
import Solicitacoes from "./pages/Solicitacoes"
import CadastroVeiculo from "./pages/CadastroVeiculo"
import Avaliacoes from "./pages/Avaliacoes"
import Denuncia from "./pages/Denuncia"
import Admin from "./pages/Admin"
import EsqueciSenha from "./pages/EsqueciSenha"
import RedefinirSenha from "./pages/RedefinirSenha"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/home" element={<Home />} />

      <Route path="/buscar-carona" element={<BuscarCarona />} />
      <Route path="/oferecer-carona" element={<OferecerCarona />} />
      <Route path="/detalhes-carona/:id" element={<DetalhesCarona />} />

      <Route path="/historico" element={<Historico />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/chat/:id" element={<Chat />} />
      <Route path="/notificacoes" element={<Notificacoes />} />
      <Route path="/solicitacoes" element={<Solicitacoes />} />
      <Route path="/cadastro-veiculo" element={<CadastroVeiculo />} />
      <Route path="/avaliacoes" element={<Avaliacoes />} />
      <Route path="/avaliacoes/:id" element={<Avaliacoes />} />
      <Route path="/denuncia" element={<Denuncia />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/esqueci-senha" element={<EsqueciSenha />} />
      <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
    </Routes>
  )
}

export default App