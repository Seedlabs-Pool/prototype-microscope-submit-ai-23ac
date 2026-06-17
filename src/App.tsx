import React, { useMemo, useState } from 'react';

const palette = {
  bg: '#0f1a24',
  panel: '#ffffff',
  ink: '#10212e',
  sub: '#4a5b68',
  accent: '#1b8a7a',
  accentDark: '#0f6457',
  amber: '#b4690e',
  red: '#b3261e',
  line: '#e2e8ec',
  soft: '#eef4f3',
  muted: '#b7d6cf',
};

const subfields = [
  'Environmental',
  'Food',
  'Agricultural',
  'Medical',
  'Pharmaceutical',
  'Veterinary',
  'Soil',
  'Water',
  'Biodeterioration',
];

type Reviewer = { name: string; affil: string; expertise: string[]; pubs: number; coi: boolean };

type Sample = {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  scores: Record<string, number>;
  scopeFit: number;
  reviewers: Reviewer[];
  screening: { plagiarism: number; methods: number; standards: number; notes: string[] };
};

const SAMPLES: Sample[] = [
  {
    id: 'MS-2041',
    title: 'Antibiotic resistance gene transfer in wastewater treatment biofilms',
    authors: 'L. Okafor, R. Mehta, S. Andersen',
    abstract:
      'We characterise horizontal transfer of beta-lactamase resistance genes within activated-sludge biofilms across three municipal treatment plants, combining metagenomic sequencing with qPCR validation over a 12-month sampling window.',
    scores: { Water: 0.82, Environmental: 0.74, Medical: 0.61, Pharmaceutical: 0.33, Food: 0.12, Agricultural: 0.08, Veterinary: 0.05, Soil: 0.21, Biodeterioration: 0.07 },
    scopeFit: 0.91,
    reviewers: [
      { name: 'Dr. Anna Velasquez', affil: 'TU Delft', expertise: ['Wastewater microbiology', 'ARG monitoring'], pubs: 64, coi: false },
      { name: 'Prof. Kenji Sato', affil: 'Kyoto University', expertise: ['Biofilm metagenomics'], pubs: 91, coi: false },
      { name: 'Dr. Marwa Idris', affil: 'KAUST', expertise: ['Activated sludge', 'qPCR'], pubs: 38, coi: true },
    ],
    screening: { plagiarism: 4, methods: 92, standards: 88, notes: ['Sampling protocol fully described', 'Sequencing depth reported', 'Consider adding negative controls table'] },
  },
  {
    id: 'MS-2042',
    title: 'Probiotic Lactobacillus strains improve shelf life of fermented dairy',
    authors: 'M. Rossi, D. Chukwu',
    abstract:
      'A panel of seven Lactobacillus isolates was screened for antimicrobial activity against common dairy spoilage organisms. The lead strain extended yoghurt shelf life by 40% under refrigerated storage without affecting sensory scores.',
    scores: { Food: 0.88, Pharmaceutical: 0.41, Medical: 0.36, Agricultural: 0.29, Veterinary: 0.14, Environmental: 0.09, Water: 0.05, Soil: 0.07, Biodeterioration: 0.18 },
    scopeFit: 0.86,
    reviewers: [
      { name: 'Prof. Helena Br\u00f6ker', affil: 'Wageningen UR', expertise: ['Food fermentation', 'Probiotics'], pubs: 77, coi: false },
      { name: 'Dr. Tomas Lindgren', affil: 'Chalmers', expertise: ['Dairy spoilage', 'Sensory science'], pubs: 45, coi: false },
      { name: 'Dr. Priya Nair', affil: 'NDRI Karnal', expertise: ['Lactobacillus genomics'], pubs: 52, coi: false },
    ],
    screening: { plagiarism: 9, methods: 78, standards: 81, notes: ['Sensory panel size adequate', 'Statistical method underspecified', 'Strain deposition accession missing'] },
  },
  {
    id: 'MS-2043',
    title: 'A novel synthesis route for graphene-based supercapacitor electrodes',
    authors: 'Y. Tan, F. Costa',
    abstract:
      'We report a low-temperature chemical vapour deposition method producing porous graphene films with high specific capacitance, characterised by Raman spectroscopy and cyclic voltammetry across 10,000 charge cycles.',
    scores: { Environmental: 0.18, Water: 0.08, Medical: 0.05, Food: 0.03, Pharmaceutical: 0.04, Agricultural: 0.02, Veterinary: 0.02, Soil: 0.03, Biodeterioration: 0.06 },
    scopeFit: 0.12,
    reviewers: [],
    screening: { plagiarism: 6, methods: 84, standards: 0, notes: ['No microbiological content detected', 'Topic aligns with materials science journals', 'Recommend transfer / desk reject'] },
  },
  {
    id: 'MS-2044',
    title: 'Fungal biodeterioration of historic limestone monuments in coastal climates',
    authors: 'C. Moreau, E. Papadopoulos, N. Haddad',
    abstract:
      'Microbial communities colonising weathered limestone were profiled at six Mediterranean heritage sites. Melanised fungi correlated with surface pitting; we propose a non-invasive biocontrol treatment evaluated over 18 months.',
    scores: { Biodeterioration: 0.9, Environmental: 0.55, Soil: 0.31, Water: 0.22, Medical: 0.04, Food: 0.03, Pharmaceutical: 0.06, Agricultural: 0.11, Veterinary: 0.03 },
    scopeFit: 0.88,
    reviewers: [
      { name: 'Prof. Isabel Fonseca', affil: 'Univ. Lisboa', expertise: ['Stone biodeterioration', 'Heritage conservation'], pubs: 58, coi: false },
      { name: 'Dr. Georgios Manolis', affil: 'NCSR Demokritos', expertise: ['Melanised fungi', 'Biocontrol'], pubs: 41, coi: false },
      { name: 'Dr. Sofia Almeida', affil: 'CNR Italy', expertise: ['Microbial ecology'], pubs: 33, coi: false },
    ],
    screening: { plagiarism: 3, methods: 90, standards: 86, notes: ['Multi-site replication strong', 'Imaging metadata complete', 'Add ethics note on sampling permits'] },
  },
];

