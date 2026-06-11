import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import OferecerCarona from '../pages/OferecerCarona';

// Mock do Axios para interceptarmos as chamadas de rede sem depender do Backend ligado
vi.mock('axios');

// Mock do React Router para testar os redirecionamentos (navigate)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Testes do Componente OferecerCarona', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn(); // Mock do alert para verificar as mensagens
    // Simular usuário logado na memória do navegador
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({ id: 1, nome: "Motorista Teste" }));
  });

  it('Cenário 1: [Sucesso] Deve publicar uma carona com sucesso quando todos os dados estiverem corretos', async () => {
    // Prepara o cenário: o backend retorna 1 veículo existente para este motorista
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, modelo: "Fiat Uno", placa: "ABC-1234", vagas: 3 }]
    });
    // Prepara a simulação de que o post da carona deu certo
    axios.post.mockResolvedValueOnce({ data: { message: "Sucesso" } });

    const { container } = render(
      <MemoryRouter>
        <OferecerCarona />
      </MemoryRouter>
    );

    // Aguarda o React buscar o veículo no axios e colocar na tela
    await waitFor(() => {
      expect(screen.getByText('🚗 Fiat Uno (ABC-1234)')).toBeInTheDocument();
    });

    // Evidência de Preenchimento: Usuário digita as informações nos campos
    fireEvent.change(screen.getByPlaceholderText('Origem'), { target: { value: 'Recife' } });
    fireEvent.change(screen.getByPlaceholderText('Destino'), { target: { value: 'UFRPE' } });
    fireEvent.change(screen.getByPlaceholderText('Data (dd/mm/aaaa)'), { target: { value: '2026-10-10' } });
    fireEvent.change(screen.getByPlaceholderText('Horário (--:--)'), { target: { value: '08:00' } });
    fireEvent.change(screen.getByPlaceholderText('Vagas disponíveis'), { target: { value: '3' } });

    // Ação: Clicar no botão
    fireEvent.click(screen.getByText('Publicar Carona'));

    // Evidência de Sucesso: Verifica se a API foi chamada com os dados exatos preenchidos
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://192.168.1.13:3000/api/oferecer', {
        motorista_id: 1,
        origem: 'Recife',
        destino: 'UFRPE',
        data: '2026-10-10',
        horario: '08:00',
        vagas: 3
      });
      expect(window.alert).toHaveBeenCalledWith("Carona publicada com sucesso! 🚗");
      expect(mockNavigate).toHaveBeenCalledWith("/buscar-carona");
    });
  });

  it('Cenário 2: [Falha] Deve exibir alerta de erro e bloquear API ao tentar publicar com campos obrigatórios vazios', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ id: 1, modelo: "Gol", placa: "XYZ-9876", vagas: 4 }]
    });
    render(<MemoryRouter><OferecerCarona /></MemoryRouter>);

    // Aguarda carregar para não dar aviso de act(...)
    await waitFor(() => {
      expect(screen.getByText('🚗 Gol (XYZ-9876)')).toBeInTheDocument();
    });

    // Ação imediata: Clica em Publicar sem preencher a origem, destino, etc.
    fireEvent.click(screen.getByText('Publicar Carona'));

    // Evidência da Falha Trada: A requisição ao backend NUNCA deve ser feita
    expect(axios.post).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith("Por favor, preencha origem, destino, data, horário e vagas disponíveis.");
  });

  it('Cenário 3: [Falha] Deve bloquear a publicação e redirecionar se o usuário não possuir nenhum veículo cadastrado', async () => {
    // Prepara o cenário de falha na regra de negócio: banco retorna array vazio de veículos
    axios.get.mockResolvedValueOnce({ data: [] });

    const { container } = render(<MemoryRouter><OferecerCarona /></MemoryRouter>);

    // Como os campos originais de verificação vêm antes do veículo no código, 
    // a regra de falta de veículo pode ser testada preenchendo os dados primeiro.
    fireEvent.change(screen.getByPlaceholderText('Origem'), { target: { value: 'Recife' } });
    fireEvent.change(screen.getByPlaceholderText('Destino'), { target: { value: 'UFRPE' } });
    fireEvent.change(screen.getByPlaceholderText('Data (dd/mm/aaaa)'), { target: { value: '2026-10-10' } });
    fireEvent.change(screen.getByPlaceholderText('Horário (--:--)'), { target: { value: '08:00' } });
    fireEvent.change(screen.getByPlaceholderText('Vagas disponíveis'), { target: { value: '2' } });

    fireEvent.click(screen.getByText('Publicar Carona'));

    // Evidência da Trava de Negócio: Impede API e navega para o cadastro de veículo
    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Você precisa cadastrar um veículo antes de oferecer carona.");
      expect(mockNavigate).toHaveBeenCalledWith("/cadastro-veiculo");
    });
  });
});