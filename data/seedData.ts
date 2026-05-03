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

// =============================================================================
// AI / ML  (30 terms)
// =============================================================================
const AI_ML: Vocabulary[] = [
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
    'A dense vector representation of data where semantic similarity maps to geometric closeness.',
    'We compared user queries to document embeddings using cosine similarity.',
    'AI/ML',
    2,
    ['Vector', 'Cosine Similarity', 'Latent Space']
  ),
  make(
    'ai-003',
    'Gradient Descent',
    'An iterative optimization algorithm that updates parameters in the opposite direction of the loss gradient.',
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
  make(
    'ai-007',
    'Backpropagation',
    'The algorithm that computes gradients by propagating error backward through the network using the chain rule.',
    'Backprop made deep learning practical by enabling efficient gradient computation.',
    'AI/ML',
    3,
    ['Gradient Descent', 'Chain Rule', 'Autograd']
  ),
  make(
    'ai-008',
    'Loss Function',
    "A scalar measure of how far a model's prediction is from the target, minimized during training.",
    'For classification we used cross-entropy loss.',
    'AI/ML',
    2,
    ['Cross-Entropy', 'MSE', 'Objective']
  ),
  make(
    'ai-009',
    'Activation Function',
    "A non-linear function applied to a neuron's output, allowing networks to model complex relationships.",
    'We swapped sigmoid for ReLU to fix vanishing gradients.',
    'AI/ML',
    2,
    ['ReLU', 'Sigmoid', 'GELU', 'Softmax']
  ),
  make(
    'ai-010',
    'CNN',
    'Convolutional Neural Network — uses convolution filters to learn spatial features, dominant in computer vision.',
    'A small CNN beat hand-crafted features on the digit-recognition task.',
    'AI/ML',
    3,
    ['Pooling', 'Kernel', 'ResNet']
  ),
  make(
    'ai-011',
    'RNN',
    'Recurrent Neural Network — processes sequences by carrying hidden state across timesteps.',
    'RNNs were standard for NLP before Transformers replaced them.',
    'AI/ML',
    3,
    ['LSTM', 'GRU', 'Sequence']
  ),
  make(
    'ai-012',
    'LSTM',
    'Long Short-Term Memory — an RNN cell with gating that helps retain information over long sequences.',
    'LSTMs outperformed plain RNNs on language modeling for years.',
    'AI/ML',
    3,
    ['RNN', 'Gating', 'GRU']
  ),
  make(
    'ai-013',
    'Attention',
    'A mechanism that lets a model weight different parts of the input when producing each output.',
    'Attention is all you need — Transformers dropped recurrence entirely.',
    'AI/ML',
    3,
    ['Self-Attention', 'Transformer', 'Q, K, V']
  ),
  make(
    'ai-014',
    'Tokenization',
    'Splitting text into discrete units (tokens) that a model can process numerically.',
    'BPE tokenization handles out-of-vocabulary words by breaking them into subwords.',
    'AI/ML',
    2,
    ['BPE', 'Subword', 'Vocabulary']
  ),
  make(
    'ai-015',
    'Diffusion Model',
    'A generative model that produces samples by reversing a gradual noising process.',
    'Stable Diffusion turns prompts into images via iterative denoising.',
    'AI/ML',
    4,
    ['DDPM', 'Score Matching', 'Stable Diffusion']
  ),
  make(
    'ai-016',
    'GAN',
    'Generative Adversarial Network — trains a generator against a discriminator in a minimax game.',
    'StyleGAN produced photorealistic faces years before diffusion took over.',
    'AI/ML',
    4,
    ['Generator', 'Discriminator', 'Mode Collapse']
  ),
  make(
    'ai-017',
    'Regularization',
    'Techniques that discourage overly complex models, improving generalization.',
    'L2 regularization shrank the weights and reduced overfitting.',
    'AI/ML',
    2,
    ['Dropout', 'L1', 'L2', 'Weight Decay']
  ),
  make(
    'ai-018',
    'Dropout',
    'A regularization technique that randomly zeros out neurons during training to prevent co-adaptation.',
    'A dropout rate of 0.5 stopped the model from memorizing the training set.',
    'AI/ML',
    2,
    ['Regularization', 'Bernoulli']
  ),
  make(
    'ai-019',
    'Batch Normalization',
    'Normalizes activations within a mini-batch to stabilize and speed up training.',
    'BatchNorm lets us use higher learning rates without divergence.',
    'AI/ML',
    3,
    ['Layer Norm', 'Group Norm']
  ),
  make(
    'ai-020',
    'Cross-Validation',
    'A model evaluation technique that rotates train/validation splits to get a more reliable performance estimate.',
    '5-fold cross-validation gave us a tighter confidence interval on accuracy.',
    'AI/ML',
    2,
    ['K-Fold', 'Holdout', 'Validation']
  ),
  make(
    'ai-021',
    'Precision',
    'The fraction of predicted positives that are actually positive — useful when false positives are costly.',
    "Spam filters optimize precision so legitimate mail isn't flagged.",
    'AI/ML',
    1,
    ['Recall', 'F1', 'Confusion Matrix']
  ),
  make(
    'ai-022',
    'Recall',
    'The fraction of actual positives the model correctly identifies — critical when missing positives is costly.',
    'Cancer-screening models prioritize recall over precision.',
    'AI/ML',
    1,
    ['Precision', 'Sensitivity', 'F1']
  ),
  make(
    'ai-023',
    'F1 Score',
    'The harmonic mean of precision and recall — a single number summarizing both.',
    'When classes were imbalanced, F1 was a more honest metric than accuracy.',
    'AI/ML',
    2,
    ['Precision', 'Recall', 'Harmonic Mean']
  ),
  make(
    'ai-024',
    'Reinforcement Learning',
    'An ML paradigm where an agent learns by interacting with an environment and receiving rewards.',
    'RL agents mastered Go and Atari games beyond human level.',
    'AI/ML',
    4,
    ['Policy', 'Q-Learning', 'PPO', 'Reward']
  ),
  make(
    'ai-025',
    'RLHF',
    'Reinforcement Learning from Human Feedback — fine-tunes models using preferences from human raters.',
    'RLHF turned raw GPT-3 into the helpful ChatGPT we know.',
    'AI/ML',
    4,
    ['DPO', 'Reward Model', 'Alignment']
  ),
  make(
    'ai-026',
    'Prompt Engineering',
    'Crafting model inputs to elicit better outputs without retraining the model itself.',
    'Adding "think step by step" boosted reasoning accuracy by 20 points.',
    'AI/ML',
    1,
    ['Few-Shot', 'Chain-of-Thought']
  ),
  make(
    'ai-027',
    'Zero-Shot',
    'A task is performed by a model with no labeled examples for that task.',
    'GPT-4 zero-shot summarized the legal brief without any examples.',
    'AI/ML',
    2,
    ['Few-Shot', 'In-Context Learning']
  ),
  make(
    'ai-028',
    'Few-Shot',
    'A task is performed by a model given just a handful of examples in the prompt.',
    'Three-shot prompting matched fine-tuning performance on classification.',
    'AI/ML',
    2,
    ['Zero-Shot', 'In-Context Learning']
  ),
  make(
    'ai-029',
    'Latent Space',
    'A compressed, learned representation where similar inputs are close together.',
    "Interpolating in StyleGAN's latent space morphs one face into another.",
    'AI/ML',
    3,
    ['Embedding', 'Manifold', 'Encoder']
  ),
  make(
    'ai-030',
    'Quantization',
    'Reducing the numerical precision of model weights to shrink size and speed inference.',
    'INT8 quantization cut model size by 4x with negligible accuracy loss.',
    'AI/ML',
    3,
    ['INT8', 'GGUF', 'GPTQ']
  ),
];

