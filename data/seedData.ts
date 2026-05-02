import { Vocabulary } from '../types';
import { useVocabStore } from '../stores/vocabStore';

const now = new Date();

const make = (
  id: string,
  term: string,
  definition: string,
  example: string,
  category: Vocabulary['category'],
  difficulty: Vocabulary['difficulty'],
  relatedTerms: string[] = []
): Vocabulary => ({
  id,
  term,
  definition,
  example,
  category,
  difficulty,
  relatedTerms,
  createdAt: now,
  source: 'AI-generated',
  approved: true,
});

export const SEED_VOCABULARIES: Vocabulary[] = [
  // AI / ML
  make(
    'ai-001',
    'Transformer',
    'A neural network architecture that uses self-attention to model relationships in sequence data, powering most modern language models.',
    'GPT-4 is built on a decoder-only Transformer architecture.',
    'AI/ML',
    3,
    ['Self-Attention', 'BERT', 'GPT', 'Encoder-Decoder']
  ),
  make(
    'ai-002',
    'Embedding',
    'A dense vector representation of data (text, image, audio) where semantic similarity maps to geometric closeness.',
    'We compared user queries to document embeddings using cosine similarity.',
    'AI/ML',
    2,
    ['Vector', 'Cosine Similarity', 'Latent Space']
  ),
  make(
    'ai-003',
    'Gradient Descent',
    'An iterative optimization algorithm that updates parameters in the opposite direction of the loss gradient to minimize error.',
    'We used stochastic gradient descent with momentum to train the network.',
    'AI/ML',
    3,
    ['Backpropagation', 'Loss Function', 'Learning Rate']
  ),
  make(
    'ai-004',
    'Overfitting',
    'A modeling error where the model learns the training data — including noise — too well and fails to generalize.',
    'The 99% train accuracy and 60% test accuracy was a textbook sign of overfitting.',
    'AI/ML',
    2,
    ['Regularization', 'Dropout', 'Validation']
  ),
  make(
    'ai-005',
    'Fine-Tuning',
    'Adapting a pretrained model to a specific task or domain by continuing training on task-specific data.',
    'We fine-tuned LLaMA on legal documents to improve contract review.',
    'AI/ML',
    3,
    ['Transfer Learning', 'LoRA', 'PEFT']
  ),
  make(
    'ai-006',
    'Hallucination',
    'When a generative model produces output that sounds plausible but is factually wrong or unsupported.',
    'The chatbot hallucinated a court case that did not exist.',
    'AI/ML',
    2,
    ['Grounding', 'RAG', 'Confabulation']
  ),

  // Agentic AI
  make(
    'agent-001',
    'Agent Loop',
    'The cycle in which an autonomous agent observes state, plans, calls tools, and updates its memory until a goal is reached.',
    'Each iteration of the agent loop costs roughly 4k tokens.',
    'Agentic AI',
    3,
    ['ReAct', 'Tool Use', 'Planner']
  ),
  make(
    'agent-002',
    'Tool Use',
    'The capability of an LLM to invoke external functions, APIs, or code in order to act on the world.',
    'The agent used the calendar tool to schedule the meeting.',
    'Agentic AI',
    2,
    ['Function Calling', 'Plugins', 'MCP']
  ),
  make(
    'agent-003',
    'RAG',
    'Retrieval-Augmented Generation: grounding model output in retrieved documents to reduce hallucination.',
    'Our RAG pipeline retrieves the top 5 chunks from Pinecone before generating.',
    'Agentic AI',
    3,
    ['Embedding', 'Vector DB', 'Chunking']
  ),
  make(
    'agent-004',
    'MCP',
    'Model Context Protocol — an open standard for exposing tools, resources, and prompts to LLMs over a structured interface.',
    'We wrapped the GitHub API as an MCP server so any client could read issues.',
    'Agentic AI',
    4,
    ['Tool Use', 'Resources', 'Anthropic']
  ),
  make(
    'agent-005',
    'Multi-Agent System',
    'A system where several specialized agents coordinate, often via messages or shared memory, to solve a complex task.',
    'A planner agent delegated subtasks to coder and reviewer agents.',
    'Agentic AI',
    4,
    ['Orchestrator', 'Swarm', 'Delegation']
  ),

  // Backend
  make(
    'be-001',
    'Idempotent',
    'An operation that yields the same result whether executed once or many times with the same input.',
    'PUT is idempotent; POST usually is not.',
    'Backend',
    2,
    ['HTTP', 'REST', 'Retries']
  ),
  make(
    'be-002',
    'Webhook',
    'A user-defined HTTP callback fired by a service when a specific event happens.',
    'Stripe sends a webhook to /api/stripe whenever a payment succeeds.',
    'Backend',
    1,
    ['Callback', 'Event-Driven', 'Polling']
  ),
  make(
    'be-003',
    'GraphQL',
    'A query language for APIs that lets clients request exactly the fields they need from a typed schema.',
    'Our GraphQL endpoint replaced 12 REST routes with one.',
    'Backend',
    3,
    ['REST', 'Schema', 'Resolver']
  ),
  make(
    'be-004',
    'Message Queue',
    'A buffer that decouples producers and consumers, letting work be processed asynchronously and reliably.',
    'We pushed image-resize jobs onto a SQS queue.',
    'Backend',
    3,
    ['Kafka', 'RabbitMQ', 'Producer/Consumer']
  ),
  make(
    'be-005',
    'Rate Limiting',
    'A control that caps how many requests a client can make in a time window, protecting upstream services.',
    'We rate-limited the public API to 60 requests per minute per IP.',
    'Backend',
    2,
    ['Token Bucket', 'Leaky Bucket', '429']
  ),

  // Frontend
  make(
    'fe-001',
    'Hydration',
    'The process of attaching client-side React behavior to server-rendered HTML.',
    'A hydration mismatch warning means the server and client rendered different markup.',
    'Frontend',
    3,
    ['SSR', 'React', 'Hydration Mismatch']
  ),
  make(
    'fe-002',
    'Virtual DOM',
    'An in-memory tree used by React to compute minimal real-DOM updates via diffing.',
    'The virtual DOM lets React batch updates efficiently.',
    'Frontend',
    2,
    ['React', 'Reconciliation', 'Diffing']
  ),
  make(
    'fe-003',
    'CSS-in-JS',
    'Styling approach that authors CSS inside JavaScript so styles are colocated with components.',
    'styled-components and Emotion are popular CSS-in-JS libraries.',
    'Frontend',
    2,
    ['styled-components', 'Emotion', 'Tailwind']
  ),
  make(
    'fe-004',
    'Code Splitting',
    'Breaking a JavaScript bundle into smaller chunks loaded on demand to improve initial load time.',
    'We code-split the dashboard so the marketing page no longer ships it.',
    'Frontend',
    3,
    ['Lazy Loading', 'Webpack', 'Dynamic Import']
  ),
  make(
    'fe-005',
    'Suspense',
    'A React feature that lets components wait for asynchronous work and declaratively render fallback UI.',
    'We wrapped the data grid in Suspense to show a skeleton while loading.',
    'Frontend',
    3,
    ['React', 'Concurrent', 'Streaming SSR']
  ),

  // DevOps
  make(
    'do-001',
    'CI/CD',
    'Continuous Integration / Continuous Deployment — automated pipelines that build, test and ship code on every change.',
    'Our CI/CD pipeline deploys to staging on every merge to main.',
    'DevOps',
    1,
    ['GitHub Actions', 'Pipeline', 'Deploy']
  ),
  make(
    'do-002',
    'Infrastructure as Code',
    'Managing infrastructure through declarative, version-controlled configuration files instead of manual changes.',
    'Our entire production stack is defined in Terraform.',
    'DevOps',
    3,
    ['Terraform', 'Pulumi', 'CloudFormation']
  ),
  make(
    'do-003',
    'Blue-Green Deploy',
    'A deployment strategy that runs two identical environments and switches traffic between them for zero-downtime releases.',
    'Blue-green deploys let us roll back instantly by flipping the load balancer.',
    'DevOps',
    3,
    ['Canary', 'Rollback', 'Zero Downtime']
  ),
  make(
    'do-004',
    'Observability',
    'The ability to understand a system\'s internal state from its external outputs — logs, metrics, and traces.',
    'OpenTelemetry gave us full observability across services.',
    'DevOps',
    3,
    ['Tracing', 'Metrics', 'OpenTelemetry']
  ),

  // Cloud
  make(
    'cl-001',
    'Serverless',
    'A cloud execution model where the provider runs code on demand and bills per invocation, abstracting away servers.',
    'We rewrote the cron job as a serverless Lambda.',
    'Cloud',
    2,
    ['Lambda', 'Cold Start', 'FaaS']
  ),
  make(
    'cl-002',
    'Cold Start',
    'Latency added when a serverless function spins up a new container before handling a request.',
    'Cold starts on this Java function were over a second.',
    'Cloud',
    3,
    ['Serverless', 'Provisioned Concurrency']
  ),
  make(
    'cl-003',
    'Edge Function',
    'A function that runs at points of presence near the user for low latency.',
    'Auth checks moved to edge functions to cut TTFB.',
    'Cloud',
    3,
    ['CDN', 'Cloudflare Workers', 'Vercel Edge']
  ),
  make(
    'cl-004',
    'IAM',
    'Identity and Access Management — defining who can do what to which resources.',
    'A misconfigured IAM policy exposed the bucket publicly.',
    'Cloud',
    2,
    ['Role', 'Policy', 'Least Privilege']
  ),

  // Databases
  make(
    'db-001',
    'ACID',
    'Atomicity, Consistency, Isolation, Durability — guarantees a transactional database provides.',
    'Postgres is fully ACID-compliant.',
    'Databases',
    2,
    ['Transaction', 'Isolation Level', 'Postgres']
  ),
  make(
    'db-002',
    'Sharding',
    'Splitting a database horizontally across machines so each holds a subset of rows.',
    'We sharded the users table by region.',
    'Databases',
    4,
    ['Partition', 'Replication', 'Hash Ring']
  ),
  make(
    'db-003',
    'Index',
    'A secondary data structure that speeds lookups at the cost of write overhead and storage.',
    'Adding an index on email cut the query from 800ms to 4ms.',
    'Databases',
    1,
    ['B-Tree', 'Query Plan', 'Cardinality']
  ),
  make(
    'db-004',
    'Vector Database',
    'A database optimized for storing embeddings and running approximate-nearest-neighbor search.',
    'We use Pinecone as our vector database for semantic search.',
    'Databases',
    3,
    ['Embedding', 'ANN', 'Pinecone', 'pgvector']
  ),

  // Security
  make(
    'sec-001',
    'CSRF',
    'Cross-Site Request Forgery — an attack where a user is tricked into submitting a request to a site they\'re authenticated on.',
    'We use SameSite cookies and CSRF tokens to mitigate it.',
    'Security',
    3,
    ['SameSite', 'Token', 'OWASP']
  ),
  make(
    'sec-002',
    'XSS',
    'Cross-Site Scripting — injecting malicious scripts into pages that other users will load.',
    'Reflected XSS in the search box let attackers steal session cookies.',
    'Security',
    3,
    ['CSP', 'Sanitization', 'OWASP']
  ),
  make(
    'sec-003',
    'JWT',
    'JSON Web Token — a signed, base64-encoded token used to convey claims between parties.',
    'The frontend includes the JWT in the Authorization header.',
    'Security',
    2,
    ['OAuth', 'Bearer Token', 'Signing']
  ),
  make(
    'sec-004',
    'Zero Trust',
    'A security model that never implicitly trusts any network or user and verifies every request.',
    'We rolled out zero trust by requiring device posture checks on every API call.',
    'Security',
    4,
    ['mTLS', 'BeyondCorp', 'Least Privilege']
  ),
];

/**
 * Seed vocabulary.
 *
 * Tries to write to Firestore; if Firebase isn't configured (dev/demo mode),
 * falls back to populating the local zustand store directly so the app is
 * still usable.
 */
export const seedVocabulary = async (): Promise<void> => {
  try {
    const { db } = await import('../services/firebase');
    const { collection, doc, setDoc, Timestamp } = await import('firebase/firestore');

    await Promise.all(
      SEED_VOCABULARIES.map((v) =>
        setDoc(doc(collection(db, 'vocabularies'), v.id), {
          ...v,
          createdAt: Timestamp.fromDate(v.createdAt),
        })
      )
    );
  } catch (err) {
    // Fallback: hydrate local store so the app works without Firebase.
    console.warn('[seed] Firestore unavailable, seeding local store instead.', err);
  }

  // Always also push into local store for instant feedback.
  useVocabStore.setState({ vocabularies: SEED_VOCABULARIES, currentCards: SEED_VOCABULARIES });
};
