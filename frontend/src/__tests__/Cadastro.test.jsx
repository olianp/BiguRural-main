import React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import axios from 'axios';
import Cadastro from '../pages/Cadastro';

vi.mock('axios');
vi.spyOn(window, 'alert').mockImplementation(() => {});

function renderizarCadastro() {
  return render(
    <MemoryRouter>
      <Cadastro />
    </MemoryRouter>
  );
}

describe('Frontend - Tela de Cadastro', () => {
  test('deve exibir os campos principais do formulário', () => {
    renderizarCadastro();

    expect(screen.getByPlaceholderText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/matrícula/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e-mail institucional/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirmar senha/i)).toBeInTheDocument();
  });

  test('deve bloquear cadastro com campos vazios', () => {
    renderizarCadastro();

    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    expect(screen.getByText(/preencha todos os campos/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('deve bloquear e-mail pessoal no cadastro', () => {
    renderizarCadastro();

    fireEvent.change(screen.getByPlaceholderText(/nome completo/i), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByPlaceholderText(/matrícula/i), { target: { value: '20260001' } });
    fireEvent.change(screen.getByPlaceholderText(/e-mail institucional/i), { target: { value: 'teste@gmail.com' } });
    fireEvent.change(screen.getByPlaceholderText(/^senha$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText(/confirmar senha/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    expect(screen.getByText(/use seu e-mail institucional @ufrpe.br/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('deve bloquear cadastro quando as senhas não conferem', () => {
    renderizarCadastro();

    fireEvent.change(screen.getByPlaceholderText(/nome completo/i), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByPlaceholderText(/matrícula/i), { target: { value: '20260001' } });
    fireEvent.change(screen.getByPlaceholderText(/e-mail institucional/i), { target: { value: 'teste@ufrpe.br' } });
    fireEvent.change(screen.getByPlaceholderText(/^senha$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText(/confirmar senha/i), { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    expect(screen.getByText(/as senhas não conferem/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('deve chamar a API de cadastro com dados válidos', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Usuário criado!' } });

    renderizarCadastro();

    fireEvent.change(screen.getByPlaceholderText(/nome completo/i), { target: { value: 'Mariene Santos' } });
    fireEvent.change(screen.getByPlaceholderText(/matrícula/i), { target: { value: '20260002' } });
    fireEvent.change(screen.getByPlaceholderText(/e-mail institucional/i), { target: { value: 'mariene@ufrpe.br' } });
    fireEvent.change(screen.getByPlaceholderText(/^senha$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText(/confirmar senha/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /cadastrar/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://192.168.1.13:3000/api/auth/cadastro', {
        nome: 'Mariene Santos',
        matricula: '20260002',
        email: 'mariene@ufrpe.br',
        senha: '123456'
      });
    });
  });
});
