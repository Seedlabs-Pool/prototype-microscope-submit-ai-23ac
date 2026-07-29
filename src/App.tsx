import React, { useState, useEffect, useRef } from 'react';

/* ---------- Types ---------- */
type ScreeningStatus = 'pass' | 'warning' | 'fail';
type ScopeFit = 'in-scope' | 'borderline' | 'out-of-scope';
type Subfield = 'Environmental' | 'Food' | 'Agricultural' | 'Medical' | 'Pharmaceutical' | 'Veterinary' | 'Soil' | 'Water' | 'Biodeterioration';

interface ScreeningItem {
  status: ScreeningStatus;
  detail: string;
}

interface Reviewer {
  name: string;
  institution: string;
  expertise: string[];
  conflict: boolean;
}

interface Manuscript {
  id: string;
  title: string;
  authors: string;
  date: string;
  classification: { field: Subfield; confidence: number }[];
  scopeFit: ScopeFit;
  scopeReason: string;
  screening: {
    plagiarism: ScreeningItem;
    methods: ScreeningItem;
    reporting: ScreeningItem;
  };
  reviewers: Reviewer[];
}

/* ---------- Mock Data ---------- */
const MANUSCRIPTS: Manuscript[] = [
  {
    id: 'm1',
    title: 'Metagenomic analysis of microbial communities in anaerobic digesters treating dairy wastewater',
    authors: 'Rodriguez et al.',
    date: 'Submitted 2 hrs ago',
    classification: [
      { field: 'Agricultural', confidence: 0.96 },
      { field: 'Environmental', confidence: 0.88 },
      { field: 'Soil', confidence: 0.42 },
    ],
    scopeFit: 'in-scope',
    scopeReason:
      'Strong fit for Agricultural and Environmental sections. Mesophilic digester study aligns with the journal scope on applied environmental microbiology.',
    screening: {
      plagiarism: { status: 'pass', detail: 'iThenticate similarity index: 4%' },
      methods: { status: 'pass', detail: 'Metagenomic protocols and statistical models fully described.' },
      reporting: { status: 'pass', detail: 'MIxS-compliant metadata and data availability statement present.' },
    },
    reviewers: [
      { name: 'Dr. Elena Varga', institution: 'Wageningen University', expertise: ['Anaerobic digestion', 'Metagenomics'], conflict: false },
      { name: 'Prof. James Chen', institution: 'Tsinghua University', expertise: ['Environmental biotech', 'Waste treatment'], conflict: false },
      { name: 'Dr. Sarah Okafor', institution: 'University of Ibadan', expertise: ['Agricultural systems', 'Biogas'], conflict: false },
    ],
  },
  {
    id: 'm2',
    title: 'Antibiotic resistance gene dissemination in retail meat products: a One Health perspective',
    authors: 'Thompson & Patel',
    date: 'Submitted 5 hrs ago',
    classification: [
      { field: 'Food', confidence: 0.91 },
      { field: 'Veterinary', confidence: 0.85 },
      { field: 'Medical', confidence: 0.67 },
    ],
    scopeFit: 'borderline',
    scopeReason:
      'Food and Veterinary microbiology fit is strong, but the absence of mechanistic clinical linkage and incomplete sampling methodology places this at the lower threshold for the Medical section.',
    screening: {
      plagiarism: { status: 'pass', detail: 'Similarity index: 6%' },
      methods: { status: 'warning', detail: 'Sampling randomization protocol not specified; qPCR primer validation incomplete.' },
      reporting: { status: 'warning', detail: 'STROBE checklist partially addressed; funding statement present.' },
    },
    reviewers: [
      { name: 'Dr. Mark Thompson', institution: 'CSIRO', expertise: ['Food safety', 'AMR surveillance'], conflict: false },
      { name: 'Prof. Aisha Patel', institution: 'Royal Veterinary College', expertise: ['Veterinary AMR', 'Zoonoses'], conflict: false },
    ],
  },
  {
    id: 'm3',
    title: 'Novel bacteriophage therapy for diabetic foot infections: a retrospective cohort study',
    authors: 'Kim et al.',
    date: 'Submitted 8 hrs ago',
    classification: [
      { field: 'Medical', confidence: 0.94 },
      { field: 'Pharmaceutical', confidence: 0.79 },
      { field: 'Veterinary', confidence: 0.31 },
    ],
    scopeFit: 'in-scope',
    scopeReason:
      'Clinical microbiology and phage therapy fit within Medical and Pharmaceutical scope. Flagged for methodological limitations that should be addressed in editorial screening.',
    screening: {
      plagiarism: { status: 'pass', detail: 'Similarity index: 3%' },
      methods: { status: 'fail', detail: 'No control arm; sample size (n=12) underpowered; phage titering protocol not standardized.' },
      reporting: { status: 'fail', detail: 'Retrospective cohort does not meet CONSORT-equivalent standards for interventional phage studies.' },
    },
    reviewers: [
      { name: 'Dr. Robert Kim', institution: 'Seoul National University Hospital', expertise: ['Clinical microbiology', 'DFI'], conflict: false },
      { name: 'Prof. Lisa Müller', institution: 'Ludwig-Maximilians-Universität', expertise: ['Phage biology', 'Therapeutic development'], conflict: false },
    ],
  },
  {
    id: 'm4',
    title: 'Quantum dot synthesis for photovoltaic applications',
    authors: 'Zhang et al.',
    date: 'Submitted 12 hrs ago',
    classification: [
      { field: 'Biodeterioration', confidence: 0.12 },
      { field: 'Environmental', confidence: 0.08 },
    ],
    scopeFit: 'out-of-scope',
    scopeReason:
      'Manuscript addresses materials chemistry and photovoltaics with no microbiology component. Recommended for transfer to a materials science or applied physics journal.',
    screening: {
      plagiarism: { status: 'pass', detail: 'Similarity index: 5%' },
      methods: { status: 'warning', detail: 'Chemical synthesis described but irrelevant to journal scope.' },
      reporting: { status: 'fail', detail: 'No biological data, methods, or reporting standards applicable.' },
    },
    reviewers: [],
  },
];

