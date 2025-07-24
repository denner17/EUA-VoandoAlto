import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Forneça o caminho para o seu aplicativo Next.js para carregar next.config.js e arquivos .env em seu ambiente de teste
  dir: './',
});

// Adicione qualquer configuração personalizada a ser passada para o Jest
const customJestConfig: Config = {
  // Adiciona mais opções de configuração antes de cada teste ser executado
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // se estiver usando TypeScript com um baseUrl definido para o diretório raiz, você precisará do seguinte para que os aliases funcionem
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
};

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js, que é assíncrona
export default createJestConfig(customJestConfig);