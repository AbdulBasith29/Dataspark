import { useState } from "react";
import { DS } from "../lib/ds-platform-tokens.js";

// ── Constants ─────────────────────────────────────────────────────────────────
const BLUE = "#0EA5E9";
const BLUE_DIM = "rgba(14,165,233,0.15)";
const BLUE_BORDER = "rgba(14,165,233,0.35)";
const GREEN = "#34D399";
const GREEN_DIM = "rgba(52,211,153,0.12)";
const GREEN_BORDER = "rgba(52,211,153,0.32)";
const AMBER = "#FBBF24";
const AMBER_DIM = "rgba(251,191,36,0.12)";
const AMBER_BORDER = "rgba(251,191,36,0.32)";
const PURPLE = "#818CF8";
const PURPLE_DIM = "rgba(129,140,248,0.12)";
const PURPLE_BORDER = "rgba(129,140,248,0.32)";
const ORANGE = "#FB923C";
const ORANGE_DIM = "rgba(251,146,60,0.12)";
const ORANGE_BORDER = "rgba(251,146,60,0.32)";
const PANEL_BG = "rgba(2,6,23,0.72)";
const CARD_BG = "rgba(255,255,255,0.02)";
const DIM_TEXT = "rgba(255,255,255,0.35)";

// ── AWS Service Categories ────────────────────────────────────────────────────
const AWS_CATEGORIES = [
  {
    id: "compute",
    label: "Compute",
    icon: "EC2",
    accent: BLUE,
    accentDim: BLUE_DIM,
    accentBorder: BLUE_BORDER,
    services: [
      {
        name: "EC2",
        full: "Elastic Compute Cloud",
        desc: "Resizable virtual machines — full OS control, GPU instances (p3/p4d) for training.",
        useCase: "Running custom training scripts, Jupyter servers, or long-batch ETL jobs.",
        cost: "On-demand (per-second billing) or Spot Instances (up to 90% cheaper, interruptible).",
      },
      {
        name: "SageMaker",
        full: "Amazon SageMaker",
        desc: "Managed ML platform — Studio notebooks, training jobs, HPO, and pipelines.",
        useCase: "End-to-end ML: managed notebooks → distributed training → model registry.",
        cost: "Pay-per-use for Studio, training instance-hours billed per second.",
      },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    icon: "S3",
    accent: GREEN,
    accentDim: GREEN_DIM,
    accentBorder: GREEN_BORDER,
    services: [
      {
        name: "S3",
        full: "Simple Storage Service",
        desc: "Object store — unlimited scale, 11-nines durability, versioning, lifecycle rules.",
        useCase: "Raw data lake, processed features, model artifacts, and training datasets.",
        cost: "~$0.023/GB/month storage + per-request charges; Intelligent-Tiering auto-optimizes.",
      },
      {
        name: "Redshift",
        full: "Amazon Redshift",
        desc: "Columnar data warehouse — MPP SQL engine, Redshift Spectrum for S3 queries.",
        useCase: "Analytical queries on business metrics, feature aggregation at scale.",
        cost: "Reserved or on-demand node-hours; Serverless charges per RPU-hour.",
      },
    ],
  },
  {
    id: "pipeline",
    label: "Data Pipeline",
    icon: "Glue",
    accent: AMBER,
    accentDim: AMBER_DIM,
    accentBorder: AMBER_BORDER,
    services: [
      {
        name: "AWS Glue",
        full: "AWS Glue (ETL)",
        desc: "Serverless Spark ETL — Data Catalog, crawlers, job bookmarks for incremental loads.",
        useCase: "Transforming raw S3 data into training-ready Parquet; schema discovery.",
        cost: "DPU-hours billed per second; first 1M objects/month in Catalog free.",
      },
      {
        name: "Step Functions",
        full: "AWS Step Functions",
        desc: "Visual workflow orchestrator — state machines for multi-step ML pipelines.",
        useCase: "Chaining Glue ETL → SageMaker training → model evaluation → conditional deploy.",
        cost: "Pay per state transition (~$0.025 per 1k transitions); Express for high-volume.",
      },
    ],
  },
  {
    id: "serving",
    label: "Model Serving",
    icon: "Endpt",
    accent: PURPLE,
    accentDim: PURPLE_DIM,
    accentBorder: PURPLE_BORDER,
    services: [
      {
        name: "SageMaker Endpoints",
        full: "SageMaker Real-Time Endpoints",
        desc: "Managed REST inference — auto-scaling, multi-model endpoints, A/B traffic splitting.",
        useCase: "Low-latency model predictions; canary deployments; shadow mode testing.",
        cost: "Instance-hours billed per second; Serverless Inference for sporadic traffic.",
      },
      {
        name: "Lambda",
        full: "AWS Lambda",
        desc: "Serverless functions — sub-second cold starts, up to 10 GB memory, container support.",
        useCase: "Lightweight inference (sklearn/XGBoost), feature lookup, webhook triggers.",
        cost: "Pay per invocation + compute time (GB-seconds); 1M free requests/month.",
      },
    ],
  },
  {
    id: "monitoring",
    label: "Monitoring",
    icon: "CW",
    accent: ORANGE,
    accentDim: ORANGE_DIM,
    accentBorder: ORANGE_BORDER,
    services: [
      {
        name: "CloudWatch",
        full: "Amazon CloudWatch",
        desc: "Metrics, logs, alarms, and dashboards for all AWS services + custom metrics.",
        useCase: "Endpoint latency/error alarms, training job logs, cost anomaly alerts.",
        cost: "Per metric, log ingestion GB, and alarm; first 10 custom metrics free.",
      },
      {
        name: "SageMaker Model Monitor",
        full: "SageMaker Model Monitor",
        desc: "Automated drift detection — data quality, model quality, bias, and feature attribution.",
        useCase: "Detecting when live traffic distribution shifts from training data baseline.",
        cost: "Processing job instance-hours; charged only when monitoring jobs run.",
      },
    ],
  },
];

// ── ML Pipeline flow steps ────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { label: "S3\nraw", color: GREEN },
  { label: "Glue\nETL", color: AMBER },
  { label: "S3\nprocessed", color: GREEN },
  { label: "SageMaker\nTraining", color: BLUE },
  { label: "S3\nmodel", color: GREEN },
  { label: "SageMaker\nEndpoint", color: PURPLE },
  { label: "CloudWatch\nMonitor", color: ORANGE },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function CategoryCard({ category, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: isActive ? category.accentDim : CARD_BG,
        border: `1px solid ${isActive ? category.accentBorder : DS.border}`,
        borderRadius: 10,
        padding: "11px 14px",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "background 0.18s, border-color 0.18s",
        outline: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 10,
            fontWeight: 700,
            color: isActive ? category.accent : DS.t3,
            background: isActive ? `${category.accent}22` : "rgba(255,255,255,0.05)",
            border: `1px solid ${isActive ? category.accentBorder : "rgba(255,255,255,0.08)"}`,
            borderRadius: 4,
            padding: "2px 6px",
            letterSpacing: 0.5,
          }}
        >
          {category.icon}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isActive ? category.accent : DS.t2,
            letterSpacing: 0.2,
          }}
        >
          {category.label}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {category.services.map((s) => (
          <span
            key={s.name}
            style={{
              fontFamily: "var(--ds-mono), monospace",
              fontSize: 9,
              color: isActive ? category.accent : DS.t3,
              opacity: isActive ? 0.85 : 0.65,
              letterSpacing: 0.3,
            }}
          >
            {s.name}
          </span>
        ))}
      </div>
    </button>
  );
}

