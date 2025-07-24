// Caminho do arquivo: src/app/api/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { init } from 'next/dist/compiled/webpack/webpack';

// Passo 1: Inicializar o Mercado Pago com a sua chave secreta
// O process.env.MP_ACCESS_TOKEN pega o valor que você colocou no arquivo .env.local
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN! 
});

// Esta função vai lidar com as requisições POST para /api/checkout
export async function POST(request: NextRequest) {
  try {
    // Passo 2: Extrair os dados do corpo da requisição
    // Esperamos receber o valor e a descrição da doação
    const body = await request.json();
    const { amount, description } = body;

    // Validação simples para garantir que temos um valor
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'O valor da doação é inválido.' }, { status: 400 });
    }

    // Passo 3: Criar o objeto da "Preferência de Pagamento"
    // Este objeto descreve a transação para o Mercado Pago
    const preference = await new Preference(client).create({
      body: {
        // Itens que estão sendo "comprados" (no nosso caso, uma doação)
        items: [
          {
            id: 'doacao-atleta-123', // Um ID único para o item
            title: description || 'Doação para a campanha do atleta',
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL', // Moeda: Real Brasileiro
          },
        ],
        // URLs para onde o usuário será redirecionado após o pagamento
        back_urls: {
          success: 'http://localhost:3000/sucesso', // URL de sucesso (vamos criar esta página)
          failure: 'http://localhost:3000/falha',   // URL de falha
          pending: 'http://localhost:3000/pendente', // URL para pagamentos pendentes (ex: boleto)
        },
        // Notifica nosso sistema automaticamente quando o pagamento for aprovado
        // (Funcionalidade avançada, podemos implementar depois)
        // notification_url: 'https://seusite.com/api/notifications',
      },
    });

    // Passo 4: Retornar o ID da preferência para o frontend
    // O frontend usará este ID para renderizar o formulário de pagamento
    return NextResponse.json({ id: preference.id, init_point: preference.init_point }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar preferência no Mercado Pago:', error);
    // Retorna uma mensagem de erro genérica para o frontend
    return NextResponse.json(
      { error: 'Falha ao comunicar com o Mercado Pago.' },
      { status: 500 }
    );
  }
}