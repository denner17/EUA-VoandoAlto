import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './page';

// Import Jest globals for TypeScript
import type { Mock } from 'jest-mock';

// Mocking fetch since the component uses it for donations and checkout
global.fetch = jest.fn();

beforeEach(() => {
  (fetch as Mock).mockImplementation((...args: unknown[]) => {
    const url = args[0] as string;
    if (url === '/api/donations') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ total: 1500 }), // Mocked initial raised amount
      });
    }
    if (url === '/api/checkout') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ init_point: 'http://mercadopago.com/test' }),
      });
    }
    return Promise.reject(new Error(`Unhandled fetch request to ${url}`));
  });
});

test('Selecionar valor de doação atualiza o botão', () => {
  render(<HomePage />);
  const button100 = screen.getByText('R$ 100');
  fireEvent.click(button100);
  // O botão de R$ 100 deve ficar selecionado (classe de destaque)
  expect(button100.className).toMatch(/bg-blue-600/);
});

test('Alterar valor customizado atualiza o input e o valor selecionado', () => {
  render(<HomePage />);
  const input = screen.getByPlaceholderText('Outro valor') as HTMLInputElement;
  fireEvent.change(input, { target: { value: '123' } });
  expect(input.value).toBe('123');
  // O botão "Doar Agora" deve estar habilitado
  const donateButton = screen.getByText('Doar Agora');
  expect(donateButton).not.toBeDisabled();
});

test('Botão "Doar Agora" fica desabilitado para valor zero', () => {
  render(<HomePage />);
  const input = screen.getByPlaceholderText('Outro valor') as HTMLInputElement;
  fireEvent.change(input, { target: { value: '0' } });
  const donateButton = screen.getByText('Doar Agora');
  expect(donateButton).toBeDisabled();
});

test('Simula um fluxo de doação completo na página inicial', async () => {
  // 1. Renderiza a página
  render(<HomePage />);

  // 2. Verifica se o valor inicial foi carregado (o mock retorna 1500)
  // Usamos findByText para esperar o carregamento assíncrono do valor
  const raisedAmountText = await screen.findByText(/Arrecadado: R\$ 1\.500,00/i);
  expect(raisedAmountText).toBeInTheDocument();

  // 3. Simula a seleção de um valor de doação
  const button50 = screen.getByText('R$ 50');
  fireEvent.click(button50);
  expect(button50.className).toMatch(/bg-blue-600/);

  // 4. Clica no botão para doar
  const donateButton = screen.getByText('Doar Agora');
  expect(donateButton).not.toBeDisabled();
  fireEvent.click(donateButton);

  // 5. Verifica se o modal de checkout é aberto e o link de pagamento é gerado
  // O mock da API de checkout retorna 'http://mercadopago.com/test'
  const paymentLink = await screen.findByText(/Ir para Pagamento Seguro/i);
  expect(paymentLink).toBeInTheDocument();
  expect(paymentLink).toHaveAttribute('href', 'http://mercadopago.com/test');
});

