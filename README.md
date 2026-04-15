# Rota AI — Planejador de Viagens com IA

Web app de planejamento de viagens com roteiros gerados pelo Gemini AI, mapa interativo e exportação em PDF.

## Setup

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure a API Key do Gemini

```bash
cp .env.example .env
```

Abra o arquivo `.env` e substitua `your_gemini_api_key_here` pela sua chave.

Obtenha sua chave gratuitamente em: https://aistudio.google.com

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:5173

## Funcionalidades

- **Chat com IA**: Converse com o Rota AI para criar roteiros personalizados
- **Mapa interativo**: Visualize os pontos do roteiro no OpenStreetMap
- **Exportar PDF**: Baixe o roteiro completo em PDF
- **Salvar roteiros**: Armazene roteiros no localStorage
- **Compartilhar link**: Gere um link para compartilhar o roteiro

## Stack

- React + TypeScript + Vite
- Tailwind CSS v3
- Google Gemini 2.0 Flash API
- Leaflet + OpenStreetMap
- html2pdf.js
- localStorage
