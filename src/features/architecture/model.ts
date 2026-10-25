export type Camera = { x: number; y: number; width: number };

export type Box = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  kind?: 'blue' | 'green' | 'amber' | 'purple' | 'plain';
  future?: boolean;
};

export const duration = 180,
  stepLength = 18;

export const overview: Camera = { x: 1460, y: 850, width: 3500 };

export const boxes: Box[] = [
  {
    id: 'uiPackage',
    x: 130,
    y: 300,
    w: 265,
    h: 150,
    title: 'AI-enabled UI',
    sub: 'Reusable components',
    kind: 'blue',
  },
  {
    id: 'starterPackage',
    x: 440,
    y: 300,
    w: 265,
    h: 150,
    title: 'Spring Boot',
    sub: 'Reusable starter',
    kind: 'amber',
  },
  {
    id: 'frontend',
    x: 130,
    y: 735,
    w: 265,
    h: 160,
    title: 'Frontend',
    sub: 'Chat UI installed',
    kind: 'blue',
  },
  {
    id: 'backend',
    x: 440,
    y: 735,
    w: 265,
    h: 160,
    title: 'Backend',
    sub: 'Starter as dependency',
    kind: 'green',
  },
  {
    id: 'chat',
    x: 1000,
    y: 205,
    w: 340,
    h: 125,
    title: 'Chat UI components',
    sub: 'One familiar interface',
    kind: 'blue',
  },
  {
    id: 'service',
    x: 1560,
    y: 205,
    w: 355,
    h: 125,
    title: 'Service Desk AI',
    sub: 'Company-specific support',
    kind: 'green',
  },
  {
    id: 'technician',
    x: 1990,
    y: 205,
    w: 355,
    h: 125,
    title: 'Technician AI',
    sub: 'Future specialist service',
    future: true,
  },
  {
    id: 'marketing',
    x: 2420,
    y: 205,
    w: 355,
    h: 125,
    title: 'Marketing AI',
    sub: 'Future specialist service',
    future: true,
  },
  {
    id: 'endpoint',
    x: 1000,
    y: 530,
    w: 355,
    h: 150,
    title: 'Chat endpoint',
    sub: 'REST API · identity + roles',
    kind: 'blue',
  },
  {
    id: 'spring',
    x: 1640,
    y: 530,
    w: 440,
    h: 150,
    title: 'Spring AI · ChatClient',
    sub: 'Context, retrieval + model calls',
    kind: 'amber',
  },
  {
    id: 'cache',
    x: 1000,
    y: 750,
    w: 355,
    h: 120,
    title: 'Answer cache',
    sub: 'Check eligibility before reuse',
    kind: 'purple',
  },
  {
    id: 'azure',
    x: 2390,
    y: 510,
    w: 400,
    h: 150,
    title: 'Azure OpenAI',
    sub: 'Model selected for the use case',
    kind: 'purple',
  },
  {
    id: 'memory',
    x: 2390,
    y: 740,
    w: 400,
    h: 135,
    title: 'Conversation memory',
    sub: 'Per employee + conversation',
    kind: 'amber',
  },
  {
    id: 'read',
    x: 990,
    y: 1070,
    w: 285,
    h: 115,
    title: 'Read tools',
    sub: 'Future integrations',
    future: true,
  },
  {
    id: 'write',
    x: 1310,
    y: 1070,
    w: 285,
    h: 115,
    title: 'Write tools',
    sub: 'Future approved actions',
    future: true,
  },
  {
    id: 'other',
    x: 1630,
    y: 1070,
    w: 285,
    h: 115,
    title: 'Other tools',
    sub: 'Excel, images, workflows',
    future: true,
  },
  {
    id: 'retriever',
    x: 2130,
    y: 1070,
    w: 660,
    h: 115,
    title: 'Retriever',
    sub: 'Relevant passages + access filters',
    kind: 'amber',
  },
  {
    id: 'appdb',
    x: 990,
    y: 1260,
    w: 925,
    h: 120,
    title: 'Application database',
    sub: 'Connected by the consuming application',
    future: true,
  },
  {
    id: 'mongo',
    x: 2130,
    y: 1260,
    w: 660,
    h: 150,
    title: 'MongoDB · Vector Search',
    sub: 'Passages, vectors + source metadata',
    kind: 'green',
  },
  {
    id: 'documents',
    x: 2130,
    y: 1500,
    w: 300,
    h: 115,
    title: 'Approved files',
    sub: 'Extract + split into passages',
    kind: 'blue',
  },
  {
    id: 'embedding',
    x: 2490,
    y: 1500,
    w: 300,
    h: 115,
    title: 'Embedding model',
    sub: 'Represent meaning as vectors',
    kind: 'purple',
  },
];

