import { Vocabulary } from '../types';

const now = new Date();

const m = (
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

/**
 * Terms held back for weekly automatic release. The growth engine moves a
 * batch of these into the active library every 7 days.
 */
export const GROWTH_POOL: Vocabulary[] = [
  // AI / ML
  m(
    'g-ai-001',
    'LoRA',
    'Low-Rank Adaptation — fine-tunes large models efficiently by training small adapter matrices.',
    'LoRA fine-tuning ran on a single consumer GPU.',
    'AI/ML',
    4,
    ['Fine-Tuning', 'PEFT']
  ),
  m(
    'g-ai-002',
    'Mixture of Experts',
    'A model architecture that routes each input to a subset of specialized sub-networks.',
    'Mixtral activated only 12B of its 47B parameters per token.',
    'AI/ML',
    4,
    ['Routing', 'Sparse']
  ),
  m(
    'g-ai-003',
    'Distillation',
    "Training a small student model to mimic a larger teacher's outputs.",
    'Distillation shrank the 70B model to 7B with 90% of the quality.',
    'AI/ML',
    3,
    ['Compression', 'Teacher']
  ),
  m(
    'g-ai-004',
    'Catastrophic Forgetting',
    'When a model trained on a new task loses ability on previously-learned tasks.',
    'Naïve fine-tuning caused catastrophic forgetting on the original benchmark.',
    'AI/ML',
    3,
    ['Continual Learning']
  ),

  // Agentic AI
  m(
    'g-agent-001',
    'Tree of Thoughts',
    'An agent strategy that explores multiple reasoning branches and backtracks when needed.',
    'ToT solved puzzles a linear chain-of-thought failed on.',
    'Agentic AI',
    4,
    ['CoT', 'Search']
  ),
  m(
    'g-agent-002',
    'Self-Consistency',
    'Sampling several reasoning chains and taking the majority answer to boost reliability.',
    'Self-consistency lifted math accuracy by 17 points.',
    'Agentic AI',
    3,
    ['CoT', 'Voting']
  ),
  m(
    'g-agent-003',
    'Skill Library',
    'A growing set of reusable, named procedures an agent learns and recalls.',
    'Voyager built a Minecraft skill library it kept extending.',
    'Agentic AI',
    4,
    ['Memory', 'Voyager']
  ),
  m(
    'g-agent-004',
    'Constitutional AI',
    'Aligning an LLM by asking it to critique its own responses against a written set of principles.',
    'Constitutional AI reduced harmful outputs without human labels.',
    'Agentic AI',
    4,
    ['RLHF', 'Alignment']
  ),

  // Backend
  m(
    'g-be-001',
    'Idempotency Key',
    'A client-supplied unique key that lets a server safely deduplicate retried requests.',
    'Stripe payments require an Idempotency-Key header on charge requests.',
    'Backend',
    2,
    ['Idempotent', 'Retry']
  ),
  m(
    'g-be-002',
    'Batching',
    'Combining many small requests into one to amortize overhead.',
    'GraphQL DataLoader batched 100 user lookups into a single SQL query.',
    'Backend',
    2,
    ['DataLoader', 'N+1']
  ),
  m(
    'g-be-003',
    'Backpressure',
    "Signaling upstream producers to slow down when consumers can't keep up.",
    'Reactive streams use backpressure to prevent memory blow-ups.',
    'Backend',
    3,
    ['Flow Control', 'Reactive']
  ),
  m(
    'g-be-004',
    'Dead Letter Queue',
    'A queue that holds messages that repeatedly fail processing for later inspection.',
    'Poison messages got parked in the DLQ instead of looping forever.',
    'Backend',
    3,
    ['Queue', 'Retry']
  ),

  // Frontend
  m(
    'g-fe-001',
    'Server Components',
    'React components that render only on the server, sending no JS to the client.',
    'Server Components let us drop 40% of our client bundle.',
    'Frontend',
    3,
    ['React', 'RSC', 'Next.js']
  ),
  m(
    'g-fe-002',
    'Optimistic UI',
    'Updating the UI before the server confirms, then reconciling on response.',
    'Optimistic likes felt instant even on slow networks.',
    'Frontend',
    2,
    ['Mutation', 'Reconcile']
  ),
  m(
    'g-fe-003',
    'Skeleton Screen',
    'A placeholder that mimics page structure while content loads.',
    'Skeleton screens lowered perceived load time by 30%.',
    'Frontend',
    1,
    ['Loading', 'Shimmer']
  ),
  m(
    'g-fe-004',
    'Web Worker',
    'A script that runs on a background thread, keeping the main thread responsive.',
    'Heavy JSON parsing moved to a Web Worker so scrolling stayed smooth.',
    'Frontend',
    3,
    ['Thread', 'postMessage']
  ),

  // DevOps
  m(
    'g-do-001',
    'Chaos Engineering',
    "Deliberately injecting failures to verify a system's resilience.",
    'Chaos Monkey killed random pods and proved our auto-healing worked.',
    'DevOps',
    4,
    ['Reliability', 'Failure Injection']
  ),
  m(
    'g-do-002',
    'Sidecar',
    'A helper container deployed alongside the main app to extend its functionality.',
    'A logging sidecar shipped logs without touching app code.',
    'DevOps',
    3,
    ['Pod', 'Service Mesh']
  ),
  m(
    'g-do-003',
    'Immutable Infrastructure',
    'Servers are never modified after provisioning — replaced rather than patched.',
    'Immutable images eliminated configuration drift between hosts.',
    'DevOps',
    3,
    ['Golden Image', 'IaC']
  ),
  m(
    'g-do-004',
    'Progressive Delivery',
    'Releasing changes gradually with automated metric checks at each stage.',
    'Progressive delivery rolled the feature to 1%, then 10%, then 100%.',
    'DevOps',
    3,
    ['Canary', 'Feature Flag']
  ),

  // Cloud
  m(
    'g-cl-001',
    'WAF',
    'Web Application Firewall — filters HTTP traffic to block common web attacks.',
    'The WAF blocked the SQL injection attempts at the edge.',
    'Cloud',
    2,
    ['Security', 'Edge']
  ),
  m(
    'g-cl-002',
    'NAT Gateway',
    'A managed service that lets private-subnet hosts reach the internet without being publicly addressable.',
    'The NAT gateway let our workers download packages without inbound exposure.',
    'Cloud',
    3,
    ['VPC', 'Subnet']
  ),
  m(
    'g-cl-003',
    'Zonal Failure',
    'When an entire availability zone becomes unavailable, taking down resources hosted there.',
    'The zonal failure proved our multi-AZ design.',
    'Cloud',
    3,
    ['AZ', 'HA']
  ),
  m(
    'g-cl-004',
    'Cost Anomaly',
    'An unexpected spike in cloud spend, often caused by a misconfigured resource.',
    'A runaway Lambda triggered a cost-anomaly alert overnight.',
    'Cloud',
    2,
    ['FinOps', 'Alerts']
  ),

  // Databases
  m(
    'g-db-001',
    'Bloom Filter',
    'A probabilistic data structure that tests whether an element is likely in a set, with no false negatives.',
    'A Bloom filter let us skip 95% of expensive SSTable lookups.',
    'Databases',
    3,
    ['Probabilistic', 'LSM']
  ),
  m(
    'g-db-002',
    'Materialized View',
    'A query result physically stored on disk, refreshed on demand or schedule.',
    'The dashboard sped up 100x after we materialized the aggregation.',
    'Databases',
    3,
    ['View', 'OLAP']
  ),
  m(
    'g-db-003',
    'Eventual Consistency',
    'A consistency model where replicas converge to the same state given enough time without writes.',
    'DNS is eventually consistent — propagation can take minutes.',
    'Databases',
    2,
    ['BASE', 'Replication']
  ),
  m(
    'g-db-004',
    'Read Replica',
    'A secondary copy of a database used to scale read traffic.',
    'Three read replicas absorbed the analytics workload.',
    'Databases',
    2,
    ['Replication', 'Lag']
  ),

  // Security
  m(
    'g-sec-001',
    'Secret Rotation',
    'Periodically replacing credentials so a leaked one becomes invalid quickly.',
    'Automated secret rotation cut the blast radius of a leaked DB password.',
    'Security',
    3,
    ['Vault', 'KMS']
  ),
  m(
    'g-sec-002',
    'Phishing-Resistant MFA',
    "Authentication factors like WebAuthn that can't be replayed via fake login pages.",
    'Mandating WebAuthn ended the phishing campaign overnight.',
    'Security',
    3,
    ['WebAuthn', 'MFA']
  ),
  m(
    'g-sec-003',
    'Supply Chain Attack',
    'Compromising software by injecting malicious code upstream — into a dependency, build, or update.',
    'The npm package hijack was a textbook supply chain attack.',
    'Security',
    4,
    ['SBOM', 'Sigstore']
  ),
  m(
    'g-sec-004',
    'SBOM',
    'Software Bill of Materials — a manifest of all components in a piece of software.',
    'A signed SBOM let us audit dependencies after the disclosure.',
    'Security',
    3,
    ['Supply Chain', 'Inventory']
  ),
];