// =============================================================================
// Agentic AI  (22 terms)
// =============================================================================
const AGENTIC: Vocabulary[] = [
  make(
    'agent-001',
    'Agent Loop',
    'The cycle in which an agent observes state, plans, calls tools, and updates memory until a goal is reached.',
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
    'Model Context Protocol — an open standard for exposing tools, resources, and prompts to LLMs.',
    'We wrapped the GitHub API as an MCP server so any client could read issues.',
    'Agentic AI',
    4,
    ['Tool Use', 'Resources', 'Anthropic']
  ),
  make(
    'agent-005',
    'Multi-Agent System',
    'A system where several specialized agents coordinate to solve a complex task.',
    'A planner agent delegated subtasks to coder and reviewer agents.',
    'Agentic AI',
    4,
    ['Orchestrator', 'Swarm', 'Delegation']
  ),
  make(
    'agent-006',
    'ReAct',
    'A prompting pattern that interleaves reasoning ("thoughts") with acting ("tool calls").',
    'ReAct gave the agent a transparent thought trail we could debug.',
    'Agentic AI',
    3,
    ['Chain-of-Thought', 'Tool Use']
  ),
  make(
    'agent-007',
    'Chain-of-Thought',
    'Prompting an LLM to produce intermediate reasoning steps before the final answer.',
    'CoT prompting unlocked grade-school math performance in GPT-3.',
    'Agentic AI',
    2,
    ['ReAct', 'Reasoning', 'Few-Shot']
  ),
  make(
    'agent-008',
    'Vector Database',
    'A database optimized for storing embeddings and running approximate-nearest-neighbor search.',
    'We use Pinecone as our vector database for semantic search.',
    'Agentic AI',
    3,
    ['Embedding', 'ANN', 'Pinecone']
  ),
  make(
    'agent-009',
    'Chunking',
    'Splitting long documents into smaller pieces for retrieval and embedding.',
    'We chunked PDFs at 512 tokens with 64-token overlap.',
    'Agentic AI',
    2,
    ['RAG', 'Token', 'Overlap']
  ),
  make(
    'agent-010',
    'Function Calling',
    'A model feature that emits a structured call to a developer-defined function instead of free text.',
    'Function calling let the assistant query our database directly.',
    'Agentic AI',
    2,
    ['Tool Use', 'JSON Mode']
  ),
  make(
    'agent-011',
    'Scratchpad',
    'An ephemeral working memory area where an agent writes intermediate notes between tool calls.',
    'Without a scratchpad the agent kept forgetting what it had already tried.',
    'Agentic AI',
    3,
    ['Memory', 'Context', 'ReAct']
  ),
  make(
    'agent-012',
    'Episodic Memory',
    'Memory of specific past interactions an agent can replay to inform future decisions.',
    'Storing episodic memory let the support agent remember past tickets.',
    'Agentic AI',
    4,
    ['Long-Term Memory', 'Vector Store']
  ),
  make(
    'agent-013',
    'Semantic Memory',
    'Generalized factual knowledge an agent has about the world, distinct from specific events.',
    "Semantic memory holds the org chart; episodic memory holds last week's standups.",
    'Agentic AI',
    4,
    ['Knowledge Graph', 'Embedding']
  ),
  make(
    'agent-014',
    'Planner',
    'A component that decomposes a high-level goal into a sequence of executable steps.',
    'The planner produced a 7-step plan before any tool was called.',
    'Agentic AI',
    3,
    ['Decomposition', 'HTN']
  ),
  make(
    'agent-015',
    'Orchestrator',
    'A controller that routes tasks among multiple agents or tools.',
    'The orchestrator handed each subtask to whichever agent was best suited.',
    'Agentic AI',
    3,
    ['Multi-Agent', 'Router']
  ),
  make(
    'agent-016',
    'Embedding Search',
    'Finding the most similar items by computing distances between embedding vectors.',
    'Embedding search returned the 10 most relevant policy paragraphs.',
    'Agentic AI',
    2,
    ['Cosine', 'ANN', 'Vector DB']
  ),
  make(
    'agent-017',
    'Reranker',
    'A model that re-orders retrieved candidates to surface the most relevant ones to the LLM.',
    'Adding a Cohere reranker bumped answer accuracy by 12 points.',
    'Agentic AI',
    3,
    ['RAG', 'Cross-Encoder']
  ),
  make(
    'agent-018',
    'Hybrid Search',
    'Combining dense (embedding) retrieval with sparse (keyword) retrieval for better recall.',
    'Hybrid search caught the rare terms that pure dense search missed.',
    'Agentic AI',
    3,
    ['BM25', 'Dense Retrieval']
  ),
  make(
    'agent-019',
    'Guardrails',
    "Filters or constraints that keep an agent's output within safe and policy-compliant bounds.",
    'Output guardrails refused to return any PII to the user.',
    'Agentic AI',
    2,
    ['Safety', 'Validation']
  ),
  make(
    'agent-020',
    'Self-Reflection',
    'A pattern where an agent critiques its own output and revises it before delivering.',
    'Adding a self-reflection step caught most hallucinated citations.',
    'Agentic AI',
    3,
    ['Critic', 'Iterative']
  ),
  make(
    'agent-021',
    'Toolformer',
    'A class of LLMs trained to decide when and how to call external APIs to assist generation.',
    'Toolformer-style training taught the model to use a calculator when needed.',
    'Agentic AI',
    4,
    ['Tool Use', 'Self-Supervised']
  ),
  make(
    'agent-022',
    'Agent Memory',
    'Persistent or working memory that lets an agent maintain context across many turns or sessions.',
    'Long-term memory turned the chatbot into a real assistant.',
    'Agentic AI',
    3,
    ['Episodic', 'Semantic', 'Working Memory']
  ),
];

