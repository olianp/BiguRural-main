import React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import axios from 'axios';
import OferecerCarona from '../pages/OferecerCarona';

vi.mock('axios');
vi.spyOn(window, 'alert').mockImplementation(() => {});

function renderizarOferecerCarona() {
  return render(
    <MemoryRouter>
      <OferecerCarona />
    </MemoryRouter>
  );
}

describe('Frontend - Tela de Oferecer Carona', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('deve exibir campos da carona e botão de publicar', () => {
    renderizarOferecerCarona();

    expect(screen.getByPlaceholderText(/origem/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/destino/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/vagas disponíveis/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publicar carona/i })).toBeInTheDocument();
  });

  test('deve avisar quando campos obrigatórios não foram preenchidos', () => {
    renderizarOferecerCarona();

    fireEvent.click(screen.getByRole('button', { name: /publicar carona/i }));

    expect(window.alert).toHaveBeenCalledWith('Por favor, preencha origem, destino, data, horário e vagas disponíveis.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('deve exigir usuário logado para publicar carona', () => {
    renderizarOferecerCarona();

    fireEvent.change(screen.getByPlaceholderText(/origem/i), { target: { value: 'Recife' } });
    fireEvent.change(screen.getByPlaceholderText(/destino/i), { target: { value: 'UFRPE' } });
    const dateInput = screen.getByPlaceholderText('Data (dd/mm/aaaa)');
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });
    const timeInput = screen.getByPlaceholderText('Horário (--:--)');

    fireEvent.change(timeInput, { target: { value: '07:00' } });
    fireEvent.change(screen.getByPlaceholderText(/vagas disponíveis/i), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /publicar carona/i }));

    expect(window.alert).toHaveBeenCalledWith('Você precisa estar logado para oferecer uma carona.');
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('deve chamar a API para publicar carona quando há usuário logado', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, modelo: "Fiat", placa: "ABC", vagas: 3 }] });
    axios.post.mockResolvedValueOnce({ data: { id: 1 } });
    localStorage.setItem('usuario', JSON.stringify({ id: 10, nome: 'Motorista' }));

    renderizarOferecerCarona();

    await waitFor(() => {
      expect(screen.getByText(/Fiat/i)).toBeInTheDocument();
    });

    const dateInput = screen.getByPlaceholderText('Data (dd/mm/aaaa)');
    const timeInput = screen.getByPlaceholderText('Horário (--:--)');

    fireEvent.change(screen.getByPlaceholderText(/origem/i), { target: { value: 'Recife' } });
    fireEvent.change(screen.getByPlaceholderText(/destino/i), { target: { value: 'UFRPE' } });
    fireEvent.change(dateInput, { target: { value: '2026-10-10' } });
    fireEvent.change(timeInput, { target: { value: '07:00' } });
    fireEvent.click(screen.getByRole('button', { name: /publicar carona/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://192.168.1.13:3000/api/oferecer', {
        motorista_id: 10,
        origem: 'Recife',
        destino: 'UFRPE',
        data: '2026-10-10',
        horario: '07:00',
        vagas: 3
      });
    });
  });
});
