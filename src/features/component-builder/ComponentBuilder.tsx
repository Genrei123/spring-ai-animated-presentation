import { useRef, useState, type PointerEvent } from 'react';
import './builder.css';

const catalog = {
  chatbot: {
    name: 'Chatbot',
    icon: '◌',
    package: '@ewb/chatbot',
    description: 'A conversation for any knowledge domain.',
  },
  search: {
    name: 'Knowledge search',
    icon: '⌕',
    package: '@ewb/knowledge-search',
    description: 'Find answers and their source documents.',
  },
};
type ComponentId = keyof typeof catalog;
type ServiceId = 'finance' | 'service-desk';
type Item = { id: ComponentId; x: number; y: number; service?: ServiceId };
const services: Record<
  ServiceId,
  { name: string; knowledge: string; question: string; answer: string; source: string; y: number }
> = {
  finance: {
    name: 'Finance AI',
    knowledge: 'Expense policies · invoices · budgets',
    question: 'How do I submit an expense claim?',
    answer:
      'In this example, attach an itemized receipt, choose a cost center, and submit the claim through the expense portal for manager review.',
    source: 'Sample expense policy · Submission checklist',
    y: 100,
  },
  'service-desk': {
    name: 'Service Desk AI',
    knowledge: 'IT runbooks · VPN · application access',
    question: 'How do I troubleshoot my VPN connection?',
    answer:
      'In this example, check your internet connection, open Check Point VPN, and retry signing in. If the problem continues, capture the error and contact the Service Desk.',
    source: 'Sample IT runbook · VPN troubleshooting',
    y: 270,
  },
};
const serviceIds = Object.keys(services) as ServiceId[];
const componentIds = Object.keys(catalog) as ComponentId[];
const isComponent = (id: string): id is ComponentId => componentIds.includes(id as ComponentId);

