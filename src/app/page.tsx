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

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
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

// --- Componente do Modal de PIX ---
interface PixModalProps {
  amount: number;
  onClose: () => void;
}

interface PixData {
  qrCodeImage: string;
  qrCodeCopyPaste: string;
}

const PixModal = ({ amount, onClose }: PixModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const generatePix = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amount,
            description: `Doação para a campanha Rumo aos EUA`,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao gerar o código PIX.");
        }

        const data = await response.json();
        setPixData(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível gerar o PIX. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    generatePix();
  }, [amount]);

  const handleCopy = () => {
    if (pixData?.qrCodeCopyPaste) {
      navigator.clipboard.writeText(pixData.qrCodeCopyPaste);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Resetar o estado após 2 segundos
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-95 animate-scale-in">
        <div className="relative p-6 sm:p-8">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Pague com PIX</h2>
            <p className="text-gray-600 mt-2">Para doar <span className="font-bold text-blue-600">R$ {amount.toFixed(2).replace(".", ",")}</span>, escaneie o QR Code ou copie o código abaixo.</p>
          </div>

          <div className="mt-6 flex flex-col items-center">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Gerando seu PIX...</p>
              </div>
            )}
            {error && <p className="text-center text-red-600 h-64 flex items-center">{error}</p>}
            {pixData && (
              <div className="w-full animate-fade-in">
                <Image src={pixData.qrCodeImage} alt="PIX QR Code" width={256} height={256} className="mx-auto rounded-lg border" />
                <p className="text-center text-sm text-gray-500 mt-4">Ou copie o código abaixo:</p>
                <div className="relative mt-2">
                  <input type="text" readOnly value={pixData.qrCodeCopyPaste} className="w-full bg-gray-100 border-gray-300 rounded-lg p-3 pr-12 text-sm text-gray-700 truncate" />
                  <button onClick={handleCopy} className="absolute inset-y-0 right-0 flex items-center px-3 bg-gray-200 hover:bg-gray-300 rounded-r-lg transition-colors">
                    {isCopied ? <CheckIcon className="w-5 h-5 text-green-600" /> : <CopyIcon className="w-5 h-5 text-gray-600" />}
                  </button>
                </div>
                {isCopied && <p className="text-center text-green-600 text-sm mt-2 animate-fade-in">Código copiado!</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal da Página ---
export default function HomePage() {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [isPixModalVisible, setPixModalVisible] = useState(false);

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
      setPixModalVisible(true);
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
                href="https://www.neosho.edu"
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

      {isPixModalVisible && (
        <PixModal
          amount={selectedAmount}
          onClose={() => setPixModalVisible(false)}
        />
      )}
    </div>
  );
}
