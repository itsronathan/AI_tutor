import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./Home.css";

export default function Home() {
  const { user, loading, setShowSignIn } = useAuth();

  return (
    <div className="home-scrap">
      <div className="home-inner">
        <div className="hs-wrap">
          {/* HERO */}
          <section className="hs-hero">
            <div className="hs-hero-copy">
              <span className="hs-eyebrow">AI Tutor / Your learning workspace</span>
              <h1 className="hs-headline">
                Equal Education<br />
                for <span className="hs-mark">Everyone</span>
              </h1>
              <p className="hs-lede">
                Explore a question, develop an idea, and make your next step clear. A workspace for learning, practice, and architectural design studio.
              </p>

              {!loading && user && (
                <div className="hs-signedin">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="hs-signedin-avatar" referrerPolicy="no-referrer" />
                  ) : null}
                  <span>
                    Signed in as <strong>{user.isAnonymous ? "Guest" : user.displayName || user.email}</strong>
                  </span>
                </div>
              )}

              <div className="hs-cta-row">
                <Link to="/learning" className="hs-btn-primary">
                  {user ? "Continue to Learning Mode" : "Start learning"} <span className="hs-arrow">→</span>
                </Link>
                <span className="hs-note">Observe. Make. Question. Refine.</span>
              </div>

              <div className="hs-cta-row hs-cta-row--sub">
                <Link to="/studio" className="hs-btn-ghost">Try Studio Brainstorm →</Link>
              </div>

              {!loading && !user && (
                <div className="hs-cta-row hs-cta-row--sub">
                  <button type="button" className="hs-btn-ghost" onClick={() => setShowSignIn(true)}>
                    Sign in
                  </button>
                  <p className="hs-microcopy">
                    Open Learning Mode without an account. <span className="hs-dot">●</span> Sign in to save
                    chats &amp; sync progress.
                  </p>
                </div>
              )}
            </div>

            <figure className="hs-study-sheet" aria-label="Illustration of connected ideas and a spatial study">
              <div className="hs-sheet-label"><span>FIELD NOTES</span><span>01 / EXPLORE</span></div>
              <svg viewBox="0 0 400 300" fill="none" aria-hidden="true">
                <g stroke="currentColor" strokeWidth="1.2">
                  <path d="M65 171 192 97 336 181 209 255Z" fill="#deded3" />
                  <path d="M65 171V104L192 30V97M65 104 209 188 336 114V181M209 188V255M192 30 336 114" />
                  <path d="M106 148V106L192 56 295 116V158L209 208Z" fill="#eeeae1" />
                  <path d="m106 106 103 60 86-50M209 166v42M192 56v42l103 60M192 98l-86 50" />
                  <path d="m142 169 49-28 65 38-49 28Z" fill="#98412a" fillOpacity=".18" stroke="#98412a" />
                  <path d="M40 180 209 278 361 190M40 75v102M34 79l12-7M34 177l12-7" opacity=".4" strokeDasharray="3 4" />
                </g>
              </svg>
              <figcaption><span>FIG. 01 / FROM QUESTION TO POSSIBILITY</span><p>Start with what you know.<br />Explore what it could become.</p></figcaption>
            </figure>
          </section>

          {/* PIPELINE */}
          <section className="hs-pipeline-sec">
            <div className="hs-pipeline">
              <div className="hs-pipeline-grid">
                <div className="hs-pl-copy">
                  <span className="hs-pl-label">how your tutor thinks</span>
                  <h2>
                    Personalize your <span className="hs-hl"><span>learning.</span></span>
                  </h2>
                  <p>
                    It doesn't just answer. It pulls the exact definition or theorem from your book, lays
                    out a proof skeleton, then turns it into practice you can check.
                  </p>
                </div>
                <div className="hs-agents" aria-label="teaching pipeline">
                  <article className="hs-agent s1">
                    <div className="hs-agent-id">STEP 01 · TEXTBOOK</div>
                    <div className="hs-agent-t">Read the source</div>
                    <p>Definitions, theorems, and worked examples from your exact section get pulled into one grounded packet.</p>
                  </article>
                  <span className="hs-arrow-cx" aria-hidden />
                  <article className="hs-agent s2">
                    <div className="hs-agent-id">STEP 02 · PLAN</div>
                    <div className="hs-agent-t">Build the proof skeleton</div>
                    <p>Cases, base &amp; inductive steps, and the formulas you'll need get ordered like a study guide before any prose.</p>
                  </article>
                  <span className="hs-arrow-cx" aria-hidden />
                  <article className="hs-agent s3">
                    <div className="hs-agent-id">STEP 03 · CHECK</div>
                    <div className="hs-agent-t">Teach, then test</div>
                    <p>The explanation becomes truth tables and practice problems — not a paragraph you trust blindly.</p>
                  </article>
                </div>
              </div>
            </div>
          </section>

          {/* TOOLS */}
          <section className="hs-tools">
            <div className="hs-tools-head">
              <h2>Choose your workspace.</h2>
              <p>Move from understanding a question to developing your response.</p>
            </div>
            <div className="hs-tools-grid">
              <Link to="/learning" className="hs-tool">
                <span className="hs-tab">01 / UNDERSTAND</span>
                <div className="hs-ic">∴</div>
                <h3>Learning Mode</h3>
                <p>Ask in plain language. Get a textbook-matched explanation, step by step, with your topic checklist on the side.</p>
                <span className="hs-go">Start learning <span className="hs-arrow">→</span></span>
              </Link>
              <Link to="/studio" className="hs-tool">
                <span className="hs-tab">02 / EXPLORE</span>
                <div className="hs-ic" aria-hidden="true">⌑</div>
                <h3>Studio Brainstorm</h3>
                <p>Start with your assignment, explore design directions, and organize concepts, requirements, and critique notes.</p>
                <span className="hs-go">Enter the studio <span className="hs-arrow">→</span></span>
              </Link>
              <Link to="/autograder" className="hs-tool">
                <span className="hs-tab">03 / PRACTICE</span>
                <div className="hs-ic">✓</div>
                <h3>Auto Grader</h3>
                <p>Drop a Question PDF and an Answer PDF. Get structured, criterion-by-criterion grading on proofs and problem sets.</p>
                <span className="hs-go">Grade a paper <span className="hs-arrow">→</span></span>
              </Link>
              <Link to="/profile" className="hs-tool">
                <span className="hs-tab">04 / ORGANIZE</span>
                <div className="hs-ic">☺</div>
                <h3>My profile</h3>
                <p>Your textbooks, appearance, and saved progress — synced across every session once you sign in.</p>
                <span className="hs-go">Open profile <span className="hs-arrow">→</span></span>
              </Link>
            </div>
          </section>
        </div>

        {/* ACES YOUR EXAMS */}
        <footer className="hs-acefoot">
          <div className="hs-acefoot-inner">
            <div className="hs-acefoot-grid">
              <div>
                <span className="hs-ace-eyebrow">YOUR NEXT STEP</span>
                <h2>Make room for your next idea.</h2>
                <p className="hs-ace-sub">Your questions, your process, your workspace.</p>
                {user ? (
                  <Link to="/learning" className="hs-btn-create">
                    Continue learning <span>→</span>
                  </Link>
                ) : (
                  <button type="button" className="hs-btn-create" onClick={() => setShowSignIn(true)}>
                    Create an account <span>→</span>
                  </button>
                )}
                <div className="hs-ace-meta">© 2026 AI Tutor · equal education for everyone</div>
              </div>
              <aside className="hs-ace-checklist" aria-label="Learning process">
                
                <h3>A process to return to</h3>
                <ul>
                  <li>Understand the question</li>
                  <li>Explore and test an idea</li>
                  <li>Reflect on the next step</li>
                </ul>
              </aside>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