/* ---------- Icons ---------- */
const LogoIcon = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="20" cy="20" r="14" stroke="#115e59" strokeWidth="2.5" />
    <circle cx="20" cy="20" r="5" fill="#14b8a6" />
    <path d="M28 28 L34 34" stroke="#115e59" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M20 8 L20 12" stroke="#115e59" strokeWidth="2" strokeLinecap="round" />
    <path d="M20 28 L20 32" stroke="#115e59" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 20 L12 20" stroke="#115e59" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 20 L32 20" stroke="#115e59" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#115e59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const LayersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlugIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

/* ---------- Helpers ---------- */
const ScopeBadge = ({ fit }: { fit: ScopeFit }) => {
  const config = {
    'in-scope': { cls: 'in', label: 'In Scope' },
    borderline: { cls: 'borderline', label: 'Borderline Fit' },
    'out-of-scope': { cls: 'out', label: 'Out of Scope' },
  };
  const c = config[fit];
  return <span className={`scope-badge ${c.cls}`}>{c.label}</span>;
};

const ScreeningRow = ({ label, item }: { label: string; item: ScreeningItem }) => {
  const icon = item.status === 'pass' ? <CheckIcon /> : item.status === 'warning' ? <WarningIcon /> : <XIcon />;
  return (
    <div className={`screening-row ${item.status}`}>
      <div className={`screening-icon ${item.status}`}>{icon}</div>
      <div className="screening-content">
        <div className="screening-label">{label}</div>
        <div className="screening-detail">{item.detail}</div>
      </div>
    </div>
  );
};

