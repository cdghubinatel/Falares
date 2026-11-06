export type Category = "comidas" | "cidade" | "infancia";

export const CATEGORIES: Record<Category, string> = {
  comidas: "Comidas e bebidas",
  cidade: "Cidade, casa e objetos",
  infancia: "Infância e brincadeiras",
};

export interface Variant {
  term: string;
  /** UFs ou regiões onde o termo costuma aparecer (referência inicial, aproximada). */
  where?: string[];
  /** Termo usado de forma ampla no país todo. */
  common?: boolean;
}

export interface Question {
  id: string;
  category: Category;
  emoji: string;
  /** Descrição neutra: nunca cita nenhuma das variantes. */
  description: string;
  variants: Variant[];
}

export const QUESTIONS: Question[] = [
  // Comidas e bebidas
  {
    id: "mandioca",
    category: "comidas",
    emoji: "🌱",
    description:
      "Raiz comprida de casca marrom e polpa branca, comida cozida ou frita. Dela se fazem a farinha e o polvilho.",
    variants: [
      { term: "mandioca", where: ["S", "SP", "MG", "CO"], common: true },
      { term: "aipim", where: ["RJ", "ES", "SC"] },
      { term: "macaxeira", where: ["N", "NE"] },
      { term: "castelinha" },
    ],
  },
  {
    id: "tangerina",
    category: "comidas",
    emoji: "🍊",
    description: "Fruta cítrica pequena, de casca fina que sai fácil com a mão, dividida em gomos.",
    variants: [
      { term: "tangerina", where: ["NE", "RJ"], common: true },
      { term: "mexerica", where: ["SP", "MG", "GO"] },
      { term: "bergamota", where: ["RS"] },
      { term: "mimosa" },
      { term: "laranja-cravo" },
    ],
  },
  {
    id: "pao",
    category: "comidas",
    emoji: "🥖",
    description:
      "O pão mais comum da padaria: pequeno, de casca crocante e miolo macio, comprado por unidade para o café da manhã.",
    variants: [
      { term: "pão francês", common: true },
      { term: "pão de sal", where: ["MG"] },
      { term: "cacetinho", where: ["RS", "BA"] },
      { term: "carioquinha", where: ["CE"] },
      { term: "pão careca", where: ["PA"] },
      { term: "pão massa grossa" },
    ],
  },
  {
    id: "curau",
    category: "comidas",
    emoji: "🌽",
    description:
      "Doce cremoso e amarelo feito de milho verde ralado, cozido com leite e açúcar, servido frio com canela por cima.",
    variants: [
      { term: "curau", where: ["SE", "CO"] },
      { term: "canjica", where: ["NE"] },
      { term: "papa de milho" },
      { term: "corá" },
    ],
  },
  {
    id: "mungunza",
    category: "comidas",
    emoji: "🥣",
    description:
      "Doce de grãos inteiros de milho branco cozidos no leite com açúcar, às vezes com coco ou amendoim. Comum nas festas juninas.",
    variants: [
      { term: "canjica", where: ["SE", "S"] },
      { term: "mungunzá", where: ["NE"] },
      { term: "chá de burro" },
    ],
  },
  {
    id: "biscoito",
    category: "comidas",
    emoji: "🍪",
    description: "Doce industrializado, seco e crocante, vendido em pacotes. Pode ser recheado, de maisena, de chocolate…",
    variants: [
      { term: "biscoito", where: ["RJ", "NE"] },
      { term: "bolacha", where: ["SP", "S"] },
    ],
  },
  {
    id: "refresco",
    category: "comidas",
    emoji: "🥤",
    description: "Bebida feita de fruta (ou de pó) misturada com bastante água e açúcar, servida gelada no almoço.",
    variants: [
      { term: "suco", common: true },
      { term: "refresco", where: ["RJ", "PE"] },
    ],
  },
  {
    id: "abobora",
    category: "comidas",
    emoji: "🎃",
    description: "Legume grande de casca dura e polpa alaranjada, usado em doces, sopas e no quibebe.",
    variants: [
      { term: "abóbora", common: true },
      { term: "jerimum", where: ["NE"] },
    ],
  },
  {
    id: "carne-seca",
    category: "comidas",
    emoji: "🥩",
    description: "Carne bovina bem salgada e seca, vendida em mantas, que precisa ficar de molho para dessalgar antes de ir para a panela.",
    variants: [
      { term: "carne-seca", where: ["SE", "CO"], common: true },
      { term: "charque", where: ["S"] },
      { term: "jabá", where: ["NE"] },
      { term: "carne de sol", where: ["NE"] },
    ],
  },
  {
    id: "geladinho",
    category: "comidas",
    emoji: "🧊",
    description:
      "Suco, leite ou refresco congelado dentro de um saquinho plástico comprido. A gente morde a ponta e vai chupando.",
    variants: [
      { term: "geladinho", where: ["SP"] },
      { term: "sacolé", where: ["RJ"] },
      { term: "dindin", where: ["NE"] },
      { term: "chup-chup" },
      { term: "flau" },
      { term: "laranjinha" },
    ],
  },
  {
    id: "chimia",
    category: "comidas",
    emoji: "🍓",
    description: "Doce pastoso de fruta, vendido em pote de vidro, para passar no pão.",
    variants: [
      { term: "geleia", common: true },
      { term: "chimia", where: ["S"] },
    ],
  },

  // Cidade, casa e objetos
  {
    id: "semaforo",
    category: "cidade",
    emoji: "🚦",
    description: "Poste com luzes vermelha, amarela e verde que controla a passagem de carros e pedestres no cruzamento.",
    variants: [
      { term: "semáforo", common: true },
      { term: "sinal", where: ["RJ"] },
      { term: "farol", where: ["SP"] },
      { term: "sinaleira", where: ["S", "BA"] },
      { term: "sinaleiro" },
    ],
  },
  {
    id: "onibus",
    category: "cidade",
    emoji: "🚌",
    description: "Veículo grande de transporte coletivo que faz uma linha fixa pela cidade, parando nos pontos.",
    variants: [
      { term: "ônibus", common: true },
      { term: "buzu", where: ["BA"] },
      { term: "baú" },
    ],
  },
  {
    id: "chinelo",
    category: "cidade",
    emoji: "🩴",
    description: "Calçado aberto de borracha, preso no pé por uma tira em V que passa entre os dedos.",
    variants: [
      { term: "chinelo", common: true },
      { term: "sandália" },
      { term: "chinela", where: ["NE"] },
      { term: "havaiana" },
    ],
  },
  {
    id: "bicicleta",
    category: "cidade",
    emoji: "🚲",
    description: "Veículo de duas rodas movido a pedal. Na conversa do dia a dia, entre amigos, como você chama?",
    variants: [
      { term: "bicicleta", common: true },
      { term: "bike" },
      { term: "magrela" },
      { term: "camelo", where: ["RJ", "CO"] },
    ],
  },
  {
    id: "moletom",
    category: "cidade",
    emoji: "🧥",
    description: "Peça de roupa de manga comprida, de tecido grosso e felpudo por dentro, que se veste quando esfria.",
    variants: [
      { term: "moletom", common: true },
      { term: "blusa de frio", where: ["MG", "SP"] },
      { term: "casaco" },
    ],
  },

  // Infância e brincadeiras
  {
    id: "pipa",
    category: "infancia",
    emoji: "🪁",
    description: "Brinquedo de varetas e papel de seda, com rabiola, que se empina no vento preso a uma linha.",
    variants: [
      { term: "pipa", where: ["RJ"], common: true },
      { term: "papagaio", where: ["SP"] },
      { term: "arraia", where: ["BA", "MG"] },
      { term: "raia" },
      { term: "pandorga", where: ["S"] },
      { term: "cafifa" },
      { term: "quadrado" },
    ],
  },
  {
    id: "estilingue",
    category: "infancia",
    emoji: "🪨",
    description: "Forquilha de madeira em forma de Y com duas tiras de elástico, usada para arremessar pedrinhas.",
    variants: [
      { term: "estilingue", common: true },
      { term: "atiradeira" },
      { term: "baladeira", where: ["NE"] },
      { term: "bodoque", where: ["CO"] },
      { term: "funda" },
      { term: "setra" },
    ],
  },
  {
    id: "esconde",
    category: "infancia",
    emoji: "🙈",
    description: "Brincadeira em que uma criança conta de olhos fechados enquanto as outras procuram um lugar para não serem achadas.",
    variants: [
      { term: "esconde-esconde", common: true },
      { term: "pique-esconde", where: ["MG", "RJ"] },
      { term: "esconde" },
    ],
  },
  {
    id: "pega-pega",
    category: "infancia",
    emoji: "🏃",
    description: "Brincadeira em que uma criança corre atrás das outras tentando encostar nelas; quem é tocado passa a correr atrás.",
    variants: [
      { term: "pega-pega", common: true },
      { term: "pique" },
      { term: "pira", where: ["N"] },
      { term: "picula", where: ["NE"] },
      { term: "manja" },
    ],
  },
  {
    id: "menino",
    category: "infancia",
    emoji: "👦",
    description: "Criança do sexo masculino. Falando de um jeito informal, como você chamaria?",
    variants: [
      { term: "menino", common: true },
      { term: "guri", where: ["RS"] },
      { term: "piá", where: ["PR", "SC"] },
      { term: "moleque" },
      { term: "pivete" },
      { term: "curumim" },
    ],
  },
];

export const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

/** Normaliza um texto para busca ("São-Gonçalo " → "sao goncalo"). */
export function normalizeTerm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const ROUND_SIZE = 12;

/**
 * Perguntas que aparecem em toda rodada, antes das escolhidas pelo modelo.
 * São as de mais variantes e que separam mais regiões ao mesmo tempo.
 */
export const FIXED_QUESTIONS = ["mandioca", "tangerina", "pao", "pipa", "geladinho"];
