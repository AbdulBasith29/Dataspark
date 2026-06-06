export const GENAI_QUESTIONS = [
  {
    id: "aiq1", courseId: "genai", topicId: "genai-agents",
    title: "Design a Data Quality Classifier Prompt", difficulty: "Medium", type: "open-ended", estimatedMinutes: 18,
    prompt: "Design a system prompt for Claude that classifies CSV data quality. Include the prompt, few-shot strategy, output schema, validation approach, and fallback for misclassification.",
    hints: [
      "System prompt defines the persona + task scope; few-shot examples calibrate tone and format",
      "Structured output (JSON schema) makes downstream parsing reliable",
      "Validation: run on labelled test set; measure accuracy and false-negative rate on 'bad' data",
    ],
    modelAnswer: `**System Prompt:**
\`\`\`
You are a data quality auditor for CSV datasets. For each column you receive, classify it into exactly one of: COMPLETE, SPARSE (>10% nulls), INCONSISTENT (mixed types or formats), DUPLICATE_PRONE (high cardinality near-dupes), or ANOMALOUS (statistical outliers detected).

Return ONLY valid JSON matching the schema below. Do not add commentary.
Schema: {"column": str, "classification": str, "confidence": "high"|"medium"|"low", "evidence": str, "recommendation": str}
\`\`\`

**Few-shot strategy:**
Include 3 examples in the human turn covering edge cases: (1) a clean column, (2) a sparse column with inconsistent date formats, (3) a near-duplicate name column. This calibrates confidence scoring and evidence phrasing without lengthening the system prompt.

**Output schema validation:**
Parse the JSON response; check that \`classification\` is one of the five allowed values. If it's not, retry once with "Your previous response had an invalid classification value. Valid values are: COMPLETE, SPARSE, INCONSISTENT, DUPLICATE_PRONE, ANOMALOUS. Please re-classify."

**Fallback for misclassification:**
If confidence is "low" or the JSON is malformed after one retry, fall back to a deterministic rule-based classifier (null rate, unique ratio, type variance) and flag the column for human review with \`source: "fallback_rules"\`.

**Production readiness:**
- Cache identical column profiles to avoid re-classifying the same data
- Log all LLM calls with prompt hash + response for audit
- Run on a labelled test set of 200 columns monthly to detect model drift`,
    rubric: [
      "System prompt includes persona, classification taxonomy, and output format",
      "Few-shot examples cover clean, sparse, and anomalous cases",
      "JSON output schema defined and enforced",
      "Retry logic handles invalid classification values",
      "Rule-based fallback for low-confidence or malformed responses",
      "Mentions caching and logging for production use",
    ],
    tags: ["prompt-engineering", "system-design", "data-quality"],
    commonMistakes: ["Not defining the output schema in the prompt", "Using few-shot examples that only show the 'easy' case", "No fallback — assuming the LLM always returns valid JSON"],
  },
  {
    id: "aiq2", courseId: "genai", topicId: "genai-rag",
    title: "RAG vs Fine-Tuning Decision", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    prompt: "Your company has 10,000 internal documents and wants an AI assistant for employees. Compare RAG vs fine-tuning across cost, accuracy, freshness, and maintenance. What do you recommend?",
    hints: [
      "Fine-tuning injects knowledge into weights — great for style/format, poor for factual recall",
      "RAG retrieves at inference time — knowledge stays fresh, no retraining needed",
      "The worst mistake: assuming fine-tuning on documents teaches 'facts' reliably",
    ],
    modelAnswer: `**RAG vs Fine-Tuning comparison:**

| Dimension | RAG | Fine-Tuning |
|-----------|-----|-------------|
| Cost | Low upfront (embed + index); pay per query | High upfront (GPU training); cheaper per query |
| Accuracy on facts | High — answer grounded in retrieved text | Unreliable — LLMs hallucinate fine-tuned facts |
| Freshness | Instant — update the vector DB, no retraining | Stale — requires full retraining for new docs |
| Latency | Slightly higher (retrieval step) | Faster (no retrieval) |
| Maintenance | Update documents, re-embed new ones | Re-run training pipeline on new data |
| Explainability | High — can cite source documents | Low — no traceability to source |

**Recommendation: RAG**

For 10,000 documents, RAG is clearly superior:

1. **Freshness wins for internal docs** — policies, procedures, and org info change constantly. Fine-tuning would be stale within weeks.
2. **Factual accuracy** — LLMs don't reliably memorise specific facts from fine-tuning. RAG retrieves the exact paragraph and grounds the answer.
3. **Cost** — 10,000 documents at ~500 tokens each = ~5M tokens to embed (~$1–2 with OpenAI/Voyage). No GPU needed.
4. **Auditability** — employees can see which document the answer came from, critical for compliance.

**When fine-tuning makes sense:** If you need the model to adopt a specific tone/format, consistently use company jargon, or perform a specialised task type (e.g. always return structured JSON in a domain-specific schema), fine-tune on FORMAT — not facts. Combine both: RAG for knowledge, fine-tuning for style.`,
    rubric: [
      "Compares at least 4 dimensions (cost, accuracy, freshness, maintenance)",
      "Correctly identifies RAG as better for factual recall",
      "Explains why fine-tuning doesn't reliably teach facts",
      "Addresses freshness advantage of RAG for live documents",
      "Makes a clear final recommendation with reasoning",
      "Mentions hybrid approach (RAG + fine-tuning for format/style)",
    ],
    tags: ["RAG", "architecture", "decision-making"],
    commonMistakes: ["Claiming fine-tuning on documents gives better factual accuracy", "Not addressing the freshness problem for internal docs", "Recommending fine-tuning purely for cost savings without acknowledging accuracy tradeoff"],
  },
  {
    id: "aiq3", courseId: "genai", topicId: "genai-ops",
    title: "LLM Evaluation Pipeline for Text-to-SQL", difficulty: "Hard", type: "open-ended", estimatedMinutes: 22,
    prompt: "Design an eval pipeline for an LLM text-to-SQL feature. Cover metrics, test data construction, handling multiple valid SQLs, production readiness thresholds, and post-deployment monitoring.",
    hints: [
      "Execution accuracy: run both SQLs, compare result sets — more reliable than string matching",
      "Test set needs both easy and adversarial cases: ambiguous column names, joins, subqueries",
      "Post-deployment: track latency, error rate, and user correction rate",
    ],
    modelAnswer: `**Metrics:**
1. **Execution Accuracy (primary):** Run the generated SQL and the gold SQL on the actual DB; compare result sets. Handles multiple valid SQL formulations automatically.
2. **Exact Match Accuracy:** Normalise SQL (lowercase, strip whitespace, sort SELECT columns), compare strings. Useful for CI regression tests.
3. **BLEU/edit distance (avoid):** Syntactically similar SQL can be semantically wrong. Prefer execution.
4. **Null result rate:** How often does the generated SQL return empty when gold SQL returns rows?
5. **Syntax error rate:** % of generations that fail to parse.

**Test data construction:**
- Split by difficulty: simple (single table, no joins), medium (2-table join + GROUP BY), hard (subqueries, window functions, edge cases)
- Include adversarial cases: column names that match table names, ambiguous plural/singular, questions needing COALESCE for NULLs
- Ensure test DB has realistic data distribution (nulls, zero rows for some queries)
- Never sample from production data — synthetic + curated

**Handling multiple valid SQLs:**
Execution accuracy handles this natively. For exact match tests, maintain a golden set per query and mark a test pass if the output matches any golden SQL.

**Production readiness thresholds:**
- Simple queries: >92% execution accuracy
- Medium queries: >78%
- Hard queries: >55%
- Syntax error rate: <3%
- p95 latency: <2s

**Post-deployment monitoring:**
- Track user correction rate (edit or re-ask) — direct proxy for accuracy
- Log all query-SQL pairs; sample 5% for human review weekly
- Alert on syntax error rate spike (>5% in a 1-hour window)
- Shadow mode for new prompt versions: run both old and new, compare on live traffic before switching`,
    rubric: [
      "Uses execution accuracy as primary metric (not BLEU)",
      "Explains why multiple valid SQLs are handled by execution comparison",
      "Test set covers easy/medium/hard difficulty tiers",
      "Specific numeric thresholds for production readiness",
      "Mentions syntax error rate monitoring",
      "Post-deployment strategy includes user correction rate as a signal",
    ],
    tags: ["evaluation", "text-to-SQL", "MLOps"],
    commonMistakes: ["Using BLEU or string matching as primary metric", "Test set only containing simple single-table queries", "No post-deployment monitoring plan beyond accuracy on static test set"],
  },
  {
    id: "aiq4", courseId: "genai", topicId: "genai-rag",
    title: "Design an Advanced RAG Architecture", difficulty: "Hard", type: "open-ended", estimatedMinutes: 25,
    prompt: "Your team's naive RAG system has 58% answer relevancy. Design a systematic improvement roadmap: identify failure modes, propose retrieval/reranking/generation improvements, and define evaluation metrics to track progress.",
    hints: [
      "58% relevancy suggests retrieval is broken, not the LLM — start there",
      "Chunking strategy affects retrieval quality more than most people realise",
      "Reranking (cross-encoder) almost always improves over bi-encoder retrieval alone",
    ],
    modelAnswer: `**Step 1 — Diagnose failure modes (before building)**
Run RAGAS on a test set. Break down:
- **Context Recall:** are the right chunks being retrieved?
- **Context Precision:** are retrieved chunks relevant, or just noisy?
- **Answer Faithfulness:** is the LLM hallucinating beyond the context?
- **Answer Relevancy:** is the answer on-topic?

If context recall is low → retrieval problem. If faithfulness is low → generation/prompt problem.

**Retrieval improvements (high impact):**
1. **Better chunking:** Replace fixed-size chunks with recursive/semantic chunking. Chunk at natural boundaries (headings, paragraphs). Add chunk overlap (~10%).
2. **Hybrid search:** Combine dense (vector cosine) + sparse (BM25) retrieval with RRF (Reciprocal Rank Fusion). Catches cases where exact keywords matter.
3. **Query rewriting:** Use the LLM to expand ambiguous queries into 3-5 search queries, retrieve for each, merge results.
4. **HyDE (Hypothetical Document Embeddings):** Generate a hypothetical answer, embed it — its embedding space is closer to relevant documents than the original question.

**Reranking:**
Apply a cross-encoder (e.g. BAAI/bge-reranker-v2) on the top-20 retrieved chunks to reorder before passing top-5 to the LLM. Cross-encoders consider query-chunk jointly — consistently 10–20% relevancy improvement.

**Generation improvements:**
- Add explicit instructions: "Answer ONLY using the provided context. If the answer is not in the context, say 'I don't know.'"
- Include chunk source metadata so the LLM can distinguish authority levels.

**Metrics to track:**
- RAGAS Context Recall, Context Precision, Answer Faithfulness, Answer Relevancy
- User thumbs up/down rate
- "I don't know" rate (too high = retrieval gaps; too low = hallucinating)

**Expected uplift:** baseline 58% → hybrid search + reranking → ~72–78% → add query rewriting → ~82%+.`,
    rubric: [
      "Diagnoses retrieval vs generation failure before proposing solutions",
      "Mentions chunking strategy improvement",
      "Proposes hybrid search (dense + sparse + RRF)",
      "Includes reranking with cross-encoder",
      "Proposes query rewriting or HyDE",
      "Defines specific RAGAS metrics to track progress",
      "Estimates expected uplift at each stage",
    ],
    tags: ["RAG", "architecture", "evaluation"],
    commonMistakes: ["Jumping to fine-tuning the LLM when retrieval is the bottleneck", "Not mentioning reranking (biggest single improvement for most RAG systems)", "Using only vector search without hybrid fallback"],
  },
  {
    id: "aiq5", courseId: "genai", topicId: "genai-agents",
    title: "Multi-Agent System Design", difficulty: "Hard", type: "open-ended", estimatedMinutes: 25,
    prompt: "Design a multi-agent system that monitors 500 enterprise customers, detects churn signals from support tickets + usage data, and drafts personalised outreach emails. Cover agent roles, orchestration, tool access, safety guardrails, and failure modes.",
    hints: [
      "Separate concerns: one agent for data analysis, one for drafting — don't make one agent do everything",
      "Human-in-the-loop before sending emails — irreversible actions need approval",
      "Idempotency: if the pipeline reruns, don't send duplicate emails",
    ],
    modelAnswer: `**Agent roles:**
1. **DataAgent** — pulls usage metrics and support ticket data for each customer, computes churn risk score using heuristic rules + ML model, returns a structured risk report per customer.
2. **AnalystAgent** — reads the risk report, identifies the top 3 churn signals per customer (e.g. "usage down 40% + 2 P1 tickets this week"), writes a 2-sentence "why this customer is at risk" summary.
3. **DraftAgent** — takes the AnalystAgent summary + customer profile (industry, CSM name, recent purchase) and drafts a personalised outreach email. Tone: helpful, not salesy.
4. **ReviewAgent** (optional) — scores each draft for tone, personalisation quality, and absence of hallucinated claims before human review.

**Orchestration:**
Use a supervisor pattern (e.g. LangGraph): Supervisor dispatches batches of 25 customers to DataAgent (parallelised), collects results, fans out to AnalystAgent, then DraftAgent. Final drafts queue for human approval before any send action.

**Tool access:**
- DataAgent: read-only access to data warehouse + CRM API
- DraftAgent: read-only customer profile API
- No agent has email send access — only the human-approved workflow step does

**Safety guardrails:**
1. **Human-in-the-loop:** All drafts require CSM approval before sending. Irreversible actions (sending email) never triggered autonomously.
2. **Idempotency:** Track sent drafts by customer_id + week. Rerunning the pipeline skips already-drafted customers.
3. **Rate limits:** Cap DataAgent at 50 API calls/min to avoid warehouse throttling.
4. **Hallucination check:** ReviewAgent flags any draft mentioning specific product features or SLA terms not in the customer profile.

**Failure modes & mitigations:**
- DataAgent API timeout → retry with backoff; if 3 retries fail, mark customer as "data unavailable", skip drafting
- DraftAgent produces low-quality output → ReviewAgent scores below threshold → flag for manual drafting, don't auto-send
- LLM rate limit → queue with exponential backoff; process next batch while waiting`,
    rubric: [
      "Defines at least 3 specialised agents with clear separation of concerns",
      "Uses supervisor/orchestrator pattern for coordination",
      "Tool access is read-only except for the human-approved send step",
      "Human-in-the-loop required before any email is sent",
      "Idempotency mechanism to prevent duplicate emails",
      "Addresses at least 2 concrete failure modes with mitigations",
    ],
    tags: ["agents", "multi-agent", "system-design"],
    commonMistakes: ["Giving agents direct email send access (no human in the loop)", "One monolithic agent doing all tasks (poor separation of concerns)", "No failure handling — what happens when an API call fails?"],
  },
];