// =============================================================================
// Backend  (28 terms)
// =============================================================================
const BACKEND: Vocabulary[] = [
  make(
    'be-001',
    'Idempotent',
    'An operation that yields the same result whether executed once or many times.',
    'PUT is idempotent; POST usually is not.',
    'Backend',
    2,
    ['HTTP', 'REST', 'Retries']
  ),
  make(
    'be-002',
    'Webhook',
    'A user-defined HTTP callback fired by a service when an event happens.',
    'Stripe sends a webhook to /api/stripe whenever a payment succeeds.',
    'Backend',
    1,
    ['Callback', 'Event-Driven']
  ),
  make(
    'be-003',
    'GraphQL',
    'A query language for APIs letting clients request exactly the fields they need from a typed schema.',
    'Our GraphQL endpoint replaced 12 REST routes with one.',
    'Backend',
    3,
    ['REST', 'Schema', 'Resolver']
  ),
  make(
    'be-004',
    'Message Queue',
    'A buffer that decouples producers and consumers, letting work be processed asynchronously.',
    'We pushed image-resize jobs onto an SQS queue.',
    'Backend',
    3,
    ['Kafka', 'RabbitMQ', 'Producer/Consumer']
  ),
  make(
    'be-005',
    'Rate Limiting',
    'A control that caps how many requests a client can make in a time window.',
    'We rate-limited the public API to 60 requests per minute per IP.',
    'Backend',
    2,
    ['Token Bucket', 'Leaky Bucket', '429']
  ),
  make(
    'be-006',
    'REST',
    'An architectural style for distributed systems centered on resources, HTTP verbs, and stateless clients.',
    'Our REST API uses standard verbs: GET, POST, PUT, DELETE.',
    'Backend',
    1,
    ['HTTP', 'Resource', 'Stateless']
  ),
  make(
    'be-007',
    'gRPC',
    'A high-performance RPC framework using HTTP/2 and Protocol Buffers for binary serialization.',
    'We use gRPC between microservices for low-latency typed RPCs.',
    'Backend',
    3,
    ['Protobuf', 'HTTP/2', 'RPC']
  ),
  make(
    'be-008',
    'WebSocket',
    'A protocol for full-duplex, bidirectional communication over a long-lived TCP connection.',
    'The chat app uses WebSockets for real-time message delivery.',
    'Backend',
    2,
    ['Real-Time', 'TCP']
  ),
  make(
    'be-009',
    'JWT',
    'JSON Web Token — a signed token used to convey claims, often for stateless authentication.',
    'The frontend includes the JWT in the Authorization header.',
    'Backend',
    2,
    ['OAuth', 'Bearer Token']
  ),
  make(
    'be-010',
    'Microservices',
    'Architectural style where the system is composed of small, independently deployable services.',
    'Splitting the monolith into microservices cut deploy times from hours to minutes.',
    'Backend',
    3,
    ['Monolith', 'Service Mesh']
  ),
  make(
    'be-011',
    'Monolith',
    'A single, unified application containing all functionality in one deployable unit.',
    'The codebase started as a Rails monolith and stayed that way for 8 years.',
    'Backend',
    1,
    ['Microservices', 'Modular Monolith']
  ),
  make(
    'be-012',
    'CQRS',
    'Command Query Responsibility Segregation — splitting writes (commands) from reads (queries) into separate models.',
    'CQRS let us scale the read side independently with replicas.',
    'Backend',
    4,
    ['Event Sourcing', 'DDD']
  ),
  make(
    'be-013',
    'Event Sourcing',
    'Persisting state as a sequence of events instead of overwriting current state.',
    'Event sourcing gave us a perfect audit trail of every change.',
    'Backend',
    4,
    ['CQRS', 'Append-Only', 'Replay']
  ),
  make(
    'be-014',
    'Saga',
    'A pattern for managing long-running, multi-service transactions through compensating actions.',
    'The booking saga rolls back the seat reservation if payment fails.',
    'Backend',
    4,
    ['Distributed Transaction', 'Compensation']
  ),
  make(
    'be-015',
    'Circuit Breaker',
    'A pattern that stops calling a failing downstream service to give it time to recover.',
    'The circuit breaker tripped after 5 consecutive timeouts to the payments API.',
    'Backend',
    3,
    ['Resilience', 'Hystrix', 'Retry']
  ),
  make(
    'be-016',
    'Exponential Backoff',
    'A retry strategy that doubles the wait between attempts to avoid overwhelming a struggling service.',
    'We added jittered exponential backoff to retries.',
    'Backend',
    2,
    ['Retry', 'Jitter']
  ),
  make(
    'be-017',
    'ORM',
    'Object-Relational Mapper — abstracts SQL behind language-native objects and relationships.',
    'Prisma, the ORM, generated typed queries from our schema.',
    'Backend',
    2,
    ['Active Record', 'Repository']
  ),
  make(
    'be-018',
    'Connection Pool',
    'A reusable cache of database connections that avoids the cost of opening new ones per request.',
    'PgBouncer pools 100 client connections into 20 to Postgres.',
    'Backend',
    3,
    ['Database', 'Resource']
  ),
  make(
    'be-019',
    'OAuth 2.0',
    'An authorization framework that lets apps obtain limited access to resources on behalf of a user.',
    'Login with Google uses OAuth 2.0 under the hood.',
    'Backend',
    3,
    ['OpenID', 'Token']
  ),
  make(
    'be-020',
    'CORS',
    'Cross-Origin Resource Sharing — browser-enforced rules controlling cross-origin HTTP requests.',
    'A missing Access-Control-Allow-Origin header caused the CORS error.',
    'Backend',
    2,
    ['Browser', 'Same-Origin']
  ),
  make(
    'be-021',
    'Caching',
    'Storing the result of expensive operations so future requests can be served faster.',
    'We cache profile lookups in Redis with a 60s TTL.',
    'Backend',
    1,
    ['Redis', 'TTL', 'CDN']
  ),
  make(
    'be-022',
    'Pub/Sub',
    'A messaging pattern where publishers emit events and any number of subscribers receive them.',
    'Our pub/sub broker fans events out to 30 downstream services.',
    'Backend',
    2,
    ['Topic', 'Broker']
  ),
  make(
    'be-023',
    'API Gateway',
    'A single entry point in front of multiple backend services, handling routing, auth, and rate limiting.',
    'Kong routes traffic from the internet to our microservices.',
    'Backend',
    2,
    ['Reverse Proxy', 'BFF']
  ),
  make(
    'be-024',
    'BFF',
    'Backend-for-Frontend — a tailored backend layer per client (web, mobile, etc).',
    'The mobile BFF aggregates 5 microservice calls into one response.',
    'Backend',
    3,
    ['API Gateway', 'Aggregation']
  ),
  make(
    'be-025',
    'Server-Sent Events',
    'A unidirectional protocol where the server streams updates to the client over HTTP.',
    'SSE was simpler than WebSockets for our notification feed.',
    'Backend',
    2,
    ['Streaming', 'WebSocket']
  ),
  make(
    'be-026',
    'Pagination',
    'Returning large result sets in pages to avoid huge responses and timeouts.',
    'Cursor-based pagination scaled better than offset pagination.',
    'Backend',
    1,
    ['Cursor', 'Offset']
  ),
  make(
    'be-027',
    'Bulk API',
    'An endpoint optimized for processing many items in a single request.',
    'The bulk import API accepts up to 10,000 records per call.',
    'Backend',
    2,
    ['Batching', 'Throughput']
  ),
  make(
    'be-028',
    'Health Check',
    'A lightweight endpoint indicating whether a service is alive and ready to serve traffic.',
    'The orchestrator drops pods that fail their /healthz check.',
    'Backend',
    1,
    ['Liveness', 'Readiness', 'Probe']
  ),
];

