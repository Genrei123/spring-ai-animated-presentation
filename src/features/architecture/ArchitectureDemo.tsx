import { useEffect, useRef, useState } from 'react';
import { Diagram } from './Diagram';
import {
  boxes,
  descriptions,
  duration,
  mix,
  nodeCamera,
  overview,
  smooth,
  stepAt,
  steps,
  tourCamera,
  type Camera,
} from './model';
import reference from '../../assets/reference.png';

type Transition = { from: Camera; to: Camera; start: number };

function fmt(t: number) {
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
}

export default function ArchitectureDemo() {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false),
    [manual, setManual] = useState<Camera | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [chapters, setChapters] = useState(false),
    [referenceOpen, setReferenceOpen] = useState(false),
    [notes, setNotes] = useState(false),
    [fresh, setFresh] = useState(false),
    [corpus, setCorpus] = useState(100),
    [topK, setTopK] = useState(4),
    [reduced, setReduced] = useState(false);

  const current = useRef(time),
    playingRef = useRef(playing),
    manualRef = useRef(manual),
    transition = useRef<Transition | null>(null),
    drag = useRef<{ x: number; y: number; cam: Camera; moved: boolean } | null>(null),
    wrap = useRef<HTMLDivElement>(null);
  current.current = time;
  playingRef.current = playing;
  manualRef.current = manual;

  const index = stepAt(time);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches);
    const listener = () => setReduced(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    let id = 0,
      last = performance.now(),
      lastPaint = 0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (now - lastPaint > 1000 / 40) {
        lastPaint = now;
        if (transition.current) {
          const tr = transition.current,
            p = smooth((now - tr.start) / 900);
          setManual(mix(tr.from, tr.to, p));
          if (p === 1) transition.current = null;
        }
        if (playingRef.current) {
          const next = Math.min(duration - 0.01, current.current + dt);
          current.current = next;
          setTime(next);
          if (next >= duration - 0.02) setPlaying(false);
        }
      } else if (playingRef.current) {
        current.current = Math.min(duration - 0.01, current.current + dt);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  function jump(i: number) {
    const scene = Math.min(9, Math.max(0, i)),
      from = manualRef.current ?? tourCamera(current.current);
    setSelected(null);
    setChapters(false);
    setPlaying(false);
    setTime(scene * 18 + 3);
    if (reduced) {
      transition.current = null;
      setManual(steps[scene].camera);
    } else {
      setManual(from);
      transition.current = { from, to: steps[scene].camera, start: performance.now() };
    }
  }

  function animateTo(to: Camera) {
    const from = manualRef.current ?? tourCamera(current.current);
    setPlaying(false);
    if (reduced) {
      setManual(to);
      return;
    }
    transition.current = { from, to, start: performance.now() };
  }

  function toggle() {
    if (playing) {
      setPlaying(false);
      return;
    }
    setSelected(null);
    transition.current = null;
    setManual(null);
    if (time > 179.9) setTime(0);
    setPlaying(true);
  }

  function choose(id: string) {
    setSelected(id);
    animateTo(nodeCamera(id));
  }

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,button,summary,dialog')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        jump(Math.min(9, index + 1));
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        jump(Math.max(0, index - 1));
      }
      if (e.code === 'Escape') {
        setSelected(null);
        setChapters(false);
        setReferenceOpen(false);
        setNotes(false);
      }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setPlaying(false);
      transition.current = null;
      const cam = manualRef.current ?? tourCamera(current.current),
        r = el.getBoundingClientRect();
      const factor = Math.exp(e.deltaY * 0.001),
        width = Math.max(650, Math.min(4800, cam.width * factor));
      const px = (e.clientX - r.left - r.width / 2) / r.width,
        py = (e.clientY - r.top - r.height * 0.4222) / r.width;
      setManual({
        width,
        x: cam.x + px * (cam.width - width),
        y: cam.y + py * (cam.width - width),
      });
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, []);

  function nodeFrom(target: EventTarget | null) {
    return (target as Element)?.closest?.('[data-node]')?.getAttribute('data-node');
  }

  const cam = reduced && !manual ? steps[index].camera : (manual ?? undefined);

  return (
    <main className="app">
      <div className="stage" ref={wrap}>
        <Diagram
          time={time}
          camera={cam}
          selected={selected ?? undefined}
          cacheFresh={fresh}
          corpus={corpus}
          topK={topK}
          playing={playing}
          reducedMotion={reduced}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            drag.current = {
              x: e.clientX,
              y: e.clientY,
              cam: manual ?? tourCamera(time),
              moved: false,
            };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x,
              dy = e.clientY - d.y;
            if (Math.hypot(dx, dy) > 6) d.moved = true;
            if (d.moved) {
              setPlaying(false);
              transition.current = null;
              const r = e.currentTarget.getBoundingClientRect();
              const s = d.cam.width / r.width;
              setManual({ ...d.cam, x: d.cam.x - dx * s, y: d.cam.y - dy * s });
            }
          }}
          onPointerUp={(e) => {
            const d = drag.current;
            drag.current = null;
            if (!d?.moved) {
              const id = nodeFrom(e.target);
              if (id) choose(id);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const id = nodeFrom(e.target);
              if (id) {
                e.preventDefault();
                choose(id);
              }
            }
          }}
        />
      </div>
      <div className="view-actions">
        <button
          className="quiet"
          onClick={() => setReferenceOpen(true)}
          title="Compare with your original diagram"
        >
          Original diagram
        </button>
        <button
          className="icon-button"
          onClick={() => {
            setSelected(null);
            animateTo(overview);
          }}
          title="Zoom out to the full diagram"
          aria-label="Fit whole diagram"
        >
          ⤢
        </button>
        <button
          className="icon-button fullscreen"
          onClick={() =>
            document.fullscreenElement
              ? document.exitFullscreen()
              : document.documentElement.requestFullscreen().catch(() => {})
          }
          title="Full screen"
          aria-label="Full screen"
        >
          ⛶
        </button>
      </div>
      {!selected && !referenceOpen && !notes && index === 7 && (
        <div className="context-control">
          <button
            className={!fresh ? 'active' : ''}
            onClick={() => {
              setFresh(false);
              animateTo(steps[7].camera);
            }}
          >
            Reuse eligible answer
          </button>
          <button
            className={fresh ? 'active' : ''}
            onClick={() => {
              setFresh(true);
              animateTo({ x: 1990, y: 940, width: 2300 });
            }}
          >
            Fresh answer
          </button>
        </div>
      )}
      {!selected && !referenceOpen && !notes && index === 8 && (
        <div className="context-control sliders">
          <label>
            Collection <strong>{corpus}</strong>
            <input
              aria-label="Passages in collection"
              type="range"
              min="50"
              max="400"
              step="25"
              value={corpus}
              onChange={(e) => {
                setCorpus(+e.target.value);
                setPlaying(false);
              }}
            />
          </label>
          <label>
            Retrieved <strong>{topK}</strong>
            <input
              aria-label="Passages retrieved"
              type="range"
              min="1"
              max="10"
              value={topK}
              onChange={(e) => {
                setTopK(+e.target.value);
                setPlaying(false);
              }}
            />
          </label>
        </div>
      )}
      {selected && (
        <aside className="component-card" aria-label="Component explanation">
          <button
            className="close"
            onClick={() => setSelected(null)}
            aria-label="Close component explanation"
          >
            ×
          </button>
          <div className="component-kicker">Component</div>
          <h2>{boxes.find((b) => b.id === selected)?.title}</h2>
          <p>{descriptions[selected]}</p>
          <button
            className="text-button"
            onClick={() => {
              setSelected(null);
              transition.current = null;
              setManual(null);
            }}
          >
            Return to guided view ↗
          </button>
        </aside>
      )}
      <footer className="transport">
        <button
          className={'play ' + (playing ? 'playing' : '')}
          aria-label={playing ? 'Pause tour' : 'Play tour'}
          onClick={toggle}
        >
          {playing ? 'Ⅱ' : '▶'}
        </button>
        <button
          className="icon-button"
          onClick={() => jump(Math.max(0, index - 1))}
          aria-label="Previous scene"
        >
          ‹
        </button>
        <span className="time">
          {fmt(time)} <span>/ 3:00</span>
        </span>
        <input
          aria-label="Tour timeline"
          className="timeline"
          type="range"
          min="0"
          max="179.99"
          step=".01"
          value={time}
          onChange={(e) => {
            transition.current = null;
            setManual(null);
            setSelected(null);
            setTime(+e.target.value);
          }}
        />
        <button
          className="icon-button"
          onClick={() => jump(Math.min(9, index + 1))}
          aria-label="Next scene"
        >
          ›
        </button>
        <button
          className={'quiet scene-button ' + (chapters ? 'selected' : '')}
          onClick={() => setChapters(!chapters)}
          aria-expanded={chapters}
        >
          Scenes <span>{String(index + 1).padStart(2, '0')}</span>
        </button>
        <button
          className="icon-button"
          onClick={() => setNotes(true)}
          aria-label="Notes and controls"
        >
          ⓘ
        </button>
      </footer>
      {chapters && (
        <nav className="scene-menu" aria-label="Tour scenes">
          {steps.map((s, i) => (
            <button
              key={s.title}
              aria-current={index === i ? 'step' : undefined}
              onClick={() => jump(i)}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              {s.title}
            </button>
          ))}
        </nav>
      )}
      {referenceOpen && (
        <div className="modal-shade" onClick={() => setReferenceOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Original diagram"
            className="reference-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-top">
              <h2>Your original diagram</h2>
              <button
                className="close"
                autoFocus
                onClick={() => setReferenceOpen(false)}
                aria-label="Close original diagram"
              >
                ×
              </button>
            </div>
            <img
              src={reference}
              alt="Original architecture: Azure Artifacts distributes AI UI components and a Spring Boot starter. The starter contains a chat endpoint and Spring AI ChatClient, connected to Azure OpenAI, chat memory, read/write/other tools, an application database and a retriever/vector store."
            />
            <p>
              The redraw preserves these components and adds document preparation, answer reuse and
              MongoDB labeling.
            </p>
          </section>
        </div>
      )}
      {notes && (
        <div className="modal-shade" onClick={() => setNotes(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Notes and controls"
            className="notes-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-top">
              <h2>Explore the architecture</h2>
              <button
                className="close"
                autoFocus
                onClick={() => setNotes(false)}
                aria-label="Close notes"
              >
                ×
              </button>
            </div>
            <p>
              Play follows the diagram. Click a component to inspect it. Drag to pan, scroll to
              zoom, and use ⤢ to see the full map. Space plays or pauses; arrow keys change scenes.
            </p>
            <label className="reduced">
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />{' '}
              Reduce motion
            </label>
            <p>
              This is a scripted concept demonstration. It has no audio and does not connect to live
              bank systems. Initial scope is guidance and ticket-process links.
            </p>
            <p>
              Document permissions must be enforced during retrieval and answer reuse. Conversation
              memory and the answer cache are separate. The exact MongoDB Vector Search deployment
              and Spring AI integration require validation.
            </p>
            <p>
              The token comparison illustrates document-context reduction, not total cost savings.
              GPT-4o and GPT-5 are research candidates; no price, availability or final selection is
              asserted.
            </p>
            <p>
              Framework references:{' '}
              <a
                href="https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html"
                target="_blank"
                rel="noreferrer"
              >
                Spring AI RAG
              </a>{' '}
              ·{' '}
              <a
                href="https://docs.spring.io/spring-ai/reference/api/vectordbs/mongodb.html"
                target="_blank"
                rel="noreferrer"
              >
                MongoDB integration
              </a>
              .
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
