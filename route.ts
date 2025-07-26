
// Adicione sua Chave de Acesso do Mercado Pago no arquivo .env.local
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { amount, description } = await req.json();

    // Validação básica
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valor da doação é inválido." },
        { status: 400 }
      );
    }

    const payment = new Payment(client);

    const body = {
      transaction_amount: amount,
      description: description,
      payment_method_id: "pix",
      payer: {
        // É necessário um e-mail, podemos usar um genérico para doações
        email: `doador-${Date.now()}@example.com`, // Adicionado um domínio válido
      },
    };

    const pixPayment = await payment.create({ body });

    if (!pixPayment.point_of_interaction?.transaction_data) {
      throw new Error("Dados do PIX não foram gerados corretamente.");
    }

    // Extrair os dados do PIX
    const { qr_code_base64, qr_code } =
      pixPayment.point_of_interaction.transaction_data;

    return NextResponse.json({
      qrCodeImage: `data:image/jpeg;base64,${qr_code_base64}`,
      qrCodeCopyPaste: qr_code,
      paymentId: pixPayment.id, // Opcional: para verificar o status do pagamento depois
    });
  } catch (error) {
    console.error("Erro ao gerar PIX:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json(
      { error: "Falha ao gerar o pagamento PIX.", details: errorMessage },
      { status: 500 }
    );
  }
}