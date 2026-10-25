export const FLOW_STEP = 14;

export const FLOW_SPLIT = 70;

export const FLOW_DURATION = 154;

export type ExampleId = 'vpn' | 'access';

export type Example = {
  file: string;
  question: string;
  body: string;
  chunks: string[];
  answer: string;
  terms: RegExp;
};

export const examples: Record<ExampleId, Example> = {
  vpn: {
    file: 'VPN support guide.pdf',
    question: 'I cannot connect using Check Point Mobile. What should I do?',
    body: 'The example VPN client is Check Point Mobile. Start with the company VPN troubleshooting guide. Record the exact error message and the time it occurred. Include any approved checks you have already completed. If the issue remains unresolved, contact Service Desk through the approved support channel.',
    chunks: [
      'The example VPN client is Check Point Mobile. Start with the company VPN troubleshooting guide.',
      'Start with the company VPN troubleshooting guide. Record the exact error message and the time it occurred. Include any approved checks you have already completed.',
      'Include any approved checks you have already completed. If the issue remains unresolved, contact Service Desk through the approved support channel.',
    ],
    answer:
      'Start with the company VPN troubleshooting guide. Record the exact error message and when it occurred. Include the approved checks you have completed. If the issue remains unresolved, contact Service Desk through the approved support channel.',
    terms: /vpn|check\s*point/i,
  },
  access: {
    file: 'Application access guide.pdf',
    question: 'I cannot access an internal application. How do I request help?',
    body: 'Internal application access follows the approved request process. Identify the application and the access needed. Include the error message and the business reason for the request. Submit the request through the approved ticket channel. Access changes require review by the responsible team.',
    chunks: [
      'Internal application access follows the approved request process. Identify the application and the access needed.',
      'Identify the application and the access needed. Include the error message and the business reason for the request. Submit the request through the approved ticket channel.',
      'Submit the request through the approved ticket channel. Access changes require review by the responsible team.',
    ],
    answer:
      'Identify the application and the access you need. Include the error message and business reason, then submit the request through the approved ticket channel. The responsible team reviews any access change.',
    terms: /access|application|permission/i,
  },
};

export const vectors = [
  '[0.21, −0.08, 0.54, …]',
  '[0.19, 0.42, −0.11, …]',
  '[−0.05, 0.37, 0.68, …]',
];

export const flowScenes = [
  {
    title: 'Load an approved file.',
    copy: 'An approved PDF enters the ingestion pipeline with its source and document version.',
    short: 'Load files',
    detail:
      'Files are collected and approved before ingestion. A real ingestion service would validate files and retain their source identity.',
  },
  {
    title: 'Extract the document text.',
    copy: 'The ingestion service reads the file and keeps its readable text, source name and document version together.',
    short: 'Extract text',
    detail:
      'Text extraction turns the PDF into readable content. Source information stays attached so later answers can point back to the document. Scanned files may need a separate OCR step.',
  },
  {
    title: 'Split the text into searchable chunks.',
    copy: 'The paragraph becomes smaller passages. A little shared context is repeated across boundaries so related instructions stay connected.',
    short: 'Create chunks',
    detail:
      'The chunks below are actual substrings of the sample text. Neighboring chunks deliberately share a sentence. Chunk size and overlap are implementation choices, not a fixed Spring AI requirement.',
  },
  {
    title: 'Create an embedding for each chunk.',
    copy: 'An embedding model represents each passage numerically. These vectors support similarity search; they do not train the chat model.',
    short: 'Embed chunks',
    detail:
      'Each chunk receives a vector representing its meaning. The real vector dimensions and values depend on the embedding model.',
  },
  {
    title: 'Store the passages, vectors and source information.',
    copy: 'MongoDB keeps each chunk with its embedding and metadata. The prepared collection is now available to the retrieval pipeline.',
    short: 'Store in MongoDB',
    detail:
      'The example record includes text, embedding, source, version and access scope. The exact MongoDB Vector Search deployment, index configuration and Spring AI integration must be validated.',
  },
  {
    title: 'An employee types a question.',
    copy: 'The chat UI sends the question and conversation information to the application. The same prepared knowledge will support the response.',
    short: 'Type a prompt',
    detail:
      'This is a scripted prompt demonstration, not a connected AI chatbot. Edit the sample prompt and select Send demo prompt to replay the request. Questions outside the selected example take the no-evidence path.',
  },
  {
    title: 'Check access, then represent the question for search.',
    copy: 'The application verifies the employee and checks answer reuse. For this fresh request, it creates a question embedding using the compatible model.',
    short: 'Authorize request',
    detail:
      'Endpoint access and document access are separate checks. This example follows a cache miss. Query embeddings must be compatible with the model and dimensions used for the stored document embeddings.',
  },
  {
    title: 'Retrieve relevant passages the employee may access.',
    copy: 'MongoDB Vector Search returns selected evidence. The application applies document access filters; unrelated or unauthorized passages stay out.',
    short: 'Retrieve evidence',
    detail:
      'The demonstration selects C02 and C03 from the current sample. This selection is scripted, not a live semantic-search result. A real retriever uses the query vector, configured relevance criteria and access metadata.',
  },
  {
    title: 'Build a focused input for the chat model.',
    copy: 'Spring AI brings together instructions, the employee’s question and the selected passages. The whole document collection is not sent.',
    short: 'Assemble context',
    detail:
      'RAG adds retrieved evidence to the model input. Conversation context can also be included within a bounded budget. System instructions, output, embedding calls, search and infrastructure still contribute to cost.',
  },
  {
    title: 'Generate a response with Azure OpenAI.',
    copy: 'The chat model receives the focused input and produces an answer grounded in the selected passages. Model choice remains configurable.',
    short: 'Generate answer',
    detail:
      'This is the chat generation call, separate from embedding calls. The response is scripted in this demonstration. Production answers need grounding checks and a clear escalation path when evidence is insufficient.',
  },
  {
    title: 'Return the answer and its sources to the employee.',
    copy: 'The chat UI displays the guidance and source references. The employee can inspect the evidence and follow the approved support process.',
    short: 'Return + cite',
    detail:
      'The example answer cites chunks C02 and C03. A real application should return traceable references and explain when it lacks sufficient evidence. It should never imply an access approval has happened just because an answer was generated.',
  },
];

export const flowIndex = (t: number) => Math.min(10, Math.floor(Math.max(0, t) / FLOW_STEP));

export const flowEase = (t: number) => {
  const p = Math.max(0, Math.min(1, t));
  return p * p * (3 - 2 * p);
};

export type FlowOptions = {
  example: ExampleId;
  prompt: string;
  reduced?: boolean;
  selectedChunk?: number;
};

export const defaultFlowOptions: FlowOptions = {
  example: 'vpn',
  prompt: examples.vpn.question,
};

export function hasEvidence(o: FlowOptions) {
  return examples[o.example].terms.test(o.prompt);
}

export function flowAnswer(o: FlowOptions) {
  return hasEvidence(o)
    ? examples[o.example].answer
    : 'No matching source is available in this example collection. Contact Service Desk through the approved support channel for help.';
}
