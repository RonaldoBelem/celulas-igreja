const fs = require("fs");
const path = require("path");

const tribes = [
  {
    id: "ruben",
    name: "Rúben",
    color: "#E74C3C", // Vermelho
    symbol: "⚡", // Símbolo de mandragoras
  },
  {
    id: "simeao",
    name: "Simeão",
    color: "#2ECC71", // Verde
    symbol: "⚔️", // Símbolo de espadas
  },
  {
    id: "levi",
    name: "Levi",
    color: "#3498DB", // Azul
    symbol: "✡️", // Estrela de Davi
  },
  {
    id: "juda",
    name: "Judá",
    color: "#F1C40F", // Dourado
    symbol: "🦁", // Leão
  },
  {
    id: "efraim",
    name: "Efraim",
    color: "#9B59B6", // Roxo
    symbol: "🐂", // Símbolo do touro para Efraim
  },
  {
    id: "naftali",
    name: "Naftali",
    color: "#1ABC9C", // Turquesa
    symbol: "🦌", // Cervo
  },
  {
    id: "gade",
    name: "Gade",
    color: "#E67E22", // Laranja
    symbol: "⚔️", // Espada
  },
  {
    id: "aser",
    name: "Aser",
    color: "#95A5A6", // Cinza
    symbol: "🌾", // Trigo
  },
  {
    id: "issacar",
    name: "Issacar",
    color: "#34495E", // Azul escuro
    symbol: "🌟", // Estrela
  },
  {
    id: "zebulom",
    name: "Zebulom",
    color: "#16A085", // Verde água
    symbol: "⚓", // Âncora
  },
  {
    id: "manasses",
    name: "Manassés",
    color: "#8E44AD", // Púrpura
    symbol: "🌿", // Símbolo da videira para Manassés
  },
  {
    id: "benjamim",
    name: "Benjamim",
    color: "#D35400", // Marrom
    symbol: "🐺", // Lobo
  },
];

const symbolsDir = path.join(__dirname, "../public/simbolos");

// Criar diretório se não existir
if (!fs.existsSync(symbolsDir)) {
  fs.mkdirSync(symbolsDir, { recursive: true });
}

// Criar SVG para cada tribo
tribes.forEach((tribe) => {
  const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad${tribe.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${tribe.color};stop-opacity:0.2" />
        <stop offset="100%" style="stop-color:${tribe.color};stop-opacity:0.5" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#grad${tribe.id})" stroke="${tribe.color}" stroke-width="4"/>
    <text x="100" y="85" font-family="Arial" font-size="24" fill="${tribe.color}" text-anchor="middle">Tribo de</text>
    <text x="100" y="120" font-family="Arial" font-size="28" fill="${tribe.color}" text-anchor="middle" font-weight="bold">${tribe.name}</text>
    <text x="100" y="160" font-family="Arial" font-size="40" text-anchor="middle">${tribe.symbol}</text>
  </svg>`;

  fs.writeFileSync(path.join(symbolsDir, `${tribe.id}.svg`), svgContent);
});

// Criar imagem default
const defaultSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="90" fill="#f0f0f0" stroke="#5a72a0" stroke-width="4"/>
  <text x="100" y="115" font-family="Arial" font-size="24" fill="#5a72a0" text-anchor="middle">Tribo</text>
</svg>`;

fs.writeFileSync(path.join(symbolsDir, "default.svg"), defaultSvg);

console.log("Símbolos das tribos gerados com sucesso!");
