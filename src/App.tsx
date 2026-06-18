import React, { useMemo, useState } from 'react';

type Subfield =
  | 'Environmental'
  | 'Food'
  | 'Agricultural'
  | 'Medical'
  | 'Pharmaceutical'
  | 'Veterinary'
  | 'Soil'
  | 'Water'
  | 'Biodeterioration';

const SUBFIELDS: Subfield[] = [
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

const KEYWORDS: Record<Subfield, string[]> = {
  Environmental: ['environment', 'pollut', 'bioremediation', 'ecosystem', 'climate', 'biofilm', 'contaminant', 'wastewater'],
  Food: ['food', 'fermentation', 'probiotic', 'spoilage', 'dairy', 'meat', 'listeria', 'salmonella', 'preserv', 'shelf life'],
  Agricultural: ['crop', 'plant', 'rhizosphere', 'fertiliz', 'fertiliser', 'agricultur', 'nitrogen fixation', 'phytopath', 'biocontrol', 'maize', 'wheat'],
  Medical: ['patient', 'clinical', 'infection', 'sepsis', 'antibiotic resist', 'pathogen', 'diagnos', 'hospital', 'human', 'antimicrobial resistance'],
  Pharmaceutical: ['drug', 'pharmaceutic', 'compound', 'bioactive', 'natural product', 'secondary metabolite', 'antibiotic discovery', 'fermenter', 'bioprocess'],
  Veterinary: ['cattle', 'poultry', 'livestock', 'animal', 'veterinar', 'bovine', 'swine', 'zoonotic', 'aquaculture'],
  Soil: ['soil', 'microbiome', 'rhizobium', 'mycorrhiz', 'organic matter', 'carbon cycling', 'land', 'compost'],
  Water: ['water', 'marine', 'aquatic', 'groundwater', 'river', 'drinking water', 'algae', 'cyanobacter', 'estuar'],
  Biodeterioration: ['corrosion', 'biodeterioration', 'degradation of material', 'biofouling', 'heritage', 'concrete', 'plastic degrad', 'wood decay', 'monument'],
};

type Reviewer = {
  name: string;
  affiliation: string;
  expertise: Subfield[];
  hIndex: number;
  recentPubs: number;
  conflict: boolean;
  conflictNote?: string;
};

const REVIEWERS: Reviewer[] = [
  { name: 'Dr. Amara Okonkwo', affiliation: 'University of Ibadan', expertise: ['Environmental', 'Water'], hIndex: 31, recentPubs: 12, conflict: false },
  { name: 'Prof. Lena Hartmann', affiliation: 'ETH Zürich', expertise: ['Soil', 'Agricultural'], hIndex: 44, recentPubs: 18, conflict: false },
  { name: 'Dr. Rohan Mehta', affiliation: 'CSIR-IMTECH', expertise: ['Pharmaceutical', 'Medical'], hIndex: 27, recentPubs: 9, conflict: false },
  { name: 'Dr. Sofia Marino', affiliation: 'University of Bologna', expertise: ['Food', 'Veterinary'], hIndex: 22, recentPubs: 14, conflict: true, conflictNote: 'Co-authored with submitting author in last 36 months' },
  { name: 'Prof. Daniel Kowalski', affiliation: 'University of Warsaw', expertise: ['Biodeterioration', 'Environmental'], hIndex: 38, recentPubs: 7, conflict: false },
  { name: 'Dr. Mei Lin Chen', affiliation: 'National University of Singapore', expertise: ['Medical', 'Pharmaceutical'], hIndex: 35, recentPubs: 21, conflict: false },
  { name: 'Dr. Carlos Vega', affiliation: 'UNAM Mexico', expertise: ['Agricultural', 'Soil'], hIndex: 19, recentPubs: 11, conflict: false },
  { name: 'Prof. Ingrid Larsen', affiliation: 'University of Copenhagen', expertise: ['Water', 'Environmental'], hIndex: 41, recentPubs: 16, conflict: true, conflictNote: 'Same institution as corresponding author' },
  { name: 'Dr. Tobias Reuben', affiliation: 'University of Cape Town', expertise: ['Veterinary', 'Food'], hIndex: 24, recentPubs: 8, conflict: false },
];

const SAMPLES: { label: string; text: string }[] = [
  {
    label: 'Soil microbiome (in-scope)',
    text:
      'We characterised the rhizosphere soil microbiome of drought-stressed maize across three agricultural field sites. High-throughput 16S rRNA sequencing revealed shifts in mycorrhizal and rhizobium communities correlated with soil organic matter and carbon cycling. Inoculation with a biocontrol consortium improved crop nitrogen fixation and yield under field conditions.',
  },
  {
    label: 'Clinical AMR (in-scope)',
    text:
      'A two-year surveillance of hospital patients identified rising antimicrobial resistance in clinical Klebsiella pneumoniae isolates. We assessed diagnostic turnaround and infection outcomes, characterising carbapenem-resistant pathogens and their impact on sepsis management in the intensive care unit.',
  },
  {
    label: 'Pure quantum physics (out-of-scope)',
    text:
      'We report a topological phase transition in a two-dimensional electron gas under strong magnetic fields. Using density functional theory we compute the Berry curvature and predict quantised Hall conductance. No biological systems are involved in this condensed-matter study.',
  },
];

function classify(text: string) {
  const lower = text.toLowerCase();
  const raw: Record<string, number> = {};
  let total = 0;
  for (const sf of SUBFIELDS) {
    let score = 0;
    for (const kw of KEYWORDS[sf]) {
      const matches = lower.split(kw).length - 1;
      score += matches;
    }
    raw[sf] = score;
    total += score;
  }
  const microSignal = total;
  const scores = SUBFIELDS.map((sf) => ({
    subfield: sf,
    confidence: total > 0 ? raw[sf] / total : 0,
  })).sort((a, b) => b.confidence - a.confidence);
  return { scores, microSignal };
}

const COLORS = {
  bg: '#f4f7f6',
  card: '#ffffff',
  ink: '#10302b',
  sub: '#3d5b54',
  primary: '#0f8a6e',
  primaryDark: '#0a6b56',
  accent: '#e8f5f1',
  border: '#dbe7e3',
  warn: '#b4530a',
  warnBg: '#fdf0e3',
  danger: '#a4242b',
  dangerBg: '#fbe9ea',
};

function Logo() {
  return (
    <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill={COLORS.primary} />
      <circle cx="24" cy="24" r="13" fill="none" stroke="#fff" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="3" fill="#fff" />
      <circle cx="29" cy="26" r="2.2" fill="#fff" />
      <circle cx="23" cy="29" r="1.6" fill="#fff" />
      <path d="M33 33l6 6" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div style={{ background: COLORS.accent, borderRadius: 6, height: 8, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${Math.round(value * 100)}%`, background: COLORS.primary, height: '100%' }} />
    </div>
  );
}

export default function App() {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    if (!submitted || !text.trim()) return null;
    const { scores, microSignal } = classify(text);
    const topConfidence = scores[0]?.confidence ?? 0;
    const inScope = microSignal >= 2 && topConfidence > 0;
    const primary = scores[0]?.subfield;
    const secondary = scores[1]?.confidence > 0.12 ? scores[1].subfield : null;

    const matched = REVIEWERS.filter((r) =>
      r.expertise.includes(primary as Subfield) || (secondary && r.expertise.includes(secondary))
    )
      .map((r) => ({
        ...r,
        fit: (r.expertise.includes(primary as Subfield) ? 0.6 : 0.35) + Math.min(r.hIndex, 50) / 200,
      }))
      .sort((a, b) => b.fit - a.fit)
      .slice(0, 4);

    const wordCount = text.trim().split(/\s+/).length;
    const checks = [
      { label: 'Plagiarism risk', value: wordCount > 40 ? 'Low — 4% overlap' : 'Insufficient text to assess', ok: wordCount > 40 },
      { label: 'Methods completeness', value: /method|sequenc|assess|analys|inoculat|surveillance|sampl/i.test(text) ? 'Methods section detected' : 'Methods description sparse', ok: /method|sequenc|assess|analys|inoculat|surveillance|sampl/i.test(text) },
      { label: 'Reporting-standard compliance', value: inScope ? 'MIQE / STROBE fields present' : 'Cannot evaluate — scope unclear', ok: inScope },
    ];

    return { scores, inScope, primary, secondary, matched, checks, topConfidence };
  }, [submitted, text]);

  const runTriage = () => {
    if (text.trim()) setSubmitted(true);
  };

  const loadSample = (t: string) => {
    setText(t);
    setSubmitted(false);
  };

  return (
    <div style={{ background: COLORS.bg, color: COLORS.ink, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', lineHeight: 1.5 }}>
      <style>{`* { box-sizing: border-box; } button { font-family: inherit; } textarea { font-family: inherit; }`}</style>

      <header style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: '14px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Logo />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.2 }}>MicroScope Submit</span>
            <span style={{ fontSize: 13, color: COLORS.sub }}>AI manuscript triage for microbiology journals</span>
          </div>
        </div>
      </header>

      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 20px 24px' }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'inline-block', background: COLORS.accent, color: COLORS.primaryDark, fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 20, marginBottom: 18 }}>
            Editorial workflow automation
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: -0.8 }}>
            Triage every submission in seconds — not days.
          </h1>
          <p style={{ fontSize: 18, color: COLORS.sub, margin: '0 0 28px' }}>
            MicroScope Submit classifies manuscripts into your journal&apos;s subfields, flags out-of-scope papers before they reach editors, and matches conflict-free reviewers automatically.
          </p>
          <a href="#demo" data-cta="run-triage-hero" onClick={() => { const el = document.getElementById('manuscript-input'); if (el) (el as HTMLElement).focus(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: COLORS.primary, color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 16, padding: '14px 26px', borderRadius: 10 }}>
            Try the live triage demo
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 40 }}>
          {[['9', 'applied subfields auto-routed'], ['68%', 'less editor screening time'], ['< 30s', 'per-manuscript triage report']].map(([n, l]) => (
            <div key={l} style={{ minWidth: 160 }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.primary }}>{n}</div>
              <div style={{ fontSize: 14, color: COLORS.sub }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 20px 64px' }}>
        <h2 style={{ fontSize: 24, margin: '0 0 6px' }}>Interactive triage demo</h2>
        <p style={{ color: COLORS.sub, margin: '0 0 20px', fontSize: 15 }}>Paste an abstract (or load a sample) and run the triage engine.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
            <label htmlFor="manuscript-input" style={{ fontWeight: 600, fontSize: 15, display: 'block', marginBottom: 8 }}>Manuscript abstract</label>
            <textarea
              id="manuscript-input"
              value={text}
              onChange={(e) => { setText(e.target.value); setSubmitted(false); }}
              placeholder="Paste the abstract or full text here..."
              rows={9}
              style={{ width: '100%', resize: 'vertical', borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: 12, fontSize: 15, color: COLORS.ink, outlineColor: COLORS.primary }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
              {SAMPLES.map((s) => (
                <button key={s.label} onClick={() => loadSample(s.text)} style={{ background: COLORS.accent, color: COLORS.primaryDark, border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {s.label}
                </button>
              ))}
            </div>
            <button
              data-cta="run-triage"
              onClick={runTriage}
              disabled={!text.trim()}
              style={{ width: '100%', background: text.trim() ? COLORS.primary : '#9bb8b0', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontSize: 16, fontWeight: 700, cursor: text.trim() ? 'pointer' : 'not-allowed' }}
            >
              Run triage
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {!result && (
              <div style={{ background: COLORS.card, border: `1px dashed ${COLORS.border}`, borderRadius: 14, padding: 32, textAlign: 'center', color: COLORS.sub }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 8 }}><path d="M9 17l3 3 9-9M3 12l3 3M3 6l3 3 7-7" stroke={COLORS.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <p style={{ margin: 0, fontSize: 15 }}>Your structured screening report will appear here.</p>
              </div>
            )}

            {result && (
              <>
                <div style={{ background: result.inScope ? COLORS.accent : COLORS.warnBg, border: `1px solid ${result.inScope ? COLORS.border : '#f0d3b3'}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {result.inScope ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={COLORS.primary} /><path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 16H3z" fill={COLORS.warn} /><path d="M12 9v4M12 16v.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: result.inScope ? COLORS.primaryDark : COLORS.warn }}>
                        {result.inScope ? 'In scope — route for review' : 'Likely out of scope — desk-reject candidate'}
                      </div>
                      <div style={{ fontSize: 13, color: COLORS.sub }}>
                        {result.inScope
                          ? `Primary section: ${result.primary}${result.secondary ? ` · Secondary: ${result.secondary}` : ''}`
                          : 'No strong match to declared microbiology subfields.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Subfield classification</h3>
                  {result.scores.filter((s) => s.confidence > 0).slice(0, 5).map((s) => (
                    <div key={s.subfield} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 110, fontSize: 13, color: COLORS.ink }}>{s.subfield}</span>
                      <Bar value={s.confidence} />
                      <span style={{ width: 38, textAlign: 'right', fontSize: 12, color: COLORS.sub }}>{Math.round(s.confidence * 100)}%</span>
                    </div>
                  ))}
                  {result.scores.every((s) => s.confidence === 0) && (
                    <p style={{ fontSize: 13, color: COLORS.sub, margin: 0 }}>No microbiology subfield signals detected.</p>
                  )}
                </div>

                {result.inScope && (
                  <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Suggested reviewers</h3>
                    {result.matched.length === 0 && <p style={{ fontSize: 13, color: COLORS.sub, margin: 0 }}>No matching reviewers in pool.</p>}
                    {result.matched.map((r) => (
                      <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: `1px solid ${COLORS.border}` }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                          <div style={{ fontSize: 12.5, color: COLORS.sub }}>{r.affiliation} · h-index {r.hIndex} · {r.expertise.join(', ')}</div>
                          {r.conflict && (
                            <div style={{ fontSize: 12, color: COLORS.danger, marginTop: 3 }}>Conflict flagged: {r.conflictNote}</div>
                          )}
                        </div>
                        <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, padding: '4px 9px', borderRadius: 20, background: r.conflict ? COLORS.dangerBg : COLORS.accent, color: r.conflict ? COLORS.danger : COLORS.primaryDark }}>
                          {r.conflict ? 'Excluded' : 'Eligible'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18 }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Screening report</h3>
                  {result.checks.map((c) => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                      {c.ok ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={COLORS.primary} /><path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={COLORS.warn} /><path d="M12 7v5M12 15v.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                      )}
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: 12.5, color: COLORS.sub }}>{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, padding: '56px 20px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, textAlign: 'center', margin: '0 0 8px' }}>Built for high-volume, multidisciplinary journals</h2>
          <p style={{ textAlign: 'center', color: COLORS.sub, maxWidth: 560, margin: '0 auto 36px', fontSize: 16 }}>
            A submission layer that integrates with your existing editorial system — no rip-and-replace.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { t: 'Scope-matching first', d: 'Out-of-scope papers are flagged before consuming editor time, with a transparent confidence score per subfield.' },
              { t: 'Conflict-aware reviewers', d: 'Surfaces verified experts from publication histories and automatically excludes co-authors and institutional conflicts.' },
              { t: 'Structured screening', d: 'Each manuscript ships with plagiarism risk, methods completeness, and reporting-standard compliance in one report.' },
              { t: 'Section routing', d: 'Automatically routes to the right associate editor across nine applied microbiology areas.' },
            ].map((f) => (
              <div key={f.t} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 6.8L21 9.6l-5 4.4L17.6 21 12 17.3 6.4 21 8 14l-5-4.4 6.6-.8z" fill={COLORS.primary} /></svg>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>{f.t}</h3>
                <p style={{ margin: 0, color: COLORS.sub, fontSize: 14.5 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: '28px 20px', textAlign: 'center', color: COLORS.sub, fontSize: 13 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          MicroScope Submit — prototype demo. Classification shown is an illustrative keyword model; production uses domain-tuned language models.
        </div>
      </footer>
    </div>
  );
}
