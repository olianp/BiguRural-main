import React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import axios from 'axios';
import Login from '../pages/Login';

vi.mock('axios');

function renderizarLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe('Frontend - Tela de Login', () => {
  test('deve exibir campos de e-mail, senha e botão Entrar', () => {
    renderizarLogin();

    expect(screen.getByPlaceholderText(/e-mail institucional/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('deve bloquear tentativa de login sem preencher os campos', () => {
    renderizarLogin();

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText(/preencha e-mail e senha/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('deve bloquear e-mail que não seja institucional da UFRPE', () => {
    renderizarLogin();

    fireEvent.change(screen.getByPlaceholderText(/e-mail institucional/i), {
      target: { value: 'usuario@gmail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: '123456' }
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByText(/use seu e-mail institucional @ufrpe.br/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('deve chamar a API de login quando os dados são válidos', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        user: { id: 1, nome: 'Mariene', email: 'mariene@ufrpe.br' }
      }
    });

    renderizarLogin();

    fireEvent.change(screen.getByPlaceholderText(/e-mail institucional/i), {
      target: { value: 'mariene@ufrpe.br' }
    });
    fireEvent.change(screen.getByPlaceholderText(/senha/i), {
      target: { value: '123456' }
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://192.168.1.13:3000/api/auth/login', {
        email: 'mariene@ufrpe.br',
        senha: '123456'
      });
    });

    expect(localStorage.getItem('usuario')).toContain('mariene@ufrpe.br');
  });
});
