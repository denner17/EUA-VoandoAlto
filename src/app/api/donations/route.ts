import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Força a rota a ser dinâmica, evitando o cache de dados.
export const dynamic = 'force-dynamic';

// Esta função vai lidar com as requisições GET para /api/donations
export async function GET() {
  // 🔐 Adicionamos uma verificação de segurança para a chave da API
  if (!process.env.MP_ACCESS_TOKEN) {
    console.error("MP_ACCESS_TOKEN não foi definida.");
    return NextResponse.json(
      { error: "Erro de configuração no servidor." },
      { status: 500 }
    );
  }

  // Inicializa o Mercado Pago com a sua chave secreta
  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
  });

  try {
    const payment = new Payment(client);

    // 🔎 Busca os pagamentos aprovados da campanha
    const searchResult = await payment.search({
      sort: 'date_created',
      criteria: 'desc',
      limit: 100, // Limite de pagamentos a buscar por vez
      filters: {
        status: 'approved',
        external_reference: 'denner-eua-2025', // Referência da sua campanha
      },
    });

    // 💰 Soma o valor de todas as doações encontradas
    const totalAmount = searchResult.results?.reduce((sum, p) => sum + (p.transaction_amount || 0), 0) || 0;

    return NextResponse.json({ total: totalAmount });
  } catch (error) {
    console.error('Ejrro ao buscar doações no Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar o total de doações.' },
      { status: 500 }
    );
  }
}
