import { NextResponse } from 'next/server';

export async function GET() {
  // Rota desativada, pois o contador de doações foi removido da interface.
  // Retornando uma resposta vazia para evitar erros caso seja chamada.
  return NextResponse.json({});
}