const STYLE = `
.ms-hero-grid { display: grid; gap: 28px; grid-template-columns: minmax(0,1.15fr) minmax(0,1fr); align-items: center; }
.ms-demo-grid { display: grid; grid-template-columns: minmax(0,0.85fr) minmax(0,1.15fr); gap: 20px; align-items: start; }
.ms-h1 { font-size: 38px; letter-spacing: -1px; line-height: 1.1; margin: 0 0 14px; }
@media (max-width: 720px) {
  .ms-hero-grid { grid-template-columns: 1fr; }
  .ms-demo-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .ms-h1 { font-size: 29px; letter-spacing: -0.5px; }
}
`;

function Logo() {
  return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#1b8a7a" />
      <circle cx="21" cy="21" r="9" stroke="#fff" strokeWidth="2.6" />
      <line x1="27.5" y1="27.5" x2="36" y2="36" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="21" cy="21" r="3.4" fill="#bdf0e4" />
    </svg>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ background: palette.soft, borderRadius: 6, height: 8, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${Math.round(value * 100)}%`, background: color, height: '100%', borderRadius: 6, transition: 'width .6s ease' }} />
    </div>
  );
}

function Donut({ value, label }: { value: number; label: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const color = value >= 0.7 ? palette.accent : value >= 0.4 ? palette.amber : palette.red;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke={palette.soft} strokeWidth="9" />
        <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value)} transform="rotate(-90 42 42)"
          style={{ transition: 'stroke-dashoffset .7s ease' }} />
        <text x="42" y="47" textAnchor="middle" fontSize="19" fontWeight="700" fill={palette.ink}>{Math.round(value * 100)}%</text>
      </svg>
      <span style={{ fontSize: 13, color: palette.sub, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState<Sample>(SAMPLES[0]);
  const [analyzed, setAnalyzed] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const sortedScores = useMemo(
    () => Object.entries(selected.scores).sort((a, b) => b[1] - a[1]),
    [selected]
  );

  const isAnalyzed = analyzed === selected.id;

  function runTriage() {
    setRunning(true);
    setAnalyzed(null);
    setTimeout(() => {
      setRunning(false);
      setAnalyzed(selected.id);
    }, 900);
  }

  function pick(s: Sample) {
    setSelected(s);
    setAnalyzed(null);
    setRunning(false);
  }

  const topField = sortedScores[0];
  const verdict = selected.scopeFit >= 0.7 ? 'In scope' : selected.scopeFit >= 0.4 ? 'Borderline' : 'Out of scope';
  const verdictColor = selected.scopeFit >= 0.7 ? palette.accent : selected.scopeFit >= 0.4 ? palette.amber : palette.red;

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', color: palette.ink, background: '#f4f7f7', minHeight: '100vh' }}>
      <style>{STYLE}</style>
      {/* Header */}
      <header style={{ background: palette.bg, color: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Logo />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>MicroScope Submit</div>
            <div style={{ fontSize: 13, color: palette.muted }}>AI manuscript triage &amp; scope-matching for microbiology journals</div>
          </div>
          <nav style={{ marginLeft: 'auto', display: 'flex', gap: 18, fontSize: 14, alignItems: 'center' }}>
            <a href="#demo" style={{ color: '#cfe6e1', textDecoration: 'none' }}>Live demo</a>
            <a href="#how" style={{ color: '#cfe6e1', textDecoration: 'none' }}>How it works</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(160deg,#0f1a24 0%,#13433c 100%)', color: '#fff' }}>
        <div className="ms-hero-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '54px 20px 60px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'inline-block', background: 'rgba(189,240,228,0.16)', color: '#bdf0e4', padding: '5px 12px', borderRadius: 20, fontSize: 12.5, fontWeight: 700, marginBottom: 16 }}>
              Plugs into Editorial Manager &amp; ScholarOne
            </div>
            <h1 className="ms-h1">
              Triage every submission in seconds, not days.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.5, color: '#cfe6e1', maxWidth: 520, margin: '0 0 26px' }}>
              Domain-tuned models classify each manuscript by subfield, flag out-of-scope papers, match conflict-free reviewers, and produce a structured screening report — before an editor opens it.
            </p>
            <a href="#demo" data-cta="run-triage"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: palette.accent, color: '#fff', padding: '14px 24px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 22px rgba(27,138,122,0.4)' }}>
              Try the triage demo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[['9', 'applied subfields tagged'], ['<2s', 'per-manuscript triage'], ['41%', 'less editor screening time'], ['0', 'reviewer COI slips']].map(([n, l]) => (
              <div key={l} style={{ flex: '1 1 130px', background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 16px' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#bdf0e4' }}>{n}</div>
                <div style={{ fontSize: 13, color: '#cfe6e1' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section id="demo" style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 20px 20px' }}>
        <h2 style={{ fontSize: 26, margin: '0 0 6px', letterSpacing: -0.5 }}>Interactive triage console</h2>
        <p style={{ fontSize: 15.5, color: palette.sub, margin: '0 0 24px', maxWidth: 640 }}>
          Pick an incoming manuscript from the queue, then run the AI triage to see scope-matching, routing, reviewer suggestions, and the screening report.
        </p>

        <div className="ms-demo-grid">
          {/* Queue */}
          <div style={{ background: palette.panel, borderRadius: 16, padding: 16, boxShadow: '0 2px 14px rgba(16,33,46,0.06)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: palette.sub, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>Submission queue</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {SAMPLES.map((s) => {
                const active = s.id === selected.id;
                return (
                  <button key={s.id} onClick={() => pick(s)}
                    style={{ textAlign: 'left', cursor: 'pointer', border: active ? `2px solid ${palette.accent}` : `1px solid ${palette.line}`, background: active ? palette.soft : '#fff', borderRadius: 12, padding: '12px 13px', display: 'block', width: '100%' }}>
                    <div style={{ fontSize: 11.5, color: palette.sub, fontWeight: 700 }}>{s.id}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.25, margin: '3px 0 4px', color: palette.ink }}>{s.title}</div>
                    <div style={{ fontSize: 12.5, color: palette.sub }}>{s.authors}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail */}
          <div style={{ background: palette.panel, borderRadius: 16, padding: 22, boxShadow: '0 2px 14px rgba(16,33,46,0.06)' }}>
            <div style={{ fontSize: 12, color: palette.sub, fontWeight: 700 }}>{selected.id} · {selected.authors}</div>
            <h3 style={{ fontSize: 19, margin: '4px 0 10px', lineHeight: 1.25 }}>{selected.title}</h3>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: palette.sub, margin: '0 0 18px', background: palette.soft, padding: 14, borderRadius: 10 }}>{selected.abstract}</p>

            <button onClick={runTriage} disabled={running}
              style={{ cursor: running ? 'wait' : 'pointer', background: palette.accentDark, color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              {running ? 'Analysing…' : isAnalyzed ? 'Re-run triage' : 'Run AI triage'}
            </button>

            {isAnalyzed && (
              <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
                {/* Verdict */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', borderTop: `1px solid ${palette.line}`, paddingTop: 18 }}>
                  <Donut value={selected.scopeFit} label="Scope fit" />
                  <div style={{ flex: '1 1 200px' }}>
                    <span style={{ display: 'inline-block', background: verdictColor, color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 6 }}>{verdict}</span>
                    <div style={{ fontSize: 14.5, color: palette.ink, lineHeight: 1.45 }}>
                      {selected.scopeFit >= 0.7
                        ? <>Best routed to the <strong>{topField[0]}</strong> section. Proceed to reviewer assignment.</>
                        : selected.scopeFit >= 0.4
                        ? <>Partial alignment — recommend senior editor confirmation before routing.</>
                        : <>Below scope threshold. Suggested action: <strong>desk reject / transfer</strong>.</>}
                    </div>
                  </div>
                </div>

                {/* Subfield scores */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: palette.sub, marginBottom: 10 }}>Subfield classification</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sortedScores.slice(0, 5).map(([f, v]) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 13.5, width: 110, color: palette.ink }}>{f}</span>
                        <Bar value={v} color={v >= 0.6 ? palette.accent : v >= 0.35 ? palette.amber : '#9bb0ba'} />
                        <span style={{ fontSize: 12.5, width: 36, textAlign: 'right', color: palette.sub, fontWeight: 600 }}>{Math.round(v * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviewers */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: palette.sub, marginBottom: 10 }}>Suggested reviewers</div>
                  {selected.reviewers.length === 0 ? (
                    <div style={{ fontSize: 14, color: palette.red, background: '#fbecea', borderRadius: 10, padding: 12 }}>No reviewer matching — manuscript flagged out of scope.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {selected.reviewers.map((r) => (
                        <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${palette.line}`, borderRadius: 10, padding: '10px 12px', flexWrap: 'wrap' }}>
                          <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                            <div style={{ fontSize: 14.5, fontWeight: 700 }}>{r.name}</div>
                            <div style={{ fontSize: 12.5, color: palette.sub }}>{r.affil} · {r.pubs} pubs</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: '1 1 auto' }}>
                            {r.expertise.map((e) => (
                              <span key={e} style={{ fontSize: 11.5, background: palette.soft, color: palette.accentDark, padding: '3px 9px', borderRadius: 20, fontWeight: 600 }}>{e}</span>
                            ))}
                          </div>
                          {r.coi ? (
                            <span style={{ fontSize: 12, color: palette.amber, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 16H3L12 3z" stroke={palette.amber} strokeWidth="2" strokeLinejoin="round"/><path d="M12 10v4M12 16.5v.5" stroke={palette.amber} strokeWidth="2" strokeLinecap="round"/></svg>
                              COI flagged
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: palette.accent, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={palette.accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              No conflicts
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Screening report */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: palette.sub, marginBottom: 10 }}>Screening report</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    <ScreenStat label="Plagiarism risk" value={`${selected.screening.plagiarism}%`} good={selected.screening.plagiarism < 15} invert />
                    <ScreenStat label="Methods completeness" value={`${selected.screening.methods}%`} good={selected.screening.methods >= 80} />
                    <ScreenStat label="Reporting standards" value={selected.screening.standards ? `${selected.screening.standards}%` : 'N/A'} good={selected.screening.standards >= 80} />
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selected.screening.notes.map((n) => (
                      <li key={n} style={{ fontSize: 13.5, color: palette.ink, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="9" stroke={palette.accent} strokeWidth="2"/><path d="M8.5 12l2.4 2.4 4.6-5" stroke={palette.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 60px' }}>
        <h2 style={{ fontSize: 26, margin: '0 0 22px', letterSpacing: -0.5 }}>Four steps, fully automated</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {[
            { t: 'Classify', d: 'Tag each abstract across nine applied microbiology subfields with calibrated confidence scores.' },
            { t: 'Scope-match', d: 'Flag out-of-scope or low-fit papers before they reach an editor, with a recommended action.' },
            { t: 'Route & match', d: 'Send to the right section and surface conflict-free reviewers from verified publication histories.' },
            { t: 'Screen', d: 'Generate a structured report on plagiarism risk, methods completeness, and reporting standards.' },
          ].map((s, i) => (
            <div key={s.t} style={{ background: palette.panel, borderRadius: 14, padding: 20, boxShadow: '0 2px 14px rgba(16,33,46,0.06)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: palette.soft, color: palette.accentDark, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>{i + 1}</div>
              <div style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 5 }}>{s.t}</div>
              <div style={{ fontSize: 14, color: palette.sub, lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ background: palette.bg, color: palette.muted, fontSize: 13.5, textAlign: 'center', padding: '24px 20px' }}>
        MicroScope Submit — prototype demo. Integrates with Editorial Manager, ScholarOne, Frontiers &amp; MDPI workflows.
      </footer>
    </div>
  );
}

function ScreenStat({ label, value, good, invert }: { label: string; value: string; good: boolean; invert?: boolean }) {
  const color = value === 'N/A' ? palette.sub : good ? palette.accent : palette.amber;
  return (
    <div style={{ flex: '1 1 130px', border: `1px solid ${palette.line}`, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12.5, color: palette.sub }}>{label}{invert ? ' (lower better)' : ''}</div>
    </div>
  );
}