export type Edge = {
  id: string;
  d: string;
  points: [number, number][];
  label?: string;
  lx?: number;
  ly?: number;
  future?: boolean;
};

export const edges: Edge[] = [
  {
    id: 'install-ui',
    d: 'M262 450 V735',
    points: [
      [262, 450],
      [262, 735],
    ],
  },
  {
    id: 'install-starter',
    d: 'M572 450 V735',
    points: [
      [572, 450],
      [572, 735],
    ],
  },
  {
    id: 'front-back',
    d: 'M395 815 H440',
    points: [
      [395, 815],
      [440, 815],
    ],
  },
  {
    id: 'ui-service',
    d: 'M1340 267 H1560',
    points: [
      [1340, 267],
      [1560, 267],
    ],
    label: 'Select a service',
    lx: 1380,
    ly: 242,
  },
  {
    id: 'ui-future',
    d: 'M1160 205 V145 H2598 V205',
    points: [
      [1160, 205],
      [1160, 145],
      [2598, 145],
      [2598, 205],
    ],
    future: true,
  },
  {
    id: 'service-endpoint',
    d: 'M1737 330 V410 H1177 V530',
    points: [
      [1737, 330],
      [1737, 410],
      [1177, 410],
      [1177, 530],
    ],
  },
  {
    id: 'endpoint-cache',
    d: 'M1177 680 V750',
    points: [
      [1177, 680],
      [1177, 750],
    ],
  },
  {
    id: 'endpoint-spring',
    d: 'M1355 605 H1640',
    points: [
      [1355, 605],
      [1640, 605],
    ],
    label: 'On cache miss',
    lx: 1410,
    ly: 580,
  },
  {
    id: 'cache-hit',
    d: 'M1000 810 H938 V267 H1000',
    points: [
      [1000, 810],
      [938, 810],
      [938, 267],
      [1000, 267],
    ],
    label: 'Eligible answer',
    lx: 965,
    ly: 717,
  },
  {
    id: 'spring-azure',
    d: 'M2080 605 H2390',
    points: [
      [2080, 605],
      [2390, 605],
    ],
    label: 'Focused context',
    lx: 2130,
    ly: 580,
  },
  {
    id: 'azure-answer',
    d: 'M2590 510 V448 H1860 V530',
    points: [
      [2590, 510],
      [2590, 448],
      [1860, 448],
      [1860, 530],
    ],
  },
  {
    id: 'spring-memory',
    d: 'M2080 650 L2390 807',
    points: [
      [2080, 650],
      [2390, 807],
    ],
  },
  {
    id: 'spring-retriever',
    d: 'M1860 680 V968 H2460 V1070',
    points: [
      [1860, 680],
      [1860, 968],
      [2460, 968],
      [2460, 1070],
    ],
    label: 'Embed the question',
    lx: 1885,
    ly: 900,
  },
  {
    id: 'retriever-mongo',
    d: 'M2460 1185 V1260',
    points: [
      [2460, 1185],
      [2460, 1260],
    ],
  },
  {
    id: 'retrieval-return',
    d: 'M2790 1335 H2850 V925 H2015 V680',
    points: [
      [2790, 1335],
      [2850, 1335],
      [2850, 925],
      [2015, 925],
      [2015, 680],
    ],
    label: 'Permitted passages',
    lx: 2470,
    ly: 900,
  },
  {
    id: 'docs-embed',
    d: 'M2430 1557 H2490',
    points: [
      [2430, 1557],
      [2490, 1557],
    ],
  },
  {
    id: 'embed-store',
    d: 'M2640 1500 V1410',
    points: [
      [2640, 1500],
      [2640, 1410],
    ],
  },
  {
    id: 'spring-read',
    d: 'M1720 680 L1132 1070',
    points: [
      [1720, 680],
      [1132, 1070],
    ],
    future: true,
  },
  {
    id: 'spring-write',
    d: 'M1780 680 L1452 1070',
    points: [
      [1780, 680],
      [1452, 1070],
    ],
    future: true,
  },
  {
    id: 'spring-other',
    d: 'M1820 680 L1772 1070',
    points: [
      [1820, 680],
      [1772, 1070],
    ],
    future: true,
  },
  {
    id: 'read-db',
    d: 'M1132 1185 V1260',
    points: [
      [1132, 1185],
      [1132, 1260],
    ],
    future: true,
  },
  {
    id: 'write-db',
    d: 'M1452 1185 V1260',
    points: [
      [1452, 1185],
      [1452, 1260],
    ],
    future: true,
  },
];