// =============================================================================
// Frontend  (25 terms)
// =============================================================================
const FRONTEND: Vocabulary[] = [
  make(
    'fe-001',
    'Hydration',
    'The process of attaching client-side React behavior to server-rendered HTML.',
    'A hydration mismatch warning means the server and client rendered different markup.',
    'Frontend',
    3,
    ['SSR', 'React', 'Mismatch']
  ),
  make(
    'fe-002',
    'Virtual DOM',
    'An in-memory tree used by React to compute minimal real-DOM updates via diffing.',
    'The virtual DOM lets React batch updates efficiently.',
    'Frontend',
    2,
    ['React', 'Reconciliation']
  ),
  make(
    'fe-003',
    'CSS-in-JS',
    'Authoring CSS inside JavaScript so styles are colocated with components.',
    'styled-components and Emotion are popular CSS-in-JS libraries.',
    'Frontend',
    2,
    ['styled-components', 'Emotion']
  ),
  make(
    'fe-004',
    'Code Splitting',
    'Breaking a JavaScript bundle into smaller chunks loaded on demand.',
    'We code-split the dashboard so the marketing page no longer ships it.',
    'Frontend',
    3,
    ['Lazy Loading', 'Webpack']
  ),
  make(
    'fe-005',
    'Suspense',
    'A React feature that lets components wait for asynchronous work and render fallback UI.',
    'We wrapped the data grid in Suspense to show a skeleton while loading.',
    'Frontend',
    3,
    ['React', 'Concurrent']
  ),
  make(
    'fe-006',
    'SSR',
    'Server-Side Rendering — generating HTML on the server per request to improve TTFB and SEO.',
    'Next.js made SSR painless for our marketing pages.',
    'Frontend',
    2,
    ['Hydration', 'Next.js']
  ),
  make(
    'fe-007',
    'SSG',
    'Static Site Generation — building HTML at compile time and serving it from a CDN.',
    'Astro builds our docs as static pages at deploy time.',
    'Frontend',
    2,
    ['SSR', 'CDN', 'ISR']
  ),
  make(
    'fe-008',
    'ISR',
    'Incremental Static Regeneration — pre-rendering pages and re-generating them on a schedule or on demand.',
    'ISR let us update the blog without a full redeploy.',
    'Frontend',
    3,
    ['SSG', 'Cache']
  ),
  make(
    'fe-009',
    'CSR',
    'Client-Side Rendering — the browser builds the UI from JavaScript after loading a near-empty HTML shell.',
    'CSR works fine for internal dashboards but hurts SEO.',
    'Frontend',
    1,
    ['SSR', 'SPA']
  ),
  make(
    'fe-010',
    'SPA',
    'Single-Page Application — one HTML page where navigation is handled by JavaScript without full reloads.',
    'The SPA model felt instant but broke the back button at first.',
    'Frontend',
    1,
    ['CSR', 'Router']
  ),
  make(
    'fe-011',
    'PWA',
    'Progressive Web App — a web app with offline support, installability, and push capabilities.',
    'We turned our SPA into a PWA so users could install it on their phones.',
    'Frontend',
    2,
    ['Service Worker', 'Manifest']
  ),
  make(
    'fe-012',
    'Service Worker',
    'A background script that intercepts network requests, enabling offline support and push.',
    'The service worker caches the app shell for instant loads on bad networks.',
    'Frontend',
    3,
    ['PWA', 'Cache API']
  ),
  make(
    'fe-013',
    'Hooks',
    'React functions like useState and useEffect that let you use state and lifecycle in function components.',
    'Hooks killed the need for class components in our codebase.',
    'Frontend',
    1,
    ['useState', 'useEffect', 'React']
  ),
  make(
    'fe-014',
    'Context API',
    "React's built-in way to pass data through the component tree without prop drilling.",
    'We put the theme in Context so every component could access it.',
    'Frontend',
    2,
    ['Provider', 'Consumer']
  ),
  make(
    'fe-015',
    'State Management',
    'Coordinating shared application state across many components.',
    'Zustand replaced our 800 lines of Redux boilerplate.',
    'Frontend',
    2,
    ['Redux', 'Zustand', 'MobX']
  ),
  make(
    'fe-016',
    'Tree Shaking',
    'Build-time elimination of unused code from the final bundle.',
    'Tree shaking cut 40KB of unused lodash from production.',
    'Frontend',
    2,
    ['ESM', 'Bundler']
  ),
  make(
    'fe-017',
    'Lazy Loading',
    'Deferring loading of resources or components until they are actually needed.',
    'Lazy-loading images shaved 2 seconds off Largest Contentful Paint.',
    'Frontend',
    1,
    ['Code Splitting', 'Intersection']
  ),
  make(
    'fe-018',
    'Critical CSS',
    'The minimal CSS needed to render the above-the-fold content, inlined for fast first paint.',
    'Inlining critical CSS halved our First Contentful Paint.',
    'Frontend',
    3,
    ['Performance', 'Inline']
  ),
  make(
    'fe-019',
    'Web Vitals',
    'A set of standardized metrics like LCP, CLS, and INP for measuring real-world performance.',
    'We optimized for Core Web Vitals before the SEO ranking change.',
    'Frontend',
    2,
    ['LCP', 'CLS', 'INP']
  ),
  make(
    'fe-020',
    'Reactivity',
    'A programming model where the UI automatically updates when underlying state changes.',
    'Vue and Svelte ship fine-grained reactivity baked into the compiler.',
    'Frontend',
    2,
    ['Signals', 'Vue', 'Svelte']
  ),
  make(
    'fe-021',
    'Signals',
    'Reactive primitives that notify subscribers on change, used by Solid, Preact, and others.',
    "Signals avoid React's re-render cost by updating only the bound DOM.",
    'Frontend',
    3,
    ['Reactivity', 'Solid']
  ),
  make(
    'fe-022',
    'Component',
    'A reusable, self-contained UI building block with its own state, props, and rendering logic.',
    'We have a Button component used in 60 places with one styling source.',
    'Frontend',
    1,
    ['Props', 'JSX']
  ),
  make(
    'fe-023',
    'JSX',
    'A syntax extension that lets you write XML-like markup directly inside JavaScript, used by React.',
    'JSX compiles down to React.createElement calls.',
    'Frontend',
    1,
    ['React', 'Babel']
  ),
  make(
    'fe-024',
    'Memoization',
    "Caching the result of an expensive computation so it isn't re-run if inputs are unchanged.",
    'useMemo prevented an expensive sort on every keystroke.',
    'Frontend',
    2,
    ['useMemo', 'useCallback', 'Cache']
  ),
  make(
    'fe-025',
    'Accessibility (a11y)',
    'Designing UI so people with disabilities can use it — keyboard nav, screen readers, contrast.',
    'Adding ARIA labels and semantic HTML brought our a11y score to 100.',
    'Frontend',
    2,
    ['ARIA', 'WCAG', 'Screen Reader']
  ),
];

