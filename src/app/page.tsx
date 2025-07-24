"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// --- Ícones (Componentes SVG) ---
const HeartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// --- Componente do Modal de Checkout (Versão Simplificada) ---
interface CheckoutModalProps {
  amount: number;
  onClose: () => void;
}

const CheckoutModal = ({ amount, onClose }: CheckoutModalProps) => {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Este hook é executado assim que o modal é aberto
  useEffect(() => {
    // Função para criar a preferência de pagamento e obter o link
    const createPreference = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // A chamada para a nossa API continua a mesma
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amount,
            description: `Doação de R$${amount} para a campanha`,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao criar a preferência de pagamento.");
        }

        const data = await response.json();

        // Em vez de um ID, agora esperamos um link de pagamento direto
        if (data.init_point) {
          setCheckoutUrl(data.init_point);
        } else {
          throw new Error("URL de checkout não foi recebida da API.");
        }
      } catch (err) {
        console.error(err);
        setError(
          "Não foi possível carregar as opções de pagamento. Tente novamente."
        );
      } finally {
        setIsLoading(false);
      }
    };

    createPreference();
  }, [amount]); // Executa novamente se o valor da doação mudar

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-95 animate-scale-in">
        <div className="relative p-6 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>

          <div className="text-center">
            <Image
              src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo-8.png"
              alt="Logo Mercado Pago"
              className="mx-auto h-auto"
              width={120}
              height={40}
              unoptimized
              priority
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">
              Complete sua Doação
            </h2>
            <p className="text-gray-600 mt-2">
              Você será redirecionado para o ambiente seguro do Mercado Pago
              para finalizar a doação de{" "}
              <span className="font-bold text-blue-600">
                R$ {amount.toFixed(2).replace(".", ",")}
              </span>
              .
            </p>
          </div>

          <div
            id="payment-container"
            className="mt-8 h-20 flex justify-center items-center"
          >
            {isLoading && (
              <p className="text-center text-gray-600">
                Gerando link de pagamento...
              </p>
            )}
            {error && <p className="text-center text-red-600">{error}</p>}

            {/* Renderiza um botão que é um link direto para o checkout do Mercado Pago */}
            {checkoutUrl && (
              <a
                href={checkoutUrl}
                target="_blank" // Opcional: abre em nova aba
                rel="noopener noreferrer"
                className="w-full text-center bg-blue-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Ir para Pagamento Seguro
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal da Página ---
export default function HomePage() {
  // A chamada initMercadoPago() foi removida daqui.

  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isCheckoutVisible, setCheckoutVisible] = useState(false);

  const donationOptions = [25, 50, 100, 250];

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setCustomAmount(value);
    if (value) {
      setSelectedAmount(Number(value));
    } else {
      setSelectedAmount(50);
    }
  };

  const handleDonateClick = () => {
    if (selectedAmount > 0) {
      setCheckoutVisible(true);
    } else {
      alert("Por favor, escolha ou digite um valor para doar.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <main className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-1 lg:order-2">
            <Image
              src="/denner-viagem.png"
              alt="Foto Denner"
              className="rounded-3xl shadow-2xl w-full h-auto object-cover"
              width={800}
              height={600}
              priority
            />
          </div>
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Rumo aos <span className="text-blue-500">EUA</span>! Me ajude a
              voar mais alto.
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Me chamo Denner, sou atleta de atletismo e recentemente ganhei uma
              bolsa para estudar e competir nos Estados Unidos. Fui aprovado na{" "}
              <a
                className="text-orange-500 hover:underline font-bold"
                href="https://neosho.edu/student-life/athletics/track-and-field.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Neosho County CC
              </a>
              , Kansas. Agora falta um último passo muito importante: o custo da minha
              passagem aérea de ida. Por isso, estou pedindo a sua ajuda.
              Qualquer valor faz a diferença. se não puder doar, compartilhar
              essa campanha já me ajuda muito também! Com sua contribuição, você
              estará fazendo parte desse sonho e me ajudando a representar o
              Brasil na gringa. Muito obrigado! 🧡
            </p>
          </div>
        </div>
      </main>

      <section id="doar" className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <HeartIcon className="mx-auto w-12 h-12 text-blue-500" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
            Faça parte desta vitória
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Escolha um valor abaixo ou digite quanto você gostaria de doar. Toda
            ajuda é bem-vinda e fará uma enorme diferença.
          </p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {donationOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => handleSelectAmount(amount)}
                className={`p-4 rounded-xl border-2 font-bold text-xl transition-all duration-200 ${
                  selectedAmount === amount && !customAmount
                    ? "bg-blue-600 text-white border-blue-600 scale-105 shadow-lg"
                    : "bg-white text-blue-600 border-gray-200 hover:border-blue-400"
                }`}
              >
                R$ {amount}
              </button>
            ))}
          </div>
          <div className="mt-6 max-w-xs mx-auto">
            <label htmlFor="custom-amount" className="sr-only">
              Outro valor
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 font-medium">
                R$
              </span>
              <input
                type="text"
                id="custom-amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Outro valor"
                className="w-full pl-12 pr-4 py-4 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="mt-10">
            <button
              onClick={handleDonateClick}
              disabled={!selectedAmount || selectedAmount <= 0}
              className="bg-blue-600 text-white font-extrabold text-xl py-5 px-12 rounded-xl shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
            >
              Doar Agora
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} DennerWebDev - Minha Campanha de
            Doação. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Uma iniciativa de amigos e família.
          </p>
          <div className="flex justify-center space-x-6 mt-6">
            <a
              href="https://wa.me/5551992714177"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Link para o WhatsApp"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Image
                src="/icons/whatsapp-white-icon.png"
                alt="WhatsApp"
                width={35}
                height={35}
                className="inline-block"
              />
            </a>
            <a
              href="https://instagram.com/denner_04"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Link para o Instagram"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Image
                src="/icons/instagram-white-icon.webp"
                alt="Instagram"
                width={35}
                height={35}
                className="inline-block"
              />
            </a>
            <a
              href="mailto:dennerdosantos17@gmail.com"
              aria-label="Link para enviar e-mail"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Image
                src="/icons/Gmail_Logo_White_512px.png"
                alt="E-mail"
                width={35}
                height={35}
                className="inline-block"
              />
            </a>
          </div>
        </div>
      </footer>

      {isCheckoutVisible && (
        <CheckoutModal
          amount={selectedAmount}
          onClose={() => setCheckoutVisible(false)}
        />
      )}
    </div>
  );
}
