import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home, LogOut } from "lucide-react";

function Header({ title = "Bigu Rural" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica de forma segura se a URL atual contém "home" (ignorando maiúsculas/minúsculas)
  const isHome = location.pathname.toLowerCase().includes("/home");

  function fazerLogoff() {
    localStorage.removeItem("usuario");
    navigate("/");
  }

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: 'green', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '24px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img 
          src="/logo.png" 
          alt="Logo" 
          style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'white', padding: '2px', objectFit: 'contain' }} 
        />
        <span>{title}</span>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {!isHome && (
          <button onClick={() => navigate(-1)} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', fontSize: '18px', backgroundColor: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Voltar">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        )}
        {!isHome && (
          <button onClick={() => navigate("/home")} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', fontSize: '18px', backgroundColor: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Início">
            <Home size={20} strokeWidth={2.5} />
          </button>
        )}
        <button onClick={fazerLogoff} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#e74c3c', color: 'white', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LogOut size={18} strokeWidth={2.5} /> Sair
        </button>
      </div>
    </div>
  );
}

export default Header;