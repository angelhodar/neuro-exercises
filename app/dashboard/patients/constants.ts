export const SESSION_TYPE_LABELS: Record<string, string> = {
  evaluation: "Evaluación",
  follow_up: "Seguimiento",
  treatment: "Tratamiento",
};

export const SESSION_TYPES = Object.keys(SESSION_TYPE_LABELS);

export const DISCIPLINE_LABELS: Record<string, string> = {
  neuropsychology: "Neuropsicología",
  occupational_therapy: "Terapia ocupacional",
  other: "Otras",
  physiotherapy: "Fisioterapia",
  speech_therapy: "Logopedia",
};

export const DISCIPLINES = Object.keys(DISCIPLINE_LABELS);

export const EVALUATED_PROCESS_LABELS: Record<string, string> = {
  attention: "Atención",
  calculation: "Cálculo",
  executive_functions: "Funciones ejecutivas",
  language: "Lenguaje",
  memory: "Memoria",
  orientation: "Orientación",
  perception_gnosis: "Percepción / Gnosias",
  praxis: "Praxias",
  processing_speed: "Velocidad de procesamiento",
  social_cognition: "Cognición social",
};

export const EVALUATED_PROCESSES = Object.keys(EVALUATED_PROCESS_LABELS);