export const steps = [
  {
    title: 'The architecture behind the conversation.',
    copy: 'Your diagram, redrawn as a working map. Follow how a question moves through the application.',
    camera: overview,
    nodes: ['chat', 'endpoint', 'spring', 'azure', 'retriever', 'mongo'],
    flows: ['endpoint-spring', 'spring-retriever', 'retriever-mongo', 'spring-azure'],
  },
  {
    title: 'Reusable components, installed by each team.',
    copy: 'The UI package and Spring Boot starter are distributed through Azure Artifacts, then added to consuming applications.',
    camera: { x: 420, y: 365, width: 1350 },
    nodes: ['uiPackage', 'starterPackage', 'frontend', 'backend'],
    flows: ['install-ui', 'install-starter', 'front-back'],
  },
  {
    title: 'The same chat experience can reach specialist AIs.',
    copy: 'The application points the chat UI at the appropriate service. Service Desk is the first use case; other specialists can follow.',
    camera: { x: 1830, y: 360, width: 2200 },
    nodes: ['chat', 'service', 'endpoint'],
    flows: ['ui-service', 'service-endpoint'],
  },
  {
    title: 'Prepare approved knowledge before questions arrive.',
    copy: 'Extract document text, split it into passages, create embeddings, and store the passages and vectors in MongoDB.',
    camera: { x: 2460, y: 1340, width: 1450 },
    nodes: ['documents', 'embedding', 'mongo'],
    flows: ['docs-embed', 'embed-store'],
  },
  {
    title: 'An employee asks about Check Point VPN.',
    copy: 'The REST endpoint checks identity and roles, then checks whether a still-valid answer can be reused.',
    camera: { x: 1420, y: 560, width: 1700 },
    nodes: ['chat', 'service', 'endpoint', 'cache'],
    flows: ['service-endpoint', 'endpoint-cache'],
  },
  {
    title: 'Retrieve the relevant, permitted passages.',
    copy: 'On a cache miss, Spring AI embeds the question and searches MongoDB by meaning, while enforcing document access rules.',
    camera: { x: 2220, y: 1000, width: 2040 },
    nodes: ['spring', 'retriever', 'mongo'],
    flows: ['spring-retriever', 'retriever-mongo', 'retrieval-return'],
  },
  {
    title: 'Generate an answer from selected evidence.',
    copy: 'Spring AI sends the question, retrieved passages and bounded conversation context to Azure OpenAI. Return guidance with source references.',
    camera: { x: 2220, y: 660, width: 1670 },
    nodes: ['spring', 'azure', 'memory'],
    flows: ['spring-memory', 'spring-azure', 'azure-answer'],
  },
  {
    title: 'A valid repeated question can skip generation.',
    copy: 'Reuse requires matching employee, service, context, permissions, knowledge version and expiry. “Fresh answer” takes the RAG path again.',
    camera: { x: 1490, y: 570, width: 1790 },
    nodes: ['chat', 'endpoint', 'cache'],
    flows: ['endpoint-cache', 'cache-hit'],
  },
  {
    title: 'Smaller document context per generated answer.',
    copy: '100 × 500-token passages become 4 retrieved passages. Retrieval keeps the model focused on the relevant evidence.',
    camera: { x: 2400, y: 1200, width: 1900 },
    nodes: ['mongo', 'retriever'],
    flows: [] as string[],
  },
  {
    title: 'Start with RAG. Extend the same foundation.',
    copy: 'Keep guidance and ticket-process links first. Later tools could support Excel automation, images and approved workflows. Model selection remains research.',
    camera: { x: 1850, y: 1080, width: 2400 },
    nodes: ['spring', 'read', 'write', 'other', 'retriever', 'appdb', 'mongo'],
    flows: ['spring-read', 'spring-write', 'spring-other', 'read-db', 'write-db'],
  },
];

