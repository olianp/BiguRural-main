import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
    <div style={{ backgroundColor: 'green', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: '24px', width: '100%', boxSizing: 'border-box' }}>
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
          <button onClick={() => navigate(-1)} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', fontSize: '18px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Voltar">
            🔙
          </button>
        )}
        {!isHome && (
          <button onClick={() => navigate("/home")} style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', fontSize: '18px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Início">
            🏠
          </button>
        )}
        <button onClick={fazerLogoff} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#e74c3c', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
          Sair
        </button>
      </div>
    </div>
  );
}

export default Header;