// =============================================================================
// DevOps  (22 terms)
// =============================================================================
const DEVOPS: Vocabulary[] = [
  make(
    'do-001',
    'CI/CD',
    'Continuous Integration / Continuous Deployment — automated pipelines that build, test and ship code.',
    'Our CI/CD pipeline deploys to staging on every merge to main.',
    'DevOps',
    1,
    ['GitHub Actions', 'Pipeline']
  ),
  make(
    'do-002',
    'Infrastructure as Code',
    'Managing infrastructure through declarative, version-controlled configuration files.',
    'Our entire production stack is defined in Terraform.',
    'DevOps',
    3,
    ['Terraform', 'Pulumi']
  ),
  make(
    'do-003',
    'Blue-Green Deploy',
    'A deployment strategy that runs two identical environments and switches traffic for zero-downtime releases.',
    'Blue-green deploys let us roll back instantly by flipping the load balancer.',
    'DevOps',
    3,
    ['Canary', 'Rollback']
  ),
  make(
    'do-004',
    'Observability',
    "The ability to understand a system's internal state from logs, metrics, and traces.",
    'OpenTelemetry gave us full observability across services.',
    'DevOps',
    3,
    ['Tracing', 'Metrics', 'OTel']
  ),
  make(
    'do-005',
    'Canary Deploy',
    'Releasing changes to a small subset of users first to detect issues before wider rollout.',
    'A 1% canary caught the regression before it reached customers.',
    'DevOps',
    3,
    ['Blue-Green', 'Feature Flag']
  ),
  make(
    'do-006',
    'Feature Flag',
    'A runtime toggle that gates code paths so features can be enabled/disabled without redeployment.',
    'We hid the new dashboard behind a feature flag for staged rollout.',
    'DevOps',
    2,
    ['LaunchDarkly', 'Toggle']
  ),
  make(
    'do-007',
    'Container',
    'A lightweight, isolated runtime that packages an app with its dependencies.',
    'Each microservice ships as its own Docker container.',
    'DevOps',
    1,
    ['Docker', 'Image']
  ),
  make(
    'do-008',
    'Kubernetes',
    'An open-source platform for orchestrating containerized applications at scale.',
    'Kubernetes self-heals pods that crash by restarting them automatically.',
    'DevOps',
    3,
    ['Pod', 'Deployment', 'Helm']
  ),
  make(
    'do-009',
    'Helm',
    'A package manager for Kubernetes that templates and versions deployments as charts.',
    'helm install bumped Redis to v7 across all clusters in one command.',
    'DevOps',
    3,
    ['Kubernetes', 'Chart']
  ),
  make(
    'do-010',
    'Pod',
    'The smallest deployable unit in Kubernetes, usually one container plus shared resources.',
    'Each pod runs one app container and a sidecar for logging.',
    'DevOps',
    2,
    ['Kubernetes', 'Sidecar']
  ),
  make(
    'do-011',
    'Service Mesh',
    'A dedicated infrastructure layer for service-to-service communication, security, and observability.',
    'Istio gave us mTLS between services without code changes.',
    'DevOps',
    4,
    ['Istio', 'Linkerd', 'mTLS']
  ),
  make(
    'do-012',
    'GitOps',
    'A workflow where the desired infrastructure state is declared in Git and reconciled by an operator.',
    'ArgoCD continuously syncs our cluster to whatever main says.',
    'DevOps',
    3,
    ['ArgoCD', 'Flux']
  ),
  make(
    'do-013',
    'SLA',
    'Service Level Agreement — a contractual commitment about uptime, latency, or other service guarantees.',
    'Our SLA promises 99.9% uptime per quarter.',
    'DevOps',
    1,
    ['SLO', 'SLI', 'Uptime']
  ),
  make(
    'do-014',
    'SLO',
    'Service Level Objective — an internal target (often tighter than the SLA) the team commits to.',
    'Our 99.95% latency SLO leaves error budget for the rest.',
    'DevOps',
    2,
    ['SLA', 'SLI', 'Error Budget']
  ),
  make(
    'do-015',
    'SLI',
    'Service Level Indicator — the actual measurement of a quality dimension like latency or error rate.',
    'p99 latency is our primary SLI for the checkout flow.',
    'DevOps',
    2,
    ['SLO', 'SLA', 'Metric']
  ),
  make(
    'do-016',
    'Error Budget',
    "How much unreliability you're allowed before you must stop shipping risky changes.",
    'We burned 80% of the error budget in week 1 — feature freeze.',
    'DevOps',
    3,
    ['SLO', 'Reliability']
  ),
  make(
    'do-017',
    'Tracing',
    'Following a single request across many services to understand latency and dependencies.',
    'Distributed tracing showed the slow path was our auth call.',
    'DevOps',
    3,
    ['OpenTelemetry', 'Span', 'Jaeger']
  ),
  make(
    'do-018',
    'Metrics',
    'Numerical time-series data points used to monitor system health and performance.',
    'Prometheus scrapes 50,000 metrics per minute from our cluster.',
    'DevOps',
    1,
    ['Prometheus', 'Grafana']
  ),
  make(
    'do-019',
    'Logging',
    'The practice of recording structured events from applications and infrastructure for later analysis.',
    'We ship logs to Loki indexed by service and request ID.',
    'DevOps',
    1,
    ['Structured Logs', 'ELK', 'Loki']
  ),
  make(
    'do-020',
    'Runbook',
    'A step-by-step procedure for handling a known operational issue.',
    'The on-call engineer followed the runbook to restart the stuck queue.',
    'DevOps',
    2,
    ['Playbook', 'Incident']
  ),
  make(
    'do-021',
    'Postmortem',
    'A blameless review after an incident to understand causes and prevent recurrence.',
    'The postmortem found two missing alerts and one bad deploy.',
    'DevOps',
    2,
    ['Incident', 'RCA', 'Blameless']
  ),
  make(
    'do-022',
    'Auto-Scaling',
    'Automatically adjusting compute capacity based on load metrics like CPU or queue depth.',
    'HPA scaled the API from 3 to 30 pods during the traffic spike.',
    'DevOps',
    2,
    ['HPA', 'Elasticity']
  ),
];

// =============================================================================
// Cloud  (22 terms)
// =============================================================================
const CLOUD: Vocabulary[] = [
  make(
    'cl-001',
    'Serverless',
    'A cloud execution model where the provider runs code on demand and bills per invocation.',
    'We rewrote the cron job as a serverless Lambda.',
    'Cloud',
    2,
    ['Lambda', 'FaaS']
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
    ['CDN', 'Cloudflare Workers']
  ),
  make(
    'cl-004',
    'IAM',
    'Identity and Access Management — defining who can do what to which resources.',
    'A misconfigured IAM policy exposed the bucket publicly.',
    'Cloud',
    2,
    ['Role', 'Policy']
  ),
  make(
    'cl-005',
    'IaaS',
    'Infrastructure as a Service — renting raw compute, storage, and networking from a cloud provider.',
    'We started on EC2 (IaaS) before moving to managed services.',
    'Cloud',
    1,
    ['EC2', 'PaaS']
  ),
  make(
    'cl-006',
    'PaaS',
    'Platform as a Service — a managed runtime that handles infrastructure, scaling, and deploys.',
    'Heroku was the original PaaS that made deploys git push easy.',
    'Cloud',
    1,
    ['Heroku', 'IaaS', 'Render']
  ),
  make(
    'cl-007',
    'SaaS',
    'Software as a Service — applications delivered over the internet on a subscription basis.',
    'Salesforce pioneered enterprise SaaS in the early 2000s.',
    'Cloud',
    1,
    ['PaaS', 'Multi-Tenant']
  ),
  make(
    'cl-008',
    'FaaS',
    'Function as a Service — running discrete functions on demand without managing servers.',
    'AWS Lambda popularized FaaS for event-driven workloads.',
    'Cloud',
    2,
    ['Serverless', 'Lambda']
  ),
  make(
    'cl-009',
    'CDN',
    'Content Delivery Network — geographically distributed edge servers that cache and serve static content.',
    'Putting static assets on a CDN cut median load time by 60%.',
    'Cloud',
    1,
    ['Cloudflare', 'CloudFront', 'Cache']
  ),
  make(
    'cl-010',
    'VPC',
    'Virtual Private Cloud — an isolated, virtual network inside a public cloud.',
    'Each environment ran in its own VPC with strict peering rules.',
    'Cloud',
    3,
    ['Subnet', 'Security Group']
  ),
  make(
    'cl-011',
    'Subnet',
    'A subdivision of a VPC, typically scoped to one availability zone with its own routing.',
    'Public subnets had a NAT gateway; private subnets did not.',
    'Cloud',
    3,
    ['VPC', 'Routing']
  ),
  make(
    'cl-012',
    'Security Group',
    'A virtual stateful firewall controlling inbound and outbound traffic to cloud resources.',
    'The security group only allowed port 443 from the load balancer.',
    'Cloud',
    2,
    ['Firewall', 'NACL']
  ),
  make(
    'cl-013',
    'Object Storage',
    'Storage where data is stored as objects with metadata, accessed by HTTP, scaling effectively infinitely.',
    'S3 holds petabytes of analytics data at fractions of a cent per GB.',
    'Cloud',
    2,
    ['S3', 'GCS', 'Blob']
  ),
  make(
    'cl-014',
    'Block Storage',
    'Storage exposed as raw block devices, typically attached to a single VM at a time.',
    'EBS volumes back our database VMs.',
    'Cloud',
    3,
    ['EBS', 'Persistent Disk']
  ),
  make(
    'cl-015',
    'Auto-Scaling Group',
    'A managed group of identical VMs that scales up/down based on policies.',
    'The ASG kept 5 baseline instances and scaled to 50 under peak load.',
    'Cloud',
    2,
    ['Elasticity', 'Launch Template']
  ),
  make(
    'cl-016',
    'Load Balancer',
    'A device or service that distributes incoming traffic across multiple backends.',
    'The Application Load Balancer routed by host header to the right service.',
    'Cloud',
    1,
    ['ALB', 'NLB']
  ),
  make(
    'cl-017',
    'KMS',
    'Key Management Service — managed cryptographic keys for encryption and signing.',
    'We used KMS to encrypt every column containing PII.',
    'Cloud',
    3,
    ['Encryption', 'HSM']
  ),
  make(
    'cl-018',
    'Multi-Region',
    'Running infrastructure across geographic regions for resilience and latency.',
    'Going multi-region halved p99 latency for European users.',
    'Cloud',
    4,
    ['HA', 'DR', 'Failover']
  ),
  make(
    'cl-019',
    'Availability Zone',
    'A physically separate data center within a cloud region, isolating most failure modes.',
    'Spreading the cluster across 3 AZs survived the AZ outage.',
    'Cloud',
    2,
    ['Region', 'HA']
  ),
  make(
    'cl-020',
    'Peering',
    'A direct private network connection between two VPCs or clouds.',
    'VPC peering let the data warehouse query the app DB privately.',
    'Cloud',
    3,
    ['VPC', 'Transit Gateway']
  ),
  make(
    'cl-021',
    'Spot Instance',
    'Spare cloud capacity offered at deep discounts but reclaimable on short notice.',
    'Batch jobs ran on spot instances at a third of the on-demand price.',
    'Cloud',
    3,
    ['EC2', 'Pricing']
  ),
  make(
    'cl-022',
    'Cold Storage',
    'Cheap, slow archival storage for data accessed infrequently.',
    'Logs older than 90 days move to Glacier cold storage.',
    'Cloud',
    2,
    ['Glacier', 'Archival']
  ),
];

// =============================================================================
// Databases  (24 terms)
// =============================================================================
const DATABASES: Vocabulary[] = [
  make(
    'db-001',
    'ACID',
    'Atomicity, Consistency, Isolation, Durability — guarantees a transactional database provides.',
    'Postgres is fully ACID-compliant.',
    'Databases',
    2,
    ['Transaction', 'Isolation']
  ),
  make(
    'db-002',
    'Sharding',
    'Splitting a database horizontally across machines so each holds a subset of rows.',
    'We sharded the users table by region.',
    'Databases',
    4,
    ['Partition', 'Hash Ring']
  ),
  make(
    'db-003',
    'Index',
    'A secondary data structure that speeds lookups at the cost of write overhead and storage.',
    'Adding an index on email cut the query from 800ms to 4ms.',
    'Databases',
    1,
    ['B-Tree', 'Cardinality']
  ),
  make(
    'db-004',
    'Vector Database',
    'A database optimized for storing embeddings and running approximate-nearest-neighbor search.',
    'We use Pinecone as our vector database for semantic search.',
    'Databases',
    3,
    ['Embedding', 'pgvector']
  ),
  make(
    'db-005',
    'BASE',
    'Basically Available, Soft state, Eventually consistent — relaxed guarantees common in NoSQL.',
    'DynamoDB picks BASE over ACID for global scale.',
    'Databases',
    3,
    ['ACID', 'Eventual Consistency']
  ),
  make(
    'db-006',
    'CAP Theorem',
    'In a distributed system you can guarantee at most two of Consistency, Availability, and Partition tolerance.',
    'During a network partition Cassandra picks AP; Spanner picks CP.',
    'Databases',
    4,
    ['Consistency', 'Availability']
  ),
  make(
    'db-007',
    'Replication',
    'Copying data across multiple nodes for redundancy, read scaling, and disaster recovery.',
    'A read replica handled all the analytics queries.',
    'Databases',
    2,
    ['Primary', 'Replica', 'Async']
  ),
  make(
    'db-008',
    'Partitioning',
    'Splitting one logical table into multiple physical pieces by some key range or hash.',
    'Range-partitioning by date made old-data archival trivial.',
    'Databases',
    3,
    ['Sharding', 'Range', 'Hash']
  ),
  make(
    'db-009',
    'Normalization',
    'Structuring tables to eliminate redundancy and ensure data integrity.',
    'Third normal form removed the duplicated address rows.',
    'Databases',
    2,
    ['3NF', 'Denormalization']
  ),
  make(
    'db-010',
    'Denormalization',
    'Deliberately adding redundancy to speed reads, often at write-cost.',
    'We denormalized the order total onto the orders table for faster lists.',
    'Databases',
    2,
    ['Normalization', 'Read-Optimized']
  ),
  make(
    'db-011',
    'OLTP',
    'Online Transaction Processing — workloads with many small, fast, concurrent reads/writes.',
    'Postgres handles our OLTP traffic for orders and payments.',
    'Databases',
    2,
    ['Transaction', 'Postgres']
  ),
  make(
    'db-012',
    'OLAP',
    'Online Analytical Processing — workloads with large aggregate queries over historical data.',
    'Snowflake powers our OLAP dashboards and BI.',
    'Databases',
    2,
    ['Warehouse', 'Snowflake']
  ),
  make(
    'db-013',
    'Columnar Store',
    'A storage layout that keeps columns together for fast aggregate scans on a few columns.',
    "ClickHouse's columnar layout makes SUM() lightning-fast.",
    'Databases',
    3,
    ['ClickHouse', 'Parquet']
  ),
  make(
    'db-014',
    'Document Store',
    'A NoSQL database that stores semi-structured documents (often JSON) keyed by ID.',
    'MongoDB suited the variable shape of our user profiles.',
    'Databases',
    2,
    ['MongoDB', 'JSON']
  ),
  make(
    'db-015',
    'Key-Value Store',
    'A simple database that maps unique keys to values, optimized for fast direct lookups.',
    'Redis served session data with sub-millisecond latency.',
    'Databases',
    1,
    ['Redis', 'DynamoDB']
  ),
  make(
    'db-016',
    'Graph Database',
    'A database designed around nodes and edges, optimized for traversals and relationship queries.',
    "Neo4j answered fraud-ring queries that SQL JOINs couldn't.",
    'Databases',
    3,
    ['Neo4j', 'Cypher']
  ),
  make(
    'db-017',
    'Time-Series DB',
    'A database optimized for ordered, time-stamped measurements like metrics or sensor readings.',
    'InfluxDB stored 50 billion server metrics with cheap downsampling.',
    'Databases',
    3,
    ['InfluxDB', 'Prometheus']
  ),
  make(
    'db-018',
    'B-Tree',
    'A balanced tree data structure used by most relational indexes for log-time lookups.',
    'Postgres B-Tree indexes are the default for most use cases.',
    'Databases',
    3,
    ['Index', 'B+Tree']
  ),
  make(
    'db-019',
    'LSM Tree',
    'Log-Structured Merge tree — write-optimized index used by RocksDB, Cassandra, and others.',
    'LSM trees absorbed our 200k writes/sec workload.',
    'Databases',
    4,
    ['Compaction', 'SSTable']
  ),
  make(
    'db-020',
    'MVCC',
    'Multi-Version Concurrency Control — readers see a consistent snapshot without blocking writers.',
    'Postgres uses MVCC so reads never block writes.',
    'Databases',
    3,
    ['Snapshot', 'Transaction']
  ),
  make(
    'db-021',
    'Isolation Level',
    'A guarantee about what concurrent transactions can or cannot see of each other.',
    'Switching to SERIALIZABLE caught a subtle write-skew bug.',
    'Databases',
    3,
    ['ACID', 'Phantom Read']
  ),
  make(
    'db-022',
    'WAL',
    'Write-Ahead Log — durably records changes before applying them, enabling crash recovery.',
    'Postgres replays the WAL on startup after a crash.',
    'Databases',
    3,
    ['Recovery', 'Log']
  ),
  make(
    'db-023',
    'Connection Pool',
    'A reusable cache of database connections that avoids the cost of opening new ones per request.',
    'PgBouncer pooled 100 client connections into 20 to Postgres.',
    'Databases',
    3,
    ['PgBouncer', 'Resource']
  ),
  make(
    'db-024',
    'Migration',
    'A versioned schema change script applied to bring the database from one shape to the next.',
    'Each PR includes a forward-and-rollback migration.',
    'Databases',
    2,
    ['Schema', 'Flyway', 'Liquibase']
  ),
];