export function smooth(t: number) {
  const v = Math.max(0, Math.min(1, t));
  return v * v * (3 - 2 * v);
}

export function mix(a: Camera, b: Camera, p: number): Camera {
  return {
    x: a.x + (b.x - a.x) * p,
    y: a.y + (b.y - a.y) * p,
    width: a.width + (b.width - a.width) * p,
  };
}

export function stepAt(t: number) {
  return Math.min(steps.length - 1, Math.floor(Math.max(0, t) / stepLength));
}

export function tourCamera(t: number): Camera {
  const i = stepAt(t),
    local = t - i * stepLength,
    target = steps[i].camera;
  const from =
    i === 1
      ? { x: 1920, y: 810, width: 2500 }
      : i === 2
        ? { x: 420, y: 810, width: 1350 }
        : i
          ? steps[i - 1].camera
          : overview;
  const p = smooth(local / 2.5);
  let c = mix(from, target, p);
  if (i === 0) c = mix(overview, { x: 1920, y: 810, width: 2500 }, smooth(local / 8));
  else if (i === 1 && local > 6)
    c = mix(target, { x: 420, y: 810, width: 1350 }, smooth((local - 6) / 8));
  else if (i === 9 && local > 12) c = mix(target, overview, smooth((local - 12) / 5));
  else if (local > 3) c = { ...c, width: c.width * (1 - 0.025 * smooth((local - 3) / 14)) };
  return c;
}

export function nodeCamera(id: string): Camera {
  const b = boxes.find((b) => b.id === id)!;
  return { x: b.x + b.w / 2, y: b.y + b.h / 2, width: Math.max(950, b.w * 2.7) };
}

export const descriptions: Record<string, string> = {
  uiPackage:
    'Shared AI-enabled UI components. A consuming application configures the REST endpoint for the specialist AI it needs.',
  starterPackage:
    'The shared Spring Boot starter supplies the reusable integration pattern. Each application wires its own data, tools and policies.',
  frontend:
    'The consuming frontend installs the chat component package. It carries the authenticated conversation to the configured AI service.',
  backend:
    'The consuming backend adds the starter as a dependency and configures Spring AI, knowledge retrieval and approved integrations.',
  chat: 'A reusable chat interface for the employee. The same interface can connect to Service Desk or another specialist Spring AI application.',
  service:
    'The initial application provides approved, company-specific IT guidance and links to the support process.',
  technician:
    'A future specialist Spring AI application. It uses the same UI pattern with knowledge and policies appropriate to its task.',
  marketing:
    'Another potential specialist application. Application/service routing is separate from choosing its model.',
  endpoint:
    'Verifies identity and roles before serving a request. Retrieval must also filter document access; endpoint roles alone do not authorize every passage.',
  spring:
    'Spring AI coordinates retrieval, prompt assembly, bounded conversation context and the model call. Application code implements authorization and cache eligibility.',
  cache:
    'Proposed employee-scoped answer cache. Match employee, AI service, normalized question and relevant context, current access scope, source version and expiry. Fresh answer bypasses reuse. Avoid caching live-state or personalized answers without additional checks.',
  azure:
    'Azure OpenAI provides model deployments. GPT-4o and GPT-5 remain research candidates. Evaluate quality, latency and cost before selecting; no price or final model choice is shown.',
  memory:
    'Conversation memory belongs to the authenticated employee and conversation. It supports follow-ups and is distinct from the answer cache.',
  read: 'Future read-only integrations with application data. The initial experience focuses on retrieving approved troubleshooting guidance.',
  write:
    'Future write actions need application authorization and any required approvals. Initial scope provides guidance and ticket-process links.',
  other:
    'Possible future tools include Excel automation, image generation and approved workflows. These are extensions, not initial pilot capabilities.',
  retriever:
    'Embeds the question using the same compatible embedding model as the documents, filters by access scope and retrieves relevant passages.',
  appdb:
    'The application database from your original diagram. It remains separate from MongoDB Vector Search and is connected by the application developer.',
  mongo:
    'MongoDB stores passage text, vectors and source metadata for Vector Search. Spring AI documents an Atlas integration; the exact deployment and filtering support need validation.',
  documents:
    'Collected, approved files supply the knowledge. Extraction and chunking retain source information, document versions and access metadata.',
  embedding:
    'Numerical representations support similarity search. Use compatible embedding models and vector dimensions for documents and questions. This is not chat-model training.',
};
