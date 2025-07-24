// Caminho: src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Adicione sua Chave de Acesso do Mercado Pago no arquivo .env.local
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN! 
});

export async function POST(req: NextRequest) {
  try {
    const { amount, description } = await req.json();

    // Validação básica
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'doacao-denner-eua', // Um ID para o item
            title: description,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL',
          },
        ],
        // Adiciona uma referência única para filtrar apenas as doações desta campanha
        external_reference: 'denner-eua-2025', 
        
        // Redireciona o usuário de volta para página
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/falha`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/falha`,
        },
        auto_return: 'approved', // Retorna automaticamente para a página de sucesso
      },
    });

    // Retorna a preferência completa, incluindo o link de checkout (init_point)
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro ao criar preferência no Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Falha ao iniciar o processo de pagamento.' },
      { status: 500 }
    );
  }
}