/* ---------- App ---------- */
export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);

  const selected = MANUSCRIPTS.find((m) => m.id === selectedId);

  useEffect(() => {
    if (selectedId) {
      setShowReport(false);
      setAnalyzing(true);
      const t = setTimeout(() => {
        setAnalyzing(false);
        setShowReport(true);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [selectedId]);

  const scrollToDemo = () => demoRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#475569',
        background: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; overflow-wrap: break-word; }
        h1, h2, h3, h4, p { margin: 0; }
        button { font-family: inherit; }

        .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        @media (max-width: 640px) { .container { padding: 0 16px; } }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; border: none; cursor: pointer; transition: all 0.2s; text-decoration: none; line-height: 1; }
        .btn-primary { background: #115e59; color: #fff; }
        .btn-primary:hover { background: #0f3d3a; }
        .btn-secondary { background: #fff; color: #115e59; border: 1px solid #115e59; }
        .btn-secondary:hover { background: #f0fdfa; }

        .section { padding: 64px 0; }
        @media (max-width: 640px) { .section { padding: 40px 0; } }

        .section-title { font-size: 28px; font-weight: 700; color: #0f3d3a; margin-bottom: 12px; line-height: 1.3; }
        .section-subtitle { font-size: 17px; color: #475569; line-height: 1.6; margin-bottom: 32px; max-width: 640px; }

        .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }

        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        @media (max-width: 1024px) { .grid-4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .grid-4 { grid-template-columns: 1fr; } }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }

        /* Header */
        .header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 16px 0; position: sticky; top: 0; z-index: 50; }
        .header-inner { display: flex; align-items: center; justify-content: space-between; }
        .header-brand { display: flex; align-items: center; gap: 12px; }
        .header-text { display: flex; flex-direction: column; }
        .header-title { font-size: 18px; font-weight: 700; color: #0f3d3a; line-height: 1.2; }
        .header-tagline { font-size: 13px; color: #64748b; line-height: 1.4; }

        /* Hero */
        .hero { background: linear-gradient(180deg, #f0fdfa 0%, #f8fafc 100%); padding: 80px 0; }
        .hero-inner { max-width: 720px; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px; color: #115e59; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
        .hero-title { font-size: 42px; font-weight: 800; color: #0f3d3a; line-height: 1.2; margin-bottom: 20px; letter-spacing: -0.02em; }
        @media (max-width: 640px) { .hero-title { font-size: 32px; } }
        .hero-subtitle { font-size: 18px; color: #475569; line-height: 1.7; margin-bottom: 32px; }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

        /* Features */
        .feature-card { display: flex; flex-direction: column; gap: 12px; }
        .feature-icon { width: 44px; height: 44px; color: #115e59; background: #f0fdfa; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .feature-title { font-size: 18px; font-weight: 600; color: #1e293b; line-height: 1.3; }
        .feature-text { font-size: 15px; color: #475569; line-height: 1.6; }

        /* Integrations */
        .integrations { background: #fff; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 32px 0; text-align: center; }
        .integrations-label { font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
        .integration-pills { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
        .integration-pill { padding: 8px 16px; border-radius: 9999px; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 500; color: #475569; background: #f8fafc; }

        /* Demo */
        .demo-grid { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start; }
        @media (max-width: 1024px) { .demo-grid { grid-template-columns: 1fr; } }

        .queue-panel { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; }
        .panel-title { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }

        .queue-list { display: flex; flex-direction: column; gap: 10px; }
        .queue-item { width: 100%; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; }
        .queue-item:hover { border-color: #99f6e4; background: #f0fdfa; }
        .queue-item.active { border-color: #115e59; background: #f0fdfa; box-shadow: 0 0 0 1px #115e59; }
        .queue-item-title { font-size: 15px; font-weight: 600; color: #1e293b; display: block; margin-bottom: 6px; line-height: 1.4; }
        .queue-item-meta { font-size: 13px; color: #64748b; display: block; margin-bottom: 8px; }
        .queue-item-badge { display: inline-block; font-size: 11px; font-weight: 600; color: #115e59; background: #ccfbf1; padding: 3px 10px; border-radius: 9999px; }

        .report-panel { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px; min-height: 400px; }
        .report-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 360px; color: #64748b; gap: 12px; text-align: center; }
        .report-analyzing { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 360px; gap: 16px; color: #475569; }
        .progress-bar { width: 200px; height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; }
        .progress-fill { height: 100%; background: #115e59; width: 0%; animation: load 1.2s ease-out forwards; }
        @keyframes load { from { width: 0%; } to { width: 100%; } }
        @keyframes spin { to { transform: rotate(360deg); } }

        .report-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
        .report-section:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
        .report-section h4 { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }

        .scope-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
        .scope-badge.in { background: #d1fae5; color: #065f46; }
        .scope-badge.borderline { background: #fef3c7; color: #92400e; }
        .scope-badge.out { background: #fee2e2; color: #991b1b; }

        .report-text { font-size: 15px; color: #475569; line-height: 1.6; }

        .classification-grid { display: flex; flex-direction: column; gap: 10px; }
        .classification-header { display: flex; justify-content: space-between; font-size: 14px; font-weight: 500; color: #334155; margin-bottom: 4px; }
        .classification-bar-bg { height: 6px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; }
        .classification-bar-fill { height: 100%; background: #14b8a6; border-radius: 9999px; transition: width 0.6s ease; }

        .screening-list { display: flex; flex-direction: column; gap: 10px; }
        .screening-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-radius: 8px; background: #f8fafc; }
        .screening-row.pass { background: #f0fdf4; }
        .screening-row.warning { background: #fffbeb; }
        .screening-row.fail { background: #fef2f2; }
        .screening-icon { flex-shrink: 0; margin-top: 2px; }
        .screening-icon.pass { color: #059669; }
        .screening-icon.warning { color: #d97706; }
        .screening-icon.fail { color: #dc2626; }
        .screening-content { display: flex; flex-direction: column; gap: 2px; }
        .screening-label { font-size: 14px; font-weight: 600; color: #1e293b; }
        .screening-detail { font-size: 14px; color: #475569; line-height: 1.5; }

        .reviewer-list { display: flex; flex-direction: column; gap: 10px; }
        .reviewer-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
        .reviewer-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
        .reviewer-name { font-size: 14px; font-weight: 600; color: #1e293b; }
        .reviewer-inst { font-size: 13px; color: #64748b; }
        .conflict-badge { margin-left: auto; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; background: #d1fae5; color: #065f46; white-space: nowrap; }
        .reviewer-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag { font-size: 12px; font-weight: 500; color: #115e59; background: #f0fdfa; padding: 3px 8px; border-radius: 6px; border: 1px solid #ccfbf1; }

        /* Footer */
        .footer { background: #0f3d3a; color: #ccfbf1; padding: 56px 0; text-align: center; }
        .footer-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 12px; }
        .footer-text { font-size: 16px; color: #99f6e4; margin-bottom: 24px; max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.6; }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <div className="header-brand">
            <LogoIcon size={36} />
            <div className="header-text">
              <div className="header-title">MicroScope Submit</div>
              <div className="header-tagline">AI-Powered Editorial Triage for Microbiology Journals</div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-eyebrow">
            <LogoIcon size={20} /> MicroScope Submit
          </div>
          <h1 className="hero-title">Automate scope-matching and reviewer assignment for high-volume multidisciplinary microbiology journals.</h1>
          <p className="hero-subtitle">
            Our intelligent triage layer uses domain-tuned language models to classify submissions by subfield, flag low-fit papers, and match them to verified reviewers—before an editor opens the PDF.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" data-cta="primary" onClick={scrollToDemo}>
              Explore the Triage Engine
            </button>
            <button className="btn btn-secondary" onClick={scrollToDemo}>
              View Screening Report
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <h2 className="section-title">Built for editorial bottlenecks</h2>
          <p className="section-subtitle">MicroScope Submit addresses the four costliest friction points in multidisciplinary journal workflows.</p>
          <div className="grid-4">
            <div className="card feature-card">
              <div className="feature-icon">
                <LayersIcon />
              </div>
              <h3 className="feature-title">Automated Scope Classification</h3>
              <p className="feature-text">Instantly tag submissions into nine applied microbiology subfields with confidence scoring, replacing manual triage queues.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <ShieldIcon />
              </div>
              <h3 className="feature-title">Pre-Editorial Screening</h3>
              <p className="feature-text">Surface plagiarism risk, methods gaps, and reporting-standard violations before they reach an editor's desk.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <UsersIcon />
              </div>
              <h3 className="feature-title">Intelligent Reviewer Matching</h3>
              <p className="feature-text">Match manuscripts to verified, conflict-free experts using publication-history vectors and institutional COI checks.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <PlugIcon />
              </div>
              <h3 className="feature-title">Unified Integration Layer</h3>
              <p className="feature-text">Works alongside Editorial Manager, ScholarOne, and other major submission systems via API—no rip-and-replace required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="integrations">
        <div className="container">
          <div className="integrations-label">Seamlessly integrates with</div>
          <div className="integration-pills">
            <span className="integration-pill">Editorial Manager</span>
            <span className="integration-pill">ScholarOne Manuscripts</span>
            <span className="integration-pill">Frontiers Review</span>
            <span className="integration-pill">MDPI Manuscripts</span>
            <span className="integration-pill">Hindawi</span>
            <span className="integration-pill">eJournalPress</span>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="section" ref={demoRef} id="demo">
        <div className="container">
          <h2 className="section-title">Live Triage Simulator</h2>
          <p className="section-subtitle">Select a submission from the queue to see how MicroScope Submit classifies, screens, and routes manuscripts in seconds.</p>
          <div className="demo-grid">
            <div className="queue-panel">
              <div className="panel-title">Incoming Queue</div>
              <div className="queue-list" role="list">
                {MANUSCRIPTS.map((m) => (
                  <button
                    key={m.id}
                    className={`queue-item ${selectedId === m.id ? 'active' : ''}`}
                    onClick={() => setSelectedId(m.id)}
                    role="listitem"
                    aria-pressed={selectedId === m.id}
                  >
                    <span className="queue-item-title">{m.title}</span>
                    <span className="queue-item-meta">
                      {m.authors} • {m.date}
                    </span>
                    <span className="queue-item-badge">New</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="report-panel" aria-live="polite">
              {!selectedId && (
                <div className="report-placeholder">
                  <DocumentIcon />
                  <p style={{ fontSize: '15px', maxWidth: '280px', lineHeight: 1.5 }}>Select a manuscript from the queue to generate an AI triage report.</p>
                </div>
              )}
              {selectedId && analyzing && (
                <div className="report-analyzing">
                  <SpinnerIcon />
                  <p style={{ fontWeight: 500 }}>Analyzing scope, methods, and reviewer pool...</p>
                  <div className="progress-bar">
                    <div className="progress-fill" />
                  </div>
                </div>
              )}
              {selectedId && !analyzing && showReport && selected && (
                <div className="report-content">
                  <div className="report-section">
                    <h4>Scope Fit</h4>
                    <ScopeBadge fit={selected.scopeFit} />
                    <p className="report-text">{selected.scopeReason}</p>
                  </div>

                  <div className="report-section">
                    <h4>Subfield Classification</h4>
                    <div className="classification-grid">
                      {selected.classification.map((c) => (
                        <div key={c.field}>
                          <div className="classification-header">
                            <span>{c.field}</span>
                            <span>{Math.round(c.confidence * 100)}%</span>
                          </div>
                          <div className="classification-bar-bg">
                            <div className="classification-bar-fill" style={{ width: `${c.confidence * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-section">
                    <h4>Screening Report</h4>
                    <div className="screening-list">
                      <ScreeningRow label="Plagiarism Risk" item={selected.screening.plagiarism} />
                      <ScreeningRow label="Methods Completeness" item={selected.screening.methods} />
                      <ScreeningRow label="Reporting Compliance" item={selected.screening.reporting} />
                    </div>
                  </div>

                  {selected.reviewers.length > 0 && (
                    <div className="report-section">
                      <h4>Suggested Reviewers</h4>
                      <div className="reviewer-list">
                        {selected.reviewers.map((r) => (
                          <div key={r.name} className="reviewer-card">
                            <div className="reviewer-header">
                              <div style={{ color: '#64748b' }}>
                                <UserIcon />
                              </div>
                              <div>
                                <div className="reviewer-name">{r.name}</div>
                                <div className="reviewer-inst">{r.institution}</div>
                              </div>
                              {r.conflict === false && <span className="conflict-badge">No Conflict</span>}
                            </div>
                            <div className="reviewer-tags">
                              {r.expertise.map((e) => (
                                <span key={e} className="tag">
                                  {e}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <h2 className="footer-title">Ready to accelerate your editorial workflow?</h2>
          <p className="footer-text">See how MicroScope Submit integrates with your existing submission system to deliver faster, fairer triage.</p>
          <button className="btn btn-primary" onClick={scrollToDemo}>
            Explore the Triage Engine
          </button>
        </div>
      </footer>
    </div>
  );
}
