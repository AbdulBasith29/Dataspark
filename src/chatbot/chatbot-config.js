// Chatbot per-course configuration
// Maps course IDs from the main curriculum to tutor identities and scope metadata.

import { SYSTEM_PROMPTS } from "./system-prompts";

export const CHATBOT_CONFIG = {
  python: {
    id: "python",
    tutorName: SYSTEM_PROMPTS.python.name,
    icon: SYSTEM_PROMPTS.python.icon,
    scopeLabel: "Python Tutor · Data Science Focused",
    systemPrompt: SYSTEM_PROMPTS.python.prompt,
  },
  sql: {
    id: "sql",
    tutorName: SYSTEM_PROMPTS.sql.name,
    icon: SYSTEM_PROMPTS.sql.icon,
    scopeLabel: "SQL Tutor · Analytics & Warehousing",
    systemPrompt: SYSTEM_PROMPTS.sql.prompt,
  },
  statistics: {
    id: "statistics",
    tutorName: SYSTEM_PROMPTS.statistics.name,
    icon: SYSTEM_PROMPTS.statistics.icon,
    scopeLabel: "Statistics Tutor · Intuition & Inference",
    systemPrompt: SYSTEM_PROMPTS.statistics.prompt,
  },
  ml: {
    id: "ml",
    tutorName: SYSTEM_PROMPTS.ml.name,
    icon: SYSTEM_PROMPTS.ml.icon,
    scopeLabel: "Machine Learning Tutor · Classical ML",
    systemPrompt: SYSTEM_PROMPTS.ml.prompt,
  },
  "deep-learning": {
    id: "deep-learning",
    tutorName: SYSTEM_PROMPTS["deep-learning"].name,
    icon: SYSTEM_PROMPTS["deep-learning"].icon,
    scopeLabel: "Deep Learning Tutor · Neural Networks",
    systemPrompt: SYSTEM_PROMPTS["deep-learning"].prompt,
  },
  genai: {
    id: "genai",
    tutorName: SYSTEM_PROMPTS.genai.name,
    icon: SYSTEM_PROMPTS.genai.icon,
    scopeLabel: "GenAI Tutor · LLMs & Applications",
    systemPrompt: SYSTEM_PROMPTS.genai.prompt,
  },
  "product-sense": {
    id: "product-sense",
    tutorName: SYSTEM_PROMPTS["product-sense"].name,
    icon: SYSTEM_PROMPTS["product-sense"].icon,
    scopeLabel: "Product Sense Tutor · Metrics & Cases",
    systemPrompt: SYSTEM_PROMPTS["product-sense"].prompt,
  },
  "system-design": {
    id: "system-design",
    tutorName: SYSTEM_PROMPTS["system-design"].name,
    icon: SYSTEM_PROMPTS["system-design"].icon,
    scopeLabel: "System Design Tutor · Data Systems",
    systemPrompt: SYSTEM_PROMPTS["system-design"].prompt,
  },
  mlops: {
    id: "mlops",
    tutorName: SYSTEM_PROMPTS.mlops.name,
    icon: SYSTEM_PROMPTS.mlops.icon,
    scopeLabel: "MLOps Tutor · Cloud & Tooling",
    systemPrompt: SYSTEM_PROMPTS.mlops.prompt,
  },
  specialized: {
    id: "specialized",
    tutorName: SYSTEM_PROMPTS.specialized.name,
    icon: SYSTEM_PROMPTS.specialized.icon,
    scopeLabel: "Specialized AI Tutor · Recsys, Time Series, NLP",
    systemPrompt: SYSTEM_PROMPTS.specialized.prompt,
  },
};

export default CHATBOT_CONFIG;

