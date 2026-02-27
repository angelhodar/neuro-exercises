// Dataset de grupos de palabras en español para el ejercicio de asociación semántica
// Cada grupo contiene 4 palabras relacionadas: objeto, categoría, característica y acción

export interface WordGroup {
  object: string;
  category: string;
  characteristic: string;
  action: string;
}

export const COLUMN_LABELS: Record<keyof WordGroup, string> = {
  object: "Objeto",
  category: "Categoría",
  characteristic: "Característica",
  action: "Acción",
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
    object: "manzana",
    category: "fruta",
    characteristic: "saludable",
    action: "morder",
  },
  {
    object: "zanahoria",
    category: "verdura",
    characteristic: "nutritiva",
    action: "rallar",
  },
  {
    object: "pan",
    category: "cereal",
    characteristic: "crujiente",
    action: "hornear",
  },
  {
    object: "leche",
    category: "lácteo",
    characteristic: "cremosa",
    action: "verter",
  },
  {
    object: "salmón",
    category: "pescado",
    characteristic: "proteico",
    action: "asar",
  },
  {
    object: "chocolate",
    category: "dulce",
    characteristic: "irresistible",
    action: "derretir",
  },
  {
    object: "naranja",
    category: "cítrico",
    characteristic: "vitamínica",
    action: "exprimir",
  },
  {
    object: "queso",
    category: "derivado",
    characteristic: "aromático",
    action: "fundir",
  },
  {
    object: "arroz",
    category: "grano",
    characteristic: "versátil",
    action: "cocer",
  },

  // Animales
  {
    object: "perro",
    category: "doméstico",
    characteristic: "fiel",
    action: "ladrar",
  },
  {
    object: "águila",
    category: "ave",
    characteristic: "veloz",
    action: "planear",
  },
  {
    object: "delfín",
    category: "marino",
    characteristic: "inteligente",
    action: "saltar",
  },
  {
    object: "gato",
    category: "felino",
    characteristic: "independiente",
    action: "ronronear",
  },
  {
    object: "caballo",
    category: "equino",
    characteristic: "fuerte",
    action: "galopar",
  },
  {
    object: "tortuga",
    category: "reptil",
    characteristic: "longeva",
    action: "reptar",
  },
  {
    object: "abeja",
    category: "insecto",
    characteristic: "trabajadora",
    action: "polinizar",
  },

  // Objetos
  {
    object: "libro",
    category: "lectura",
    characteristic: "educativo",
    action: "leer",
  },
  {
    object: "reloj",
    category: "tiempo",
    characteristic: "preciso",
    action: "marcar",
  },
  {
    object: "guitarra",
    category: "instrumento",
    characteristic: "melódica",
    action: "rasguear",
  },
  {
    object: "pincel",
    category: "arte",
    characteristic: "creativo",
    action: "pintar",
  },
  {
    object: "telescopio",
    category: "ciencia",
    characteristic: "exploratorio",
    action: "observar",
  },
  {
    object: "martillo",
    category: "herramienta",
    characteristic: "resistente",
    action: "clavar",
  },

  // Naturaleza
  {
    object: "volcán",
    category: "montaña",
    characteristic: "imponente",
    action: "erupcionar",
  },
  {
    object: "río",
    category: "agua",
    characteristic: "caudaloso",
    action: "fluir",
  },
  {
    object: "roble",
    category: "árbol",
    characteristic: "centenario",
    action: "crecer",
  },
  {
    object: "rosa",
    category: "flor",
    characteristic: "fragante",
    action: "florecer",
  },
  {
    object: "diamante",
    category: "mineral",
    characteristic: "brillante",
    action: "relucir",
  },
  {
    object: "relámpago",
    category: "fenómeno",
    characteristic: "luminoso",
    action: "iluminar",
  },

  // Profesiones
  {
    object: "médico",
    category: "salud",
    characteristic: "dedicado",
    action: "curar",
  },
  {
    object: "arquitecto",
    category: "construcción",
    characteristic: "visionario",
    action: "diseñar",
  },
  {
    object: "maestro",
    category: "educación",
    characteristic: "paciente",
    action: "enseñar",
  },
  {
    object: "bombero",
    category: "emergencia",
    characteristic: "valiente",
    action: "rescatar",
  },
  {
    object: "cocinero",
    category: "gastronomía",
    characteristic: "habilidoso",
    action: "cocinar",
  },

  // Emociones
  {
    object: "risa",
    category: "alegría",
    characteristic: "contagiosa",
    action: "reír",
  },
  {
    object: "llanto",
    category: "tristeza",
    characteristic: "liberador",
    action: "llorar",
  },
  {
    object: "abrazo",
    category: "cariño",
    characteristic: "reconfortante",
    action: "abrazar",
  },
  {
    object: "sorpresa",
    category: "asombro",
    characteristic: "inesperada",
    action: "asombrar",
  },

  // Deportes
  {
    object: "fútbol",
    category: "equipo",
    characteristic: "competitivo",
    action: "chutar",
  },
  {
    object: "natación",
    category: "acuático",
    characteristic: "completo",
    action: "nadar",
  },
  {
    object: "ajedrez",
    category: "mental",
    characteristic: "estratégico",
    action: "pensar",
  },
  {
    object: "yoga",
    category: "relajación",
    characteristic: "equilibrado",
    action: "meditar",
  },

  // Lugares
  {
    object: "hospital",
    category: "sanidad",
    characteristic: "necesario",
    action: "atender",
  },
  {
    object: "museo",
    category: "cultura",
    characteristic: "histórico",
    action: "exhibir",
  },
  {
    object: "mercado",
    category: "comercio",
    characteristic: "bullicioso",
    action: "comprar",
  },
  {
    object: "parque",
    category: "recreo",
    characteristic: "tranquilo",
    action: "pasear",
  },
];

/**
 * Returns a shuffled copy of an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
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
