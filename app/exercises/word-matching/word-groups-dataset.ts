// Dataset de grupos de palabras en español para el ejercicio de asociación semántica
// Cada grupo contiene 3 palabras relacionadas: objeto, categoría y característica

export interface WordGroup {
  object: string;
  category: string;
  characteristic: string;
}

export const wordGroups: WordGroup[] = [
  // Alimentos
  { object: "manzana", category: "fruta", characteristic: "saludable" },
  { object: "zanahoria", category: "verdura", characteristic: "nutritiva" },
  { object: "pan", category: "cereal", characteristic: "crujiente" },
  { object: "leche", category: "lácteo", characteristic: "cremosa" },
  { object: "salmón", category: "pescado", characteristic: "proteico" },
  { object: "chocolate", category: "dulce", characteristic: "irresistible" },
  { object: "naranja", category: "cítrico", characteristic: "vitamínica" },
  { object: "queso", category: "derivado", characteristic: "aromático" },
  { object: "arroz", category: "grano", characteristic: "versátil" },

  // Animales
  { object: "perro", category: "doméstico", characteristic: "fiel" },
  { object: "águila", category: "ave", characteristic: "veloz" },
  { object: "delfín", category: "marino", characteristic: "inteligente" },
  { object: "gato", category: "felino", characteristic: "independiente" },
  { object: "caballo", category: "equino", characteristic: "fuerte" },
  { object: "tortuga", category: "reptil", characteristic: "longeva" },
  { object: "abeja", category: "insecto", characteristic: "trabajadora" },

  // Objetos
  { object: "libro", category: "lectura", characteristic: "educativo" },
  { object: "reloj", category: "tiempo", characteristic: "preciso" },
  { object: "guitarra", category: "instrumento", characteristic: "melódica" },
  { object: "pincel", category: "arte", characteristic: "creativo" },
  { object: "telescopio", category: "ciencia", characteristic: "exploratorio" },
  { object: "martillo", category: "herramienta", characteristic: "resistente" },

  // Naturaleza
  { object: "volcán", category: "montaña", characteristic: "imponente" },
  { object: "río", category: "agua", characteristic: "caudaloso" },
  { object: "roble", category: "árbol", characteristic: "centenario" },
  { object: "rosa", category: "flor", characteristic: "fragante" },
  { object: "diamante", category: "mineral", characteristic: "brillante" },
  { object: "relámpago", category: "fenómeno", characteristic: "luminoso" },

  // Profesiones
  { object: "médico", category: "salud", characteristic: "dedicado" },
  {
    object: "arquitecto",
    category: "construcción",
    characteristic: "visionario",
  },
  { object: "maestro", category: "educación", characteristic: "paciente" },
  { object: "bombero", category: "emergencia", characteristic: "valiente" },
  { object: "cocinero", category: "gastronomía", characteristic: "habilidoso" },

  // Emociones
  { object: "risa", category: "alegría", characteristic: "contagiosa" },
  { object: "llanto", category: "tristeza", characteristic: "liberador" },
  { object: "abrazo", category: "cariño", characteristic: "reconfortante" },
  { object: "sorpresa", category: "asombro", characteristic: "inesperada" },

  // Deportes
  { object: "fútbol", category: "equipo", characteristic: "competitivo" },
  { object: "natación", category: "acuático", characteristic: "completo" },
  { object: "ajedrez", category: "mental", characteristic: "estratégico" },
  { object: "yoga", category: "relajación", characteristic: "equilibrado" },

  // Lugares
  { object: "hospital", category: "sanidad", characteristic: "necesario" },
  { object: "museo", category: "cultura", characteristic: "histórico" },
  { object: "mercado", category: "comercio", characteristic: "bullicioso" },
  { object: "parque", category: "recreo", characteristic: "tranquilo" },
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
