import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { drawFlow, type Hotspot } from './flow-renderer';
import {
  examples,
  vectors,
  flowIndex,
  flowScenes,
  FLOW_DURATION,
  FLOW_STEP,
  hasEvidence,
  type ExampleId,
} from './flow-data';

const clock = (t: number) => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');

export default function FlowDemo() {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(false),
    [example, setExample] = useState<ExampleId>('vpn'),
    [prompt, setPrompt] = useState(examples.vpn.question),
    [draft, setDraft] = useState(examples.vpn.question),
    [composer, setComposer] = useState(false),
    [scenes, setScenes] = useState(false),
    [selected, setSelected] = useState<number | null>(null),
    [notes, setNotes] = useState(false),
    [reduced, setReduced] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    timer = useRef(0),
    playRef = useRef(false),
    hits = useRef<Hotspot[]>([]);
  timer.current = time;
  playRef.current = playing;
  const index = flowIndex(time),
    files = index < 5;
  useEffect(() => {
    const q = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(q.matches);
    const change = () => setReduced(q.matches);
    q.addEventListener('change', change);
    return () => q.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    let id = 0,
      last = performance.now(),
      paint = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playRef.current) {
        timer.current = Math.min(FLOW_DURATION - 0.01, timer.current + dt);
        if (now - paint >= 1000 / 35) {
          paint = now;
          setTime(timer.current);
        }
        if (timer.current >= FLOW_DURATION - 0.02) {
          setTime(FLOW_DURATION - 0.01);
          setPlaying(false);
        }
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);
  useLayoutEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (context) hits.current = drawFlow(context, time, { example, prompt, reduced });
  }, [time, example, prompt, reduced]);
  function jump(i: number, play = true) {
    const t = Math.max(0, Math.min(10, i)) * FLOW_STEP + (play ? 0.01 : 9);
    timer.current = t;
    setTime(t);
    setPlaying(play);
    setScenes(false);
    setSelected(null);
    setNotes(false);
    setComposer(false);
  }
  function toggle() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (time > FLOW_DURATION - 1) {
      timer.current = 0;
      setTime(0);
    }
    setPlaying(true);
  }
  function changeExample(v: ExampleId) {
    setExample(v);
    setPrompt(examples[v].question);
    setDraft(examples[v].question);
    jump(0, false);
    setTime(0);
    timer.current = 0;
  }
  function submit() {
    setPrompt(draft.trim() || examples[example].question);
    jump(5, true);
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input,textarea,button,select')) return;
      if (e.key === 'Escape') {
        setSelected(null);
        setNotes(false);
        setComposer(false);
        setScenes(false);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        jump(Math.min(10, index + 1), false);
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        jump(Math.max(0, index - 1), false);
      }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  });
  return (
    <main className="app flow-app">
      <div className="stage flow-stage">
        <canvas
          ref={canvas}
          width="1600"
          height="900"
          role="img"
          aria-label={
            !hasEvidence({ example, prompt }) && index >= 8
              ? 'No matching evidence. Explain the limit and refer the employee to Service Desk.'
              : flowScenes[index].title + ' ' + flowScenes[index].copy
          }
          tabIndex={0}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect(),
              x = ((e.clientX - r.left) * 1600) / r.width,
              y = ((e.clientY - r.top) * 900) / r.height,
              h = hits.current.find(
                (v) => x >= v.x && x <= v.x + v.w && y >= v.y && y <= v.y + v.h,
              );
            if (h?.id.startsWith('scene-')) jump(+h.id.slice(6));
            if (h?.id.startsWith('chunk-')) {
              setSelected(+h.id.slice(6));
              setPlaying(false);
            }
          }}
        />
      </div>
      <div className="flow-switch" role="group" aria-label="Data flow">
        <button aria-pressed={files} onClick={() => jump(0)}>
          Files → knowledge
        </button>
        <button aria-pressed={!files} onClick={() => jump(5)}>
          Prompt → answer
        </button>
      </div>
      <div className="view-actions flow-actions">
        <label className="example-label">
          Example{' '}
          <select
            aria-label="Select example document"
            value={example}
            onChange={(e) => changeExample(e.target.value as ExampleId)}
          >
            <option value="vpn">VPN support</option>
            <option value="access">Application access</option>
          </select>
        </label>
        <button
          className="quiet"
          onClick={() => {
            setSelected(index === 4 || index >= 7 ? 1 : 0);
            setPlaying(false);
          }}
        >
          Inspect chunks
        </button>
        <button
          className="icon-button"
          aria-label="Flow notes"
          onClick={() => {
            setNotes(true);
            setPlaying(false);
          }}
        >
          ⓘ
        </button>
      </div>
      <footer className="transport">
        <button
          className="play"
          aria-label={playing ? 'Pause data flow' : 'Play data flow'}
          onClick={toggle}
        >
          {playing ? 'Ⅱ' : '▶'}
        </button>
        <button
          className="icon-button"
          aria-label="Previous flow stage"
          onClick={() => jump(index - 1, false)}
        >
          ‹
        </button>
        <span className="time">
          {clock(time)} <span>/ 2:34</span>
        </span>
        <input
          className="timeline"
          aria-label="Data flow timeline"
          type="range"
          min="0"
          max={FLOW_DURATION - 0.01}
          step=".05"
          value={time}
          onChange={(e) => {
            timer.current = +e.target.value;
            setTime(+e.target.value);
            setPlaying(false);
            setSelected(null);
          }}
        />
        <button
          className="icon-button"
          aria-label="Next flow stage"
          onClick={() => jump(index + 1, false)}
        >
          ›
        </button>
        <button
          className="quiet flow-prompt-button"
          onClick={() => {
            setComposer(!composer);
            setPlaying(false);
          }}
        >
          Try a prompt
        </button>
        <button
          className="quiet scene-button"
          aria-expanded={scenes}
          onClick={() => setScenes(!scenes)}
        >
          Stages <span>{index + 1}</span>
        </button>
      </footer>
      {scenes && (
        <nav className="scene-menu" aria-label="Data flow stages">
          {flowScenes.map((s, i) => (
            <button
              key={s.title}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => jump(i)}
            >
              <span>
                {i < 5 ? 'F' : 'Q'}
                {i < 5 ? i + 1 : i - 4}
              </span>
              {s.title}
            </button>
          ))}
        </nav>
      )}
      {composer && (
        <form
          className="flow-composer"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="dialog-top">
            <h2>Try the prompt flow</h2>
            <button
              className="close"
              type="button"
              aria-label="Close prompt editor"
              onClick={() => setComposer(false)}
            >
              ×
            </button>
          </div>
          <label htmlFor="demo-prompt">Employee question</label>
          <textarea
            id="demo-prompt"
            value={draft}
            maxLength={220}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="composer-footer">
            <p>Scripted example. Unsupported questions take the no-evidence path.</p>
            <button className="send-demo" type="submit">
              Send demo prompt ↗
            </button>
          </div>
        </form>
      )}
      {selected !== null && (
        <aside className="component-card flow-record" aria-label="Stored chunk">
          <button
            className="close"
            aria-label="Close chunk inspector"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <div className="component-kicker">Example record</div>
          <h2>Chunk C0{selected + 1}</h2>
          <div className="chunk-picker" role="group" aria-label="Select chunk">
            {[0, 1, 2].map((i) => (
              <button key={i} aria-pressed={selected === i} onClick={() => setSelected(i)}>
                C0{i + 1}
              </button>
            ))}
          </div>
          <p className="record-text">{examples[example].chunks[selected]}</p>
          <dl>
            <dt>Source</dt>
            <dd>{examples[example].file}</dd>
            <dt>Version</dt>
            <dd>1</dd>
            <dt>Access scope</dt>
            <dd>employee-support</dd>
            <dt>Embedding</dt>
            <dd className="vector-text">{vectors[selected]}</dd>
          </dl>
          <p className="record-small">
            The same chunk IDs follow the data through storage, retrieval and citations.
          </p>
        </aside>
      )}
      {notes && (
        <div className="modal-shade" onClick={() => setNotes(false)}>
          <section
            className="notes-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Data flow notes"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-top">
              <h2>Two connected flows</h2>
              <button
                className="close"
                autoFocus
                aria-label="Close data flow notes"
                onClick={() => setNotes(false)}
              >
                ×
              </button>
            </div>
            <p>
              <strong>Files → knowledge:</strong> approved files are read, split into passages,
              embedded and stored in MongoDB with source and access metadata. Ingestion runs when
              documents are added or changed.
            </p>
            <p>
              <strong>Prompt → answer:</strong> the application checks access, embeds the question,
              retrieves permitted passages, assembles the focused model input and returns an answer
              with sources.
            </p>
            <p>{flowScenes[index].detail}</p>
            <p>
              This is a local scripted animation. It does not upload files, call an AI model or
              query a live database. Questions outside the selected example take a no-evidence
              handoff path.
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
              The chat model is not trained by this pipeline. Embedding and chat generation are
              separate calls. Retrieval must enforce document access; an endpoint role alone is
              insufficient. The exact MongoDB Vector Search deployment and compatible embedding
              model require validation.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
