export const SESSION_TYPE_LABELS: Record<string, string> = {
  treatment: "Tratamiento",
  evaluation: "Evaluación",
  follow_up: "Seguimiento",
};

export const SESSION_TYPES = Object.keys(SESSION_TYPE_LABELS);

export const DISCIPLINE_LABELS: Record<string, string> = {
  neuropsychology: "Neuropsicología",
  occupational_therapy: "Terapia ocupacional",
  speech_therapy: "Logopedia",
  physiotherapy: "Fisioterapia",
  other: "Otras",
};

export const DISCIPLINES = Object.keys(DISCIPLINE_LABELS);

export const EVALUATED_PROCESS_LABELS: Record<string, string> = {
  attention: "Atención",
  memory: "Memoria",
  executive_functions: "Funciones ejecutivas",
  language: "Lenguaje",
  perception_gnosis: "Percepción / Gnosias",
  praxis: "Praxias",
  social_cognition: "Cognición social",
  processing_speed: "Velocidad de procesamiento",
  orientation: "Orientación",
  calculation: "Cálculo",
};

export const EVALUATED_PROCESSES = Object.keys(EVALUATED_PROCESS_LABELS);