export default function ComponentBuilder() {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<ComponentId>();
  const [connecting, setConnecting] = useState<ComponentId>();
  const [pointer, setPointer] = useState<{ x: number; y: number }>();
  const [dragOver, setDragOver] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<{ question: string; text: string; source?: string }>();
  const [notice, setNotice] = useState(
    'Start by dragging a component into the web application shell.',
  );
  const board = useRef<HTMLDivElement>(null);
  const gesture = useRef<
    { kind: 'move' | 'connect'; id: ComponentId; dx: number; dy: number } | undefined
  >(undefined);
  const active = items.find((item) => item.id === selected);
  const service = active?.service ? services[active.service] : undefined;

  function point(clientX: number, clientY: number) {
    const rect = board.current!.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 900,
      y: ((clientY - rect.top) / rect.height) * 460,
    };
  }
  function clearPreview() {
    setPrompt('');
    setAnswer(undefined);
  }
  function add(id: ComponentId, position?: { x: number; y: number }) {
    if (!items.some((item) => item.id === id)) {
      setItems((previous) => [
        ...previous,
        {
          id,
          x: Math.max(42, Math.min(190, position?.x ?? 58)),
          y: Math.max(112, Math.min(325, position?.y ?? (id === 'chatbot' ? 130 : 285))),
        },
      ]);
    }
    setSelected(id);
    clearPreview();
    setNotice(`${catalog[id].name} is in the shell. Connect its AI port to a knowledge service.`);
  }
  function connect(id: ComponentId, target: ServiceId) {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, service: target } : item)),
    );
    setSelected(id);
    setConnecting(undefined);
    setPointer(undefined);
    clearPreview();
    setNotice(`${catalog[id].name} connected to ${services[target].name}. Try the preview below.`);
  }
  function start(event: PointerEvent<HTMLButtonElement>, item: Item, kind: 'move' | 'connect') {
    if (event.button !== 0) return;
    const p = point(event.clientX, event.clientY);
    gesture.current = { kind, id: item.id, dx: p.x - item.x, dy: p.y - item.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelected(item.id);
    if (selected !== item.id) clearPreview();
    if (kind === 'connect') {
      setConnecting(item.id);
      setPointer(p);
      setNotice('Choose Finance AI or Service Desk AI to complete the connection. Escape cancels.');
    }
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current) return;
    const p = point(event.clientX, event.clientY);
    if (current.kind === 'connect') setPointer(p);
    else
      setItems((previous) =>
        previous.map((item) =>
          item.id === current.id
            ? {
                ...item,
                x: Math.max(42, Math.min(190, p.x - current.dx)),
                y: Math.max(112, Math.min(325, p.y - current.dy)),
              }
            : item,
        ),
      );
  }
  function end(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    gesture.current = undefined;
    setPointer(undefined);
    if (current?.kind !== 'connect') return;
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-service]')?.dataset.service as ServiceId | undefined;
    if (target && serviceIds.includes(target)) connect(current.id, target);
  }
  function remove(id: ComponentId) {
    setItems((previous) => previous.filter((item) => item.id !== id));
    if (selected === id) {
      setSelected(undefined);
      clearPreview();
    }
    if (connecting === id) setConnecting(undefined);
    setNotice(`${catalog[id].name} removed from the shell.`);
  }
  function ask(question: string) {
    if (!service || !question.trim()) return;
    const supported =
      question
        .trim()
        .toLowerCase()
        .replace(/[?.!]+$/, '') === service.question.toLowerCase().replace(/[?.!]+$/, '');
    setPrompt(question);
    setAnswer({
      question: question.trim(),
      text: supported
        ? service.answer
        : `This local demo has one scripted example for ${service.name}. Choose the suggested question to preview its knowledge and source.`,
      source: supported ? service.source : undefined,
    });
  }

  return (
    <main
      className="builder-page"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setConnecting(undefined);
          setPointer(undefined);
          gesture.current = undefined;
        }
      }}
    >
      <header className="builder-heading">
        <div>
          <span className="builder-eyebrow">COMPOSE YOUR AI EXPERIENCE</span>
          <h1>One component. Any knowledge.</h1>
          <p>
            Take a component from your library, drop it into your application, and connect its
            intelligence.
          </p>
        </div>
        <span className="builder-demo-badge">Interactive concept · local demo</span>
      </header>
      <div className="builder-steps" aria-label="Composition workflow">
        <span>
          <b>01</b> Publish to Azure Artifacts
        </span>
        <span>
          <b>02</b> Drag into your web shell
        </span>
        <span>
          <b>03</b> Connect a Spring AI service
        </span>
      </div>
      <div className="builder-layout">
        <aside className="builder-library">
          <span className="builder-eyebrow">COMPONENT LIBRARY</span>
          <h2>Azure Artifacts</h2>
          <p>Versioned packages, shared across application teams.</p>
          <span className="builder-feed">ewb-components / npm · example feed</span>
          {componentIds.map((id) => (
            <article
              className="builder-package"
              key={id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/x-ewb-component', id);
                event.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <div className="builder-package-top">
                <span className="builder-glyph">{catalog[id].icon}</span>
                <span className="builder-version">v1.0.0 · example</span>
              </div>
              <h3>{catalog[id].name}</h3>
              <p>{catalog[id].description}</p>
              <code>{catalog[id].package}</code>
              <button onClick={() => add(id)}>
                {items.some((item) => item.id === id) ? 'Select in shell' : '+ Add to shell'}{' '}
                <span aria-hidden="true">↗</span>
              </button>
            </article>
          ))}
          <div className="builder-library-note">
            <strong>Publish once. Reuse across teams.</strong>
            <p>
              CI publishes React packages to an npm feed and the Spring Boot starter to a Maven
              feed. The shell installs approved versions and registers them in this palette.
            </p>
            <a
              href="https://learn.microsoft.com/azure/devops/artifacts/start-using-azure-artifacts"
              target="_blank"
              rel="noreferrer"
            >
              About Azure Artifacts ↗
            </a>
          </div>
        </aside>
        <section className="builder-workspace" aria-label="Application composition">
          <div className="builder-workspace-heading">
            <div>
              <h2>Application canvas</h2>
              <p>Drag from the library. Draw from an AI port to a service, or click both ports.</p>
            </div>
            <button
              className="builder-reset"
              onClick={() => {
                setItems([]);
                setSelected(undefined);
                setConnecting(undefined);
                setPointer(undefined);
                gesture.current = undefined;
                clearPreview();
                setNotice('Canvas reset. Add a component to begin.');
              }}
            >
              Reset
            </button>
          </div>
          <div className="builder-board-scroll">
            <div
              className="builder-board"
              ref={board}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={() => {
                gesture.current = undefined;
                setPointer(undefined);
                setConnecting(undefined);
              }}
            >
              <div
                className={`builder-shell ${dragOver ? 'is-over' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'copy';
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(false);
                  const id = event.dataTransfer.getData('application/x-ewb-component');
                  if (isComponent(id)) {
                    const p = point(event.clientX, event.clientY);
                    add(id, { x: p.x - 150, y: p.y - 45 });
                  }
                }}
              >
                <div className="builder-shell-bar">
                  <span aria-hidden="true">● ● ●</span> Web application shell <span>React</span>
                </div>
                {items.length === 0 && (
                  <div className="builder-empty">
                    <span aria-hidden="true">＋</span>
                    <strong>Your application starts here</strong>
                    <p>
                      Drop a component here
                      <br />
                      or use “Add to shell”.
                    </p>
                  </div>
                )}
              </div>
              <span className="builder-services-label">SPRING AI · KNOWLEDGE SERVICES</span>
              <svg className="builder-wires" viewBox="0 0 900 460" aria-hidden="true">
                {items.map(
                  (item) =>
                    item.service && (
                      <path
                        key={item.id}
                        className={`builder-wire ${item.service}`}
                        d={`M${item.x + 300} ${item.y + 53} C560 ${item.y + 53}, 560 ${services[item.service].y + 53}, 620 ${services[item.service].y + 53}`}
                      />
                    ),
                )}
                {connecting &&
                  pointer &&
                  (() => {
                    const item = items.find((entry) => entry.id === connecting);
                    return (
                      item && (
                        <path
                          className="builder-wire pending"
                          d={`M${item.x + 300} ${item.y + 53} L${pointer.x} ${pointer.y}`}
                        />
                      )
                    );
                  })()}
              </svg>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`builder-node ${selected === item.id ? 'is-selected' : ''}`}
                  style={{ left: `${item.x / 9}%`, top: `${item.y / 4.6}%` }}
                >
                  <button
                    className="builder-node-title"
                    aria-label={`Select or move ${catalog[item.id].name}`}
                    onPointerDown={(event) => start(event, item, 'move')}
                    onClick={() => {
                      setSelected(item.id);
                      if (selected !== item.id) clearPreview();
                    }}
                  >
                    <span>{catalog[item.id].icon}</span>
                    {catalog[item.id].name}
                    <span className="builder-grip" aria-hidden="true">
                      ⠿
                    </span>
                  </button>
                  <p>{item.service ? services[item.service].name : 'No knowledge connected'}</p>
                  <button
                    className="builder-remove"
                    aria-label={`Remove ${catalog[item.id].name}`}
                    onClick={() => remove(item.id)}
                  >
                    ×
                  </button>
                  <button
                    className={`builder-port ${connecting === item.id ? 'is-connecting' : ''}`}
                    aria-label={`Connect ${catalog[item.id].name} to AI service`}
                    aria-pressed={connecting === item.id}
                    onPointerDown={(event) => start(event, item, 'connect')}
                    onClick={(event) => {
                      // Pointer activation starts on pointerdown; its click must not reopen a completed wire.
                      if (event.detail !== 0) return;
                      setConnecting(item.id);
                      setNotice(
                        'Choose Finance AI or Service Desk AI to complete the connection. Escape cancels.',
                      );
                    }}
                  >
                    AI <span aria-hidden="true">●</span>
                  </button>
                </div>
              ))}
              {serviceIds.map((id) => (
                <button
                  key={id}
                  data-service={id}
                  className={`builder-service ${id} ${connecting ? 'can-connect' : ''}`}
                  style={{ top: `${services[id].y / 4.6}%` }}
                  aria-label={`Connect to ${services[id].name}`}
                  disabled={!connecting}
                  onClick={() => connecting && connect(connecting, id)}
                >
                  <span className="builder-service-port" aria-hidden="true">
                    ●
                  </span>
                  <span className="builder-service-type">Spring AI · ChatClient + RAG</span>
                  <strong>{services[id].name}</strong>
                  <span>{services[id].knowledge}</span>
                </button>
              ))}
              <p className="builder-board-note">
                The connection selects a service, its model configuration, and its approved
                knowledge.
              </p>
            </div>
          </div>
          <div className="builder-status" role="status">
            <span aria-hidden="true">◎</span>
            {notice}
          </div>
          <div className="builder-bottom">
            <section className="builder-preview" aria-label="Component preview">
              <span className="builder-eyebrow">LIVE COMPOSITION · SCRIPTED ANSWERS</span>
              <h2>
                {active ? `${catalog[active.id].name} preview` : 'Try your connected component'}
              </h2>
              {service ? (
                <>
                  <div className={`builder-domain ${active!.service}`}>
                    {service.name}
                    <button
                      onClick={() => {
                        setItems((previous) =>
                          previous.map((item) =>
                            item.id === selected ? { ...item, service: undefined } : item,
                          ),
                        );
                        clearPreview();
                        setNotice('Connection removed. Connect another knowledge service.');
                      }}
                    >
                      Disconnect
                    </button>
                  </div>
                  <button className="builder-suggestion" onClick={() => ask(service.question)}>
                    {service.question} <span aria-hidden="true">↗</span>
                  </button>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      ask(prompt);
                    }}
                  >
                    <label className="builder-sr-only" htmlFor="builder-question">
                      Ask the connected service
                    </label>
                    <input
                      id="builder-question"
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Try the suggested question…"
                    />
                    <button disabled={!prompt.trim()} type="submit">
                      {active?.id === 'search' ? 'Search' : 'Send'}
                    </button>
                  </form>
                  {answer && (
                    <div className="builder-answer" role="status">
                      <strong>{answer.question}</strong>
                      <p>{answer.text}</p>
                      {answer.source && <span>Source: {answer.source}</span>}
                    </div>
                  )}
                </>
              ) : (
                <p className="builder-preview-empty">
                  {active
                    ? 'Connect the AI port to Finance AI or Service Desk AI to activate this preview.'
                    : 'Add a component and connect a service. The same UI will use the knowledge you choose.'}
                </p>
              )}
            </section>
            <section className="builder-contract">
              <span className="builder-eyebrow">WHAT THE CONNECTION MEANS</span>
              <h2>Same UI. Different expertise.</h2>
              <ol>
                <li>
                  <strong>Component library</strong>
                  <span>Reusable UI packages published in Azure Artifacts.</span>
                </li>
                <li>
                  <strong>Application shell</strong>
                  <span>Hosts components and saves each service binding.</span>
                </li>
                <li>
                  <strong>Spring AI backend</strong>
                  <span>
                    Uses its configured model and retrieves permitted Finance or Service Desk
                    knowledge.
                  </span>
                </li>
              </ol>
              <p>
                This demo uses example packages and local bindings. Publishing packages and calling
                deployed AI services require your Azure feed and backend configuration.
              </p>
              <a
                href="https://docs.spring.io/spring-ai/reference/api/chatclient.html"
                target="_blank"
                rel="noreferrer"
              >
                Spring AI ChatClient ↗
              </a>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