// =============================================================================
// Security  (24 terms)
// =============================================================================
const SECURITY: Vocabulary[] = [
  make(
    'sec-001',
    'CSRF',
    "Cross-Site Request Forgery — tricking a logged-in user into submitting a request to a site they're authenticated on.",
    'We use SameSite cookies and CSRF tokens to mitigate it.',
    'Security',
    3,
    ['SameSite', 'OWASP']
  ),
  make(
    'sec-002',
    'XSS',
    'Cross-Site Scripting — injecting malicious scripts into pages other users will load.',
    'Reflected XSS in the search box let attackers steal session cookies.',
    'Security',
    3,
    ['CSP', 'Sanitization']
  ),
  make(
    'sec-003',
    'JWT',
    'JSON Web Token — a signed, base64-encoded token used to convey claims between parties.',
    'The frontend includes the JWT in the Authorization header.',
    'Security',
    2,
    ['OAuth', 'Bearer']
  ),
  make(
    'sec-004',
    'Zero Trust',
    'A security model that never implicitly trusts any network or user and verifies every request.',
    'We rolled out zero trust by requiring device posture checks on every API call.',
    'Security',
    4,
    ['mTLS', 'BeyondCorp']
  ),
  make(
    'sec-005',
    'OWASP Top 10',
    'A regularly-updated list of the most critical web application security risks.',
    'Our security review tracks every finding back to an OWASP Top 10 category.',
    'Security',
    1,
    ['XSS', 'SQLi']
  ),
  make(
    'sec-006',
    'SQL Injection',
    'Inserting malicious SQL into queries, usually via unsanitized input, to read or modify the database.',
    'Parameterized queries killed the SQL injection class entirely.',
    'Security',
    2,
    ['SQLi', 'Parameterized']
  ),
  make(
    'sec-007',
    'SSRF',
    "Server-Side Request Forgery — coercing a server into making requests on the attacker's behalf.",
    'SSRF on the metadata endpoint exposed cloud credentials.',
    'Security',
    4,
    ['Metadata Endpoint', 'Validation']
  ),
  make(
    'sec-008',
    'RCE',
    'Remote Code Execution — running arbitrary attacker code on a target system.',
    'Log4Shell was the most famous RCE of 2021.',
    'Security',
    4,
    ['Log4Shell', 'Patching']
  ),
  make(
    'sec-009',
    'CSP',
    'Content Security Policy — HTTP header that restricts which sources a browser will load resources from.',
    'A strict CSP killed our remaining XSS risk.',
    'Security',
    3,
    ['XSS', 'Header']
  ),
  make(
    'sec-010',
    'CORS',
    'Cross-Origin Resource Sharing — browser policy controlling cross-origin HTTP requests.',
    'A missing Access-Control-Allow-Origin header caused the CORS error.',
    'Security',
    2,
    ['Same-Origin', 'Browser']
  ),
  make(
    'sec-011',
    'mTLS',
    'Mutual TLS — both client and server authenticate each other with certificates.',
    'mTLS replaced API keys for our internal service-to-service traffic.',
    'Security',
    4,
    ['TLS', 'PKI', 'Cert']
  ),
  make(
    'sec-012',
    'TLS',
    'Transport Layer Security — protocol providing encryption, integrity, and authentication for network connections.',
    'TLS 1.3 reduced the handshake to a single round-trip.',
    'Security',
    2,
    ['HTTPS', 'Cert']
  ),
  make(
    'sec-013',
    'OAuth',
    "A delegation framework that grants an app limited access to a user's resources on another service.",
    'OAuth lets users grant calendar access without sharing their password.',
    'Security',
    3,
    ['JWT', 'OpenID']
  ),
  make(
    'sec-014',
    'OpenID Connect',
    'An identity layer on top of OAuth 2.0 that adds standardized authentication.',
    'OIDC gave us SSO across all internal apps.',
    'Security',
    3,
    ['OAuth', 'SSO', 'Identity']
  ),
  make(
    'sec-015',
    'SSO',
    'Single Sign-On — log in once and access multiple applications without re-authenticating.',
    'Okta SSO replaced 14 separate logins for engineers.',
    'Security',
    2,
    ['SAML', 'OIDC']
  ),
  make(
    'sec-016',
    'MFA',
    'Multi-Factor Authentication — requiring two or more independent credentials to log in.',
    'Enforcing MFA cut account-takeover incidents by 99%.',
    'Security',
    1,
    ['TOTP', 'WebAuthn']
  ),
  make(
    'sec-017',
    'Hashing',
    'A one-way function that maps data to a fixed-size digest, used for integrity and password storage.',
    'We hash passwords with Argon2id, never plain SHA-256.',
    'Security',
    2,
    ['SHA-256', 'Argon2', 'bcrypt']
  ),
  make(
    'sec-018',
    'Salt',
    'Random data added to a password before hashing to prevent rainbow-table attacks.',
    "Each user's password gets its own 16-byte salt.",
    'Security',
    2,
    ['Hashing', 'Pepper']
  ),
  make(
    'sec-019',
    'Encryption at Rest',
    "Encrypting stored data so it's unreadable without the keys, even if storage is stolen.",
    'All RDS databases have encryption at rest enabled by default.',
    'Security',
    2,
    ['KMS', 'Disk Encryption']
  ),
  make(
    'sec-020',
    'Encryption in Transit',
    "Encrypting data while moving across the network so it can't be read or tampered with mid-flight.",
    'TLS provides encryption in transit for HTTPS.',
    'Security',
    2,
    ['TLS', 'HTTPS']
  ),
  make(
    'sec-021',
    'Threat Model',
    'A structured exercise to identify how a system could be attacked and what assets are at risk.',
    'STRIDE-based threat modeling found 4 unconsidered attack paths.',
    'Security',
    3,
    ['STRIDE', 'Risk']
  ),
  make(
    'sec-022',
    'Principle of Least Privilege',
    'Each user, service, or process gets only the minimum permissions needed to do its job.',
    'Applying least privilege shrank the blast radius of leaked tokens.',
    'Security',
    2,
    ['IAM', 'Zero Trust']
  ),
  make(
    'sec-023',
    'Pen Test',
    'A simulated attack on a system to find exploitable weaknesses before real attackers do.',
    "The annual pen test surfaced one critical SSRF we hadn't caught.",
    'Security',
    3,
    ['Red Team', 'Audit']
  ),
  make(
    'sec-024',
    'Bug Bounty',
    'A program that pays external researchers for responsibly disclosed vulnerabilities.',
    'Our bug bounty paid out $40k in its first year.',
    'Security',
    2,
    ['HackerOne', 'Disclosure']
  ),
];

export const SEED_VOCABULARIES: Vocabulary[] = [
  ...AI_ML,
  ...AGENTIC,
  ...BACKEND,
  ...FRONTEND,
  ...DEVOPS,
  ...CLOUD,
  ...DATABASES,
  ...SECURITY,
];

/**
 * Seed the vocabulary store. Tries Firestore first; falls back to populating
 * the local zustand store directly when Firebase isn't configured.
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
    console.warn('[seed] Firestore unavailable, seeding local store instead.', err);
  }

  useVocabStore.setState({
    vocabularies: SEED_VOCABULARIES,
    currentCards: SEED_VOCABULARIES,
  });
};