function ServiceDetail({ service, accent, accentDim, accentBorder }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${accentBorder}`,
        borderRadius: 8,
        padding: "12px 14px",
      }}
    >
      <div style={{ marginBottom: 6 }}>
        <span
          style={{
            fontFamily: "var(--ds-mono), monospace",
            fontSize: 13,
            fontWeight: 700,
            color: accent,
            marginRight: 8,
          }}
        >
          {service.name}
        </span>
        <span style={{ fontSize: 11, color: DS.t3 }}>{service.full}</span>
      </div>
      <div style={{ fontSize: 12, color: DS.t2, lineHeight: 1.55, marginBottom: 8 }}>
        {service.desc}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <DetailRow label="DS use case" value={service.useCase} accent={accent} />
        <DetailRow label="Cost model" value={service.cost} accent={accent} />
      </div>
    </div>
  );
}

function DetailRow({ label, value, accent }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span
        style={{
          fontFamily: "var(--ds-mono), monospace",
          fontSize: 9,
          fontWeight: 700,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
          marginTop: 2,
          opacity: 0.85,
          minWidth: 72,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 11, color: DS.t3, lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

function PipelineFlow() {
  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${DS.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        marginTop: 20,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: DS.t3,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 12,
          fontFamily: "var(--ds-mono), monospace",
        }}
      >
        Typical ML Pipeline on AWS
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 4,
          rowGap: 8,
        }}
      >
        {PIPELINE_STEPS.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                background: `${step.color}18`,
                border: `1px solid ${step.color}44`,
                borderRadius: 6,
                padding: "5px 9px",
                textAlign: "center",
                minWidth: 68,
              }}
            >
              {step.label.split("\n").map((line, li) => (
                <div
                  key={li}
                  style={{
                    fontFamily: li === 0 ? "var(--ds-mono), monospace" : "var(--ds-sans), sans-serif",
                    fontSize: li === 0 ? 10 : 9,
                    fontWeight: li === 0 ? 700 : 400,
                    color: li === 0 ? step.color : DS.t3,
                    lineHeight: 1.3,
                    letterSpacing: li === 0 ? 0.3 : 0,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <span
                style={{
                  fontSize: 13,
                  color: DIM_TEXT,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: DS.t3, marginTop: 10, fontStyle: "italic" }}>
        Each arrow represents a handoff — S3 acts as the durable integration layer between steps.
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AWSDataScienceViz() {
  const [activeId, setActiveId] = useState(null);

  const activeCategory = activeId ? AWS_CATEGORIES.find((c) => c.id === activeId) : null;

  function toggleCategory(id) {
    setActiveId((prev) => (prev === id ? null : id));
  }

  return (
    <div
      style={{
        background: PANEL_BG,
        borderRadius: 14,
        padding: "20px 22px 24px",
        fontFamily: "var(--ds-sans), sans-serif",
        color: DS.t1,
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: BLUE,
            letterSpacing: 0.3,
            marginBottom: 4,
          }}
        >
          AWS Services for Data Science
        </div>
        <div style={{ fontSize: 12, color: DS.t3 }}>
          Click a category to explore services, use cases, and cost models
        </div>
      </div>

      {/* 2-column grid of category cards */}
      <div className="ds-g2"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: activeCategory ? 14 : 0,
        }}
      >
        {AWS_CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isActive={activeId === cat.id}
            onClick={() => toggleCategory(cat.id)}
          />
        ))}
      </div>

      {/* Expanded service detail */}
      {activeCategory && (
        <div
          style={{
            background: activeCategory.accentDim,
            border: `1px solid ${activeCategory.accentBorder}`,
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: activeCategory.accent,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 12,
              fontFamily: "var(--ds-mono), monospace",
            }}
          >
            {activeCategory.label} — Services
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeCategory.services.map((svc) => (
              <ServiceDetail
                key={svc.name}
                service={svc}
                accent={activeCategory.accent}
                accentDim={activeCategory.accentDim}
                accentBorder={activeCategory.accentBorder}
              />
            ))}
          </div>
        </div>
      )}

      {/* ML Pipeline flow at the bottom */}
      <PipelineFlow />
    </div>
  );
}
