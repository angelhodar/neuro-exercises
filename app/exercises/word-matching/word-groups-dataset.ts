// Dataset de grupos de palabras en español para el ejercicio de asociación semántica
// Cada grupo contiene 4 palabras relacionadas: objeto, categoría, característica y acción

export interface WordGroup {
  action: string;
  category: string;
  characteristic: string;
  object: string;
}

export const COLUMN_LABELS: Record<keyof WordGroup, string> = {
  action: "Acción",
  category: "Categoría",
  characteristic: "Característica",
  object: "Objeto",
};

export const COLUMN_KEYS: (keyof WordGroup)[] = [
  "object",
  "category",
  "characteristic",
  "action",
];

export const wordGroups: WordGroup[] = [
  // Alimentos
  {
    action: "morder",
    category: "fruta",
    characteristic: "saludable",
    object: "manzana",
  },
  {
    action: "rallar",
    category: "verdura",
    characteristic: "nutritiva",
    object: "zanahoria",
  },
  {
    action: "hornear",
    category: "cereal",
    characteristic: "crujiente",
    object: "pan",
  },
  {
    action: "verter",
    category: "lácteo",
    characteristic: "cremosa",
    object: "leche",
  },
  {
    action: "asar",
    category: "pescado",
    characteristic: "proteico",
    object: "salmón",
  },
  {
    action: "derretir",
    category: "dulce",
    characteristic: "irresistible",
    object: "chocolate",
  },
  {
    action: "exprimir",
    category: "cítrico",
    characteristic: "vitamínica",
    object: "naranja",
  },
  {
    action: "fundir",
    category: "derivado",
    characteristic: "aromático",
    object: "queso",
  },
  {
    action: "cocer",
    category: "grano",
    characteristic: "versátil",
    object: "arroz",
  },

  // Animales
  {
    action: "ladrar",
    category: "doméstico",
    characteristic: "fiel",
    object: "perro",
  },
  {
    action: "planear",
    category: "ave",
    characteristic: "veloz",
    object: "águila",
  },
  {
    action: "saltar",
    category: "marino",
    characteristic: "inteligente",
    object: "delfín",
  },
  {
    action: "ronronear",
    category: "felino",
    characteristic: "independiente",
    object: "gato",
  },
  {
    action: "galopar",
    category: "equino",
    characteristic: "fuerte",
    object: "caballo",
  },
  {
    action: "reptar",
    category: "reptil",
    characteristic: "longeva",
    object: "tortuga",
  },
  {
    action: "polinizar",
    category: "insecto",
    characteristic: "trabajadora",
    object: "abeja",
  },

  // Objetos
  {
    action: "leer",
    category: "lectura",
    characteristic: "educativo",
    object: "libro",
  },
  {
    action: "marcar",
    category: "tiempo",
    characteristic: "preciso",
    object: "reloj",
  },
  {
    action: "rasguear",
    category: "instrumento",
    characteristic: "melódica",
    object: "guitarra",
  },
  {
    action: "pintar",
    category: "arte",
    characteristic: "creativo",
    object: "pincel",
  },
  {
    action: "observar",
    category: "ciencia",
    characteristic: "exploratorio",
    object: "telescopio",
  },
  {
    action: "clavar",
    category: "herramienta",
    characteristic: "resistente",
    object: "martillo",
  },

  // Naturaleza
  {
    action: "erupcionar",
    category: "montaña",
    characteristic: "imponente",
    object: "volcán",
  },
  {
    action: "fluir",
    category: "agua",
    characteristic: "caudaloso",
    object: "río",
  },
  {
    action: "crecer",
    category: "árbol",
    characteristic: "centenario",
    object: "roble",
  },
  {
    action: "florecer",
    category: "flor",
    characteristic: "fragante",
    object: "rosa",
  },
  {
    action: "relucir",
    category: "mineral",
    characteristic: "brillante",
    object: "diamante",
  },
  {
    action: "iluminar",
    category: "fenómeno",
    characteristic: "luminoso",
    object: "relámpago",
  },

  // Profesiones
  {
    action: "curar",
    category: "salud",
    characteristic: "dedicado",
    object: "médico",
  },
  {
    action: "diseñar",
    category: "construcción",
    characteristic: "visionario",
    object: "arquitecto",
  },
  {
    action: "enseñar",
    category: "educación",
    characteristic: "paciente",
    object: "maestro",
  },
  {
    action: "rescatar",
    category: "emergencia",
    characteristic: "valiente",
    object: "bombero",
  },
  {
    action: "cocinar",
    category: "gastronomía",
    characteristic: "habilidoso",
    object: "cocinero",
  },

  // Emociones
  {
    action: "reír",
    category: "alegría",
    characteristic: "contagiosa",
    object: "risa",
  },
  {
    action: "llorar",
    category: "tristeza",
    characteristic: "liberador",
    object: "llanto",
  },
  {
    action: "abrazar",
    category: "cariño",
    characteristic: "reconfortante",
    object: "abrazo",
  },
  {
    action: "asombrar",
    category: "asombro",
    characteristic: "inesperada",
    object: "sorpresa",
  },

  // Deportes
  {
    action: "chutar",
    category: "equipo",
    characteristic: "competitivo",
    object: "fútbol",
  },
  {
    action: "nadar",
    category: "acuático",
    characteristic: "completo",
    object: "natación",
  },
  {
    action: "pensar",
    category: "mental",
    characteristic: "estratégico",
    object: "ajedrez",
  },
  {
    action: "meditar",
    category: "relajación",
    characteristic: "equilibrado",
    object: "yoga",
  },

  // Lugares
  {
    action: "atender",
    category: "sanidad",
    characteristic: "necesario",
    object: "hospital",
  },
  {
    action: "exhibir",
    category: "cultura",
    characteristic: "histórico",
    object: "museo",
  },
  {
    action: "comprar",
    category: "comercio",
    characteristic: "bullicioso",
    object: "mercado",
  },
  {
    action: "pasear",
    category: "recreo",
    characteristic: "tranquilo",
    object: "parque",
  },
];

/**
 * Returns a shuffled copy of an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns a random selection of word groups
 */
export function getRandomGroups(count: number): WordGroup[] {
  return shuffle(wordGroups).slice(0, Math.min(count, wordGroups.length));
}
