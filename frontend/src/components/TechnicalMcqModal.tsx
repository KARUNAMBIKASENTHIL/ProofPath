import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles, 
  Check, 
  Code2, 
  ShieldCheck, 
  Award,
  AlertCircle
} from 'lucide-react';

export interface MCQQuestion {
  id: number;
  category: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TECHNICAL_10_MCQS: MCQQuestion[] = [
  {
    id: 1,
    category: "Data Preprocessing & Leakage",
    question: "When building a Machine Learning pipeline with scaling (e.g., StandardScaler) and imputation, how must the preprocessing transformers be fitted to prevent data leakage?",
    options: [
      "Fit on the entire dataset before doing train-test split.",
      "Fit strictly on the training set, and only transform validation and test sets.",
      "Fit separately on training, validation, and test splits independently.",
      "Fit on the test set first to ensure realistic target distributions."
    ],
    correctIndex: 1,
    explanation: "Fitting scalers on validation or full data leaks future distribution statistics (mean/std) into the training phase."
  },
  {
    id: 2,
    category: "API Architecture & Defensive Schemas",
    question: "In a FastAPI / Python backend receiving inference requests or user records, what is the best practice to enforce schema validation and reject invalid payloads?",
    options: [
      "Write manual 'if x < 0: return error' checks inside every individual controller.",
      "Rely exclusively on database foreign key constraints without API layer validation.",
      "Define Pydantic schema models with constraints (e.g. Field(gt=0)) to auto-generate 422 Unprocessable Entity responses.",
      "Disable client-side validation and catch unhandled 500 Internal Server Errors."
    ],
    correctIndex: 2,
    explanation: "Pydantic models enforce deterministic schema boundaries at the transport boundary before domain logic execution."
  },
  {
    id: 3,
    category: "Automated Testing & Mocking",
    question: "When writing automated pytest test suites for a service that queries an external REST API or database, how should external dependencies be handled in CI/CD pipelines?",
    options: [
      "Hardcode live production API credentials in the test suite repo.",
      "Use mock fixtures (e.g. respx, pytest-mock, or unittest.mock) to simulate network I/O and maintain isolated, fast tests.",
      "Skip writing unit tests and only perform manual browser clicking.",
      "Send queries to live third-party production servers during every pull request build."
    ],
    correctIndex: 1,
    explanation: "Mocking guarantees tests run deterministically, offline, fast, and without side-effects on live systems."
  },
  {
    id: 4,
    category: "Database Transactions & ACID Integrity",
    question: "If a database transaction encounters an unhandled runtime error while updating candidate profiles and milestone progress midway, what must occur to guarantee consistency?",
    options: [
      "Commit whatever statements succeeded and ignore the failed queries.",
      "Retry the failed query in an infinite loop until it succeeds.",
      "Roll back the entire transaction atomically to maintain ACID database integrity.",
      "Write the failed row to a temporary text file on disk and proceed."
    ],
    correctIndex: 2,
    explanation: "Atomic transactions require all operations in the unit of work to succeed; otherwise, full rollback is mandatory."
  },
  {
    id: 5,
    category: "Model Overfitting & Regularization",
    question: "If your machine learning model achieves 99.4% accuracy on training data but drops to 63.8% on cross-validation folds, what primary issue is present and what is the standard fix?",
    options: [
      "Underfitting; increase model depth and double training epochs.",
      "Overfitting; apply regularization (L1/L2), dropout, cross-validation, or prune tree depth.",
      "Label imbalance; delete 50% of the minority class samples.",
      "Target leakage; duplicate the test data into the training folds."
    ],
    correctIndex: 1,
    explanation: "A severe train/validation gap indicates high variance (overfitting), solved by regularization and complexity constraints."
  },
  {
    id: 6,
    category: "Containerization & Docker Best Practices",
    question: "When writing a production Dockerfile for a Python web service, which practice guarantees minimal image size and maximum container security?",
    options: [
      "Run the container as root user and include all build compilers and git history.",
      "Use multi-stage builds, a slim base image (e.g. python:3.11-slim), .dockerignore, and a non-root application user.",
      "Copy the entire local virtualenv directory from your development machine into the container.",
      "Install full desktop GUI utilities inside the Docker image."
    ],
    correctIndex: 1,
    explanation: "Slim base images with non-root execution and .dockerignore minimize CVE attack surface and image size."
  },
  {
    id: 7,
    category: "Asynchronous Concurrency & I/O",
    question: "In Python (FastAPI/asyncio), when is it appropriate to declare an endpoint as 'async def' versus standard synchronous 'def'?",
    options: [
      "Use async def for heavy CPU-bound matrix multiplication and cryptography.",
      "Use async def for non-blocking I/O operations (network requests, DB queries); offload CPU-heavy computation to worker pools.",
      "async def causes all requests to run single-threaded in synchronous lockstep.",
      "There is no difference; Python ignores async def at runtime."
    ],
    correctIndex: 1,
    explanation: "Async handles high-concurrency non-blocking I/O; CPU-bound workloads block the event loop if not offloaded."
  },
  {
    id: 8,
    category: "Git & Continuous Integration (CI/CD)",
    question: "What is the primary engineering advantage of maintaining feature branches, Pull Request reviews, and automated CI status checks over committing directly to main?",
    options: [
      "It makes git clone commands download repositories 10x faster.",
      "It ensures breaking changes, syntax errors, and test regressions are blocked before merging, protecting production stability.",
      "It eliminates the need for commit messages and change logs.",
      "It automatically converts Python scripts into binary assembly."
    ],
    correctIndex: 1,
    explanation: "Branch protection and CI gates ensure code undergoes automated quality checks before entering the main production branch."
  },
  {
    id: 9,
    category: "Caching & Scalability",
    question: "When repeated read queries on high-traffic database endpoints cause latency spikes, what is the standard architectural remedy to reduce latency from ~200ms to <5ms?",
    options: [
      "Add an in-memory distributed cache (like Redis) with appropriate TTL and cache invalidation policies.",
      "Drop all database indexes to reduce disk footprint.",
      "Increase frontend polling frequency to query the server every 10ms.",
      "Store all sensitive database records in client browser cookies."
    ],
    correctIndex: 0,
    explanation: "In-memory key-value caching (Redis) handles read-heavy hot paths, bypassing expensive relational disk queries."
  },
  {
    id: 10,
    category: "Production Logging & Security",
    question: "In production microservices and APIs, why should raw exception stack traces never be directly returned to client API responses?",
    options: [
      "Stack traces consume too much network bandwidth over HTTPS.",
      "Raw stack traces reveal internal directory structures, DB schemas, and third-party library versions to attackers.",
      "JSON serializers fail if string outputs contain newline characters.",
      "Returning errors violates Python PEP 8 styling guidelines."
    ],
    correctIndex: 1,
    explanation: "Information disclosure via stack traces assists attackers in fingerprinting vulnerabilities and internal system paths."
  }
];

export function generateResumeAndGithubTailoredMCQs(
  project?: any,
  targetRoleName?: string,
  skills: string[] = [],
  githubUrl?: string
): MCQQuestion[] {
  // Parse clean GitHub repository name if provided
  let repoName = '';
  const projRepo = project?.repo_url || githubUrl || '';
  if (projRepo && projRepo.trim()) {
    const cleaned = projRepo.trim().replace(/\/$/, '');
    const parts = cleaned.split('/');
    if (parts.length > 0) {
      repoName = parts[parts.length - 1];
    }
  }

  const projTitle = project?.title || (skills.length > 0 ? `${skills[0]} Engine` : 'Technical Project');
  const displayRepo = repoName || `${projTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-repo`;
  const projTechs = (project?.technologies || project?.technologies_used || []).map((t: string) => t.toLowerCase());
  const lowerSkills = skills.map(s => s.toLowerCase());
  const allTechs = Array.from(new Set([...projTechs, ...lowerSkills]));

  // Check specific project signatures
  const isMedRoute = /medroute|ambulance|emergency/i.test(projTitle) || /medroute|ambulance/i.test(displayRepo);
  const isCampusBridge = /campusbridge|alumni|campus/i.test(projTitle) || /alumni|campus/i.test(displayRepo);

  // 1. SPECIFIC QUESTIONS FOR MEDROUTE (Emergency Medical Response Platform)
  if (isMedRoute) {
    return [
      {
        id: 1,
        category: "Real-Time Tracking & Socket.io Architecture",
        question: `In your 'MedRoute' codebase (${displayRepo}), when continuously streaming live GPS coordinate updates from ambulance drivers to hospital dispatchers via Socket.io, how should event listeners and socket disconnects be managed to prevent memory leaks?`,
        options: [
          "Store all active socket client instances in a global variable array and never delete them on disconnect.",
          "Register socket.on('disconnect') handlers to clean up event listeners, remove driver IDs from active tracking rooms, and stop heartbeat timers.",
          "Force all browser clients to reload the entire web page every 3 seconds to clear socket memory.",
          "Disable Socket.io heartbeats and allow disconnected sockets to remain open indefinitely."
        ],
        correctIndex: 1,
        explanation: "Cleaning up listeners and tracking rooms on socket disconnect prevents detached closures from accumulating in the Node.js memory heap."
      },
      {
        id: 2,
        category: "Express.js & TypeScript API Schema Validation",
        question: `In your Express.js & TypeScript backend for 'MedRoute', when receiving emergency dispatch requests with patient location coordinates (lat, lng, severity), what is the engineering standard to defensively validate incoming JSON payloads?`,
        options: [
          "Bypass backend validation and assume frontend form validation will catch all malformed coordinates.",
          "Write nested 'if (!req.body.lat) return 500' statements inside every individual database controller.",
          "Use declarative schema validators (such as Zod, Joi, or express-validator) at the route middleware boundary to reject invalid payloads with HTTP 422/400 before domain execution.",
          "Allow MongoDB to throw unhandled CastErrors and return raw 500 server stack traces."
        ],
        correctIndex: 2,
        explanation: "Declarative boundary validation with Zod/Joi guarantees strict type and range constraints on critical coordinates before executing emergency logic."
      },
      {
        id: 3,
        category: "MongoDB Geospatial Indexing (2dsphere)",
        question: `In 'MedRoute', when querying MongoDB for the 3 closest available ambulances within a 10km radius of a patient's emergency coordinates, which index and query operator combination provides optimal sub-millisecond query performance?`,
        options: [
          "A B-tree index on ambulance license numbers using a regex search.",
          "A '2dsphere' index on GeoJSON Point coordinates using the '$near' or '$geoWithin' operator.",
          "Full text search index on driver phone numbers.",
          "A compound index on driver age and vehicle color using '$in'."
        ],
        correctIndex: 1,
        explanation: "MongoDB's 2dsphere index calculates spherical geometries for Earth coordinates, enabling ultra-fast nearest-neighbor lookups via $near."
      },
      {
        id: 4,
        category: "MongoDB Atomic Updates & Concurrency Control",
        question: `In 'MedRoute', if two hospital dispatchers simultaneously attempt to assign the exact same idle ambulance to different emergency calls, how should the MongoDB update operation be written to guarantee atomic concurrency without double-booking?`,
        options: [
          "Fetch the ambulance document into memory, check 'isAvailable === true' in JavaScript, and then run an unconditional db.update() 500ms later.",
          "Use atomic 'findOneAndUpdate' with query condition '{ _id: ambulanceId, status: 'AVAILABLE' }' and set status to 'DISPATCHED'.",
          "Prompt both dispatchers in browser alert popups to decide who clicked first.",
          "Allow both calls to assign the vehicle and cancel one manually afterwards."
        ],
        correctIndex: 1,
        explanation: "MongoDB's atomic findOneAndUpdate with conditional query filter guarantees that only the first concurrent request succeeds, preventing race conditions."
      },
      {
        id: 5,
        category: "Leaflet & React-Leaflet Geospatial Optimization",
        question: `In your 'MedRoute' frontend, when rendering interactive Leaflet maps with moving ambulance markers updated every second via WebSockets, how should React component state be structured to avoid re-rendering the entire base tile map on every tick?`,
        options: [
          "Re-initialize the Leaflet MapContainer instance from scratch on every coordinate change.",
          "Keep the base map static and isolate moving markers in separate memoized child components (React.memo) updating only marker lat/lng positions.",
          "Render the entire map as a static PNG image and download a new image every 1,000ms.",
          "Disable map panning and zooming so React does not track any state."
        ],
        correctIndex: 1,
        explanation: "Memoizing marker child components prevents expensive tile canvas re-renders, maintaining 60fps smooth map animations during live GPS streaming."
      },
      {
        id: 6,
        category: "Automated Testing & GitHub CI/CD Workflows",
        question: `When running automated test suites for 'MedRoute' in GitHub Actions CI workflows, how should external network calls and MongoDB database instances be handled to ensure fast, isolated builds?`,
        options: [
          "Hardcode production MongoDB Atlas credentials directly inside GitHub repository code.",
          "Use an in-memory database (e.g. mongodb-memory-server) or test fixtures with Jest/Supertest to run isolated tests without touching production data.",
          "Disable all unit and integration tests in CI and rely solely on manual testing in staging.",
          "Let test cases make live HTTP calls to external public mapping services without mock responses."
        ],
        correctIndex: 1,
        explanation: "In-memory database testing (mongodb-memory-server) with Jest mocks ensures tests run hermetically, fast, and safely in CI pipelines."
      },
      {
        id: 7,
        category: "Docker Multi-Stage Containerization",
        question: `When packaging your 'MedRoute' Node.js/TypeScript backend into a production Docker image for deployment, which Dockerfile practice ensures minimal image size and defense against container escapes?`,
        options: [
          "Run the container as the root user and retain TypeScript compilers and devDependencies in the final image.",
          "Use a multi-stage Dockerfile (build stage compiling TS, slim runtime stage copying only compiled dist/ and production dependencies), executing as a non-root user.",
          "Copy the entire local node_modules folder directly from your Windows host machine into the Linux container.",
          "Install full desktop GUI utilities and git repositories inside the production container."
        ],
        correctIndex: 1,
        explanation: "Multi-stage builds discard build compilers and devDependencies, drastically shrinking image size while non-root execution mitigates privilege escalation."
      },
      {
        id: 8,
        category: "GitHub Repository Discipline & Branch Protection",
        question: `In your GitHub repository '${displayRepo}', what is the primary engineering rationale for enforcing branch protection rules, required CI status checks, and Pull Request approvals on the 'main' branch?`,
        options: [
          "It makes git clone commands download 50% faster.",
          "It blocks syntax errors, broken API contracts, and failing tests from contaminating the production branch, enforcing code review standards.",
          "It eliminates the need for Git commit messages and changelogs.",
          "It automatically publishes untested code directly to production servers."
        ],
        correctIndex: 1,
        explanation: "Branch protection and automated CI gates ensure every commit meets quality, linting, and testing standards before merging to production."
      },
      {
        id: 9,
        category: "Performance Caching & Redis Integration",
        question: `If hospital dashboard users in 'MedRoute' frequently poll for ambulance status every 2 seconds, causing high MongoDB read loads, what architectural solution reduces database latency from ~120ms to <4ms?`,
        options: [
          "Drop all database indexes to save disk space.",
          "Deploy an in-memory Redis cache with short TTL (e.g. 5-10 seconds) or cache-aside invalidation for active ambulance coordinates.",
          "Store all live coordinates in plain text files on the server hard drive.",
          "Increase client polling frequency to 100ms."
        ],
        correctIndex: 1,
        explanation: "In-memory key-value caching (Redis) serves high-frequency telemetry in sub-milliseconds, shielding MongoDB from repetitive query spikes."
      },
      {
        id: 10,
        category: "Production Security & Secrets Management",
        question: `In your 'MedRoute' repository (${displayRepo}), why must environment files (.env) containing MongoDB connection strings and JWT secrets never be checked into git, and how should unexpected exceptions be handled in API responses?`,
        options: [
          "Committed secrets permanently compromise backend credentials in git history; API responses must sanitize errors and log full stack traces privately to internal logs rather than leaking them to clients.",
          "Git repositories fail to push if files contain uppercase characters or token strings.",
          "Returning stack traces causes browser memory exhaustion.",
          "Storing secrets in .env violates CSS style linting rules."
        ],
        correctIndex: 0,
        explanation: "Git commit history is permanent once pushed. Secrets must be managed via secret stores, and stack traces must never be leaked to prevent attacker reconnaissance."
      }
    ];
  }

  // 2. SPECIFIC QUESTIONS FOR CAMPUSBRIDGE (Alumni Management Portal)
  if (isCampusBridge) {
    return [
      {
        id: 1,
        category: "WebSocket Architecture & Real-Time Messaging",
        question: `In your 'CampusBridge' codebase (${displayRepo}), when maintaining persistent WebSocket connections for student-alumni real-time chat, how should idle connections and network dropouts be detected and cleaned up?`,
        options: [
          "Keep disconnected sockets in the server list forever and attempt to write to them indefinitely.",
          "Implement periodic ping-pong heartbeat mechanisms and remove unresponsive sockets from active rooms upon missed pong timeouts.",
          "Terminate all server connections whenever a single user drops off.",
          "Rely exclusively on frontend window.location.reload() to refresh connections."
        ],
        correctIndex: 1,
        explanation: "Heartbeat ping-pong intervals allow the server to reliably detect dead TCP connections (half-open sockets) and free server socket handles."
      },
      {
        id: 2,
        category: "Express.js & Role-Based Access Control (RBAC)",
        question: `In 'CampusBridge', when separating student access from alumni mentor permissions on sensitive mentorship endpoints, how should authentication and role verification be implemented in Express?`,
        options: [
          "Allow frontend clients to pass a 'userRole' URL parameter and trust it without verification.",
          "Use verified JWT middleware that decodes candidate claims and an authorization middleware checking req.user.role === 'ALUMNI'.",
          "Hardcode a master password directly in Express route controllers.",
          "Disable authentication and make all mentorship scheduling endpoints public."
        ],
        correctIndex: 1,
        explanation: "Cryptographically signed JWTs validated by dedicated Express middleware prevent privilege escalation by verifying user roles server-side."
      },
      {
        id: 3,
        category: "WebSocket Room Isolation & Privacy",
        question: `In 'CampusBridge', when students and alumni engage in one-on-one mentorship discussions or video calls, how should Socket.io / WebSocket rooms be architected to prevent message leaking between different user sessions?`,
        options: [
          "Broadcast all messages to socket.broadcast.emit() so all connected users receive the chat payload.",
          "Create unique, isolated room IDs (e.g. hash of studentId + alumniId) and enforce authorization checks before allowing a socket to join the room.",
          "Save messages in browser localStorage and share localStorage across all machines.",
          "Disable rooms and print chat messages to the server terminal."
        ],
        correctIndex: 1,
        explanation: "Isolated room namespaces with server-side authorization guarantee that only invited participants receive private mentorship transmissions."
      },
      {
        id: 4,
        category: "MongoDB Compound Indexing for Message History",
        question: `In your 'CampusBridge' chat module, when querying the latest 50 messages between two users ordered by timestamp descending, which MongoDB compound index provides zero-scan index-covered query performance?`,
        options: [
          "Single-field index on message text content.",
          "Compound index on '{ conversationId: 1, createdAt: -1 }'.",
          "Index on user profile avatar URLs.",
          "No index; rely on full collection table scans."
        ],
        correctIndex: 1,
        explanation: "A compound index on conversationId and descending createdAt allows MongoDB to pinpoint matching conversation documents and return sorted history without in-memory sort."
      },
      {
        id: 5,
        category: "Vite + React Frontend Performance & Code Splitting",
        question: `In your Vite + React frontend for 'CampusBridge', what technique prevents large video/audio calling libraries or charting modules from bloating the initial landing page bundle size?`,
        options: [
          "Import all modules statically in App.tsx with standard 'import' statements.",
          "Use React.lazy() and dynamic import() with React Suspense to code-split heavy components into on-demand chunks.",
          "Remove all CSS styling from the application.",
          "Bundle all third-party npm libraries into a single 25MB index.html script tag."
        ],
        correctIndex: 1,
        explanation: "Dynamic imports and React.lazy create separate asynchronous JavaScript chunks loaded only when the user navigates to video/mentorship features."
      },
      {
        id: 6,
        category: "Automated Testing & GitHub CI/CD Workflows",
        question: `When setting up automated Jest/Supertest CI tests in GitHub Actions for 'CampusBridge', how should authenticated user sessions and mock database records be orchestrated?`,
        options: [
          "Commit real alumni user accounts and passwords directly into the git test repository.",
          "Use test helper utilities to generate signed mock JWT tokens and populate ephemeral in-memory test databases before running assertion suites.",
          "Skip writing automated tests and perform manual clicks before deploying.",
          "Require CI servers to wait for human email verification on each test run."
        ],
        correctIndex: 1,
        explanation: "Generating mock JWTs and using ephemeral test databases allows CI pipelines to execute full authorization test suites swiftly and deterministically."
      },
      {
        id: 7,
        category: "Docker Multi-Stage Containerization",
        question: `When packaging your 'CampusBridge' MERN backend into a production Docker image for deployment, which Dockerfile practice provides minimal image size and defense against container escapes?`,
        options: [
          "Run the container as root user and include all build compilers and git history.",
          "Use a multi-stage Dockerfile (build stage compiling assets, minimal Node slim runtime for execution) and execute as a non-root user.",
          "Copy the entire local virtualenv directory from your development machine into the container.",
          "Install full desktop GUI utilities inside the Docker image."
        ],
        correctIndex: 1,
        explanation: "Multi-stage builds reduce attack surface and image size by discarding build dependencies, while non-root execution mitigates privilege escalation."
      },
      {
        id: 8,
        category: "GitHub Repository Discipline & Branch Protection",
        question: `In your GitHub repository '${displayRepo}', what is the primary engineering rationale for enforcing branch protection rules, required CI status checks, and Pull Request approvals on the 'main' branch?`,
        options: [
          "It makes git clone commands download repositories 10x faster.",
          "It ensures breaking changes, syntax errors, and test regressions are blocked before merging, protecting production stability.",
          "It eliminates the need for commit messages and change logs.",
          "It automatically converts TypeScript scripts into binary assembly."
        ],
        correctIndex: 1,
        explanation: "Branch protection and CI gates ensure code undergoes automated quality checks before entering the main production branch."
      },
      {
        id: 9,
        category: "Scalability & Distributed State with Redis",
        question: `If 'CampusBridge' scales across multiple Node.js server instances behind a load balancer, how can real-time chat messages reach users connected to different server instances?`,
        options: [
          "Rely on local in-memory JavaScript arrays on each individual server.",
          "Use a Redis Pub/Sub adapter (e.g. @socket.io/redis-adapter) to broadcast socket events seamlessly across all server instances.",
          "Instruct users to reconnect repeatedly until they land on the same server instance.",
          "Store all messages in browser cookies."
        ],
        correctIndex: 1,
        explanation: "Redis Pub/Sub adapter coordinates event broadcasts across horizontally scaled server nodes so all connected clients receive messages."
      },
      {
        id: 10,
        category: "Production Security & Secrets Management",
        question: `In your 'CampusBridge' repository (${displayRepo}), why must environment secrets (.env, database passwords, JWT signing keys) strictly never be checked into git, and why must stack traces never be exposed in API responses?`,
        options: [
          "Committed secrets leak permanent credentials into git commit histories, while exposed stack traces reveal internal file paths and software versions to attackers.",
          "Git repositories fail to push if files contain uppercase characters or token strings.",
          "Returning stack traces causes severe memory exhaustion in client browser tabs.",
          "It violates cosmetic code indentation guidelines."
        ],
        correctIndex: 0,
        explanation: "Git history is immutable once pushed; leaked secrets compromise infrastructure, and stack traces provide reconnaissance data for exploits."
      }
    ];
  }

  // 3. DYNAMIC GENERATION FOR ANY OTHER EXTRACTED PROJECT
  const hasJava = allTechs.some(t => /java|spring/i.test(t));
  const hasTS = allTechs.some(t => /typescript|ts/i.test(t));
  const hasJS = allTechs.some(t => /javascript|react|node|vue|next/i.test(t));
  const hasMongo = allTechs.some(t => /mongo|nosql/i.test(t));
  const hasSQL = allTechs.some(t => /sql|postgres|mysql/i.test(t));
  const hasFastAPI = allTechs.some(t => /fastapi|flask|django/i.test(t));
  const hasNode = allTechs.some(t => /express|nest|node/i.test(t));

  const primaryLang = hasJava ? 'Java' : hasTS ? 'TypeScript' : hasJS ? 'JavaScript' : hasFastAPI ? 'Python' : 'TypeScript';
  const primaryFramework = hasFastAPI ? 'FastAPI' : hasNode ? 'Express.js' : hasJava ? 'Spring Boot' : 'React / Node.js';
  const primaryDB = hasMongo ? 'MongoDB' : hasSQL ? 'PostgreSQL' : 'MongoDB';
  const testTool = primaryLang === 'Python' ? 'pytest' : primaryLang === 'Java' ? 'JUnit' : 'Jest';

  return [
    {
      id: 1,
      category: `${primaryLang} Language & Runtime Architecture`,
      question: `In your '${projTitle}' codebase within GitHub repository '${displayRepo}', when handling core execution using ${primaryLang}, how should objects and resources be managed to ensure optimal memory safety and prevent memory leaks?`,
      options: [
        "Allocate all data in global variables so the garbage collector ignores them.",
        primaryLang === 'Python'
          ? "Use context managers ('with' statements) for file/network I/O, and avoid cyclic references in long-running processes."
          : primaryLang === 'Java'
          ? "Ensure resource streams implement AutoCloseable and are wrapped in try-with-resources blocks to prevent handle leaks."
          : "Explicitly clean up event listeners, abort controllers, and avoid detached closures holding memory in heap.",
        "Disable runtime garbage collection across all background threads.",
        "Force manual OS kernel memory flushes after every function invocation."
      ],
      correctIndex: 1,
      explanation: "Deterministic resource deallocation via context managers / try-with-resources prevents file descriptor and memory handle leaks."
    },
    {
      id: 2,
      category: "API Architecture & Defensive Schemas",
      question: `In your repository '${displayRepo}', when exposing public endpoints built with ${primaryFramework}, what is the engineering standard to defensively validate input payloads and reject malformed client inputs?`,
      options: [
        "Rely strictly on unhandled database exceptions and return raw 500 error responses.",
        "Perform manual string splitting and regex matching in each business controller.",
        primaryLang === 'Python'
          ? "Define strongly-typed Pydantic schemas with constraints (e.g. Field(gt=0)) to trigger automated 422 Unprocessable Entity responses."
          : primaryLang === 'Java'
          ? "Use Jakarta Bean Validation annotations (@NotNull, @Size, @Valid) on DTO records to reject malformed payloads automatically."
          : "Validate requests using declarative schema validators (like Zod or Joi) at the boundary before calling domain controllers.",
        "Bypass API layer validation and let frontend clients enforce all business constraints."
      ],
      correctIndex: 2,
      explanation: "Declarative boundary validation rejects invalid payloads immediately with consistent client errors (HTTP 422/400) before domain execution."
    },
    {
      id: 3,
      category: "Automated Testing & GitHub CI/CD",
      question: `When running automated ${testTool} test suites for '${displayRepo}' in GitHub Actions CI workflows, how should external network calls (third-party APIs and databases) be handled to maintain fast, isolated builds?`,
      options: [
        "Include production API secret keys directly inside test files and call live external servers.",
        "Use test fixtures and mock libraries (e.g. pytest-mock/respx/Mockito/Jest mock) to simulate network boundaries deterministically.",
        "Disable unit tests in GitHub CI/CD and only test via manual browser clicks.",
        "Allow tests to depend on live public Internet endpoints without retry timeouts."
      ],
      correctIndex: 1,
      explanation: "Mocking external network I/O ensures CI builds execute offline, swiftly, and without flaky failures caused by external downtime."
    },
    {
      id: 4,
      category: `Database Transactions & ${primaryDB} Integrity`,
      question: `In your resume project '${projTitle}', if a transaction encounters an unhandled runtime error midway through updating multiple tables/collections in ${primaryDB}, how must the database session respond?`,
      options: [
        "Commit the successfully completed queries and disregard the remaining failed writes.",
        "Automatically trigger an atomic rollback on the transaction to restore state to the pre-transaction baseline.",
        "Spin in an infinite retry loop on the failed query without unlocking database rows.",
        "Write the corrupted records to a temporary disk log file and mark the transaction successful."
      ],
      correctIndex: 1,
      explanation: "ACID atomicity mandates that all updates within a transactional unit of work succeed together; otherwise, a complete rollback is strictly required."
    },
    {
      id: 5,
      category: "Data Processing & Algorithmic Integrity",
      question: `When processing and filtering dataset batches in '${projTitle}' within repository '${displayRepo}', what guarantees consistent deterministic output across pipeline executions?`,
      options: [
        "Fit transformer statistics across the entire raw dataset before creating training and test partitions.",
        "Use pure transformation functions with explicit random seeds and immutable data structures.",
        "Fit transformers separately on every single mini-batch independently without shared parameters.",
        "Calculate mean and variance exclusively on the validation partition and backpropagate to training."
      ],
      correctIndex: 1,
      explanation: "Pure transformation functions and seed initialization guarantee idempotency across concurrent pipeline runs."
    },
    {
      id: 6,
      category: "Containerization & Dockerfile Security",
      question: `When packaging '${displayRepo}' into a production Docker container for deployment, which Dockerfile architecture provides minimal image size and defense against container escapes?`,
      options: [
        "Use an unpinned 'FROM ubuntu:latest' base image running as root with all build compilers retained in the container.",
        "Implement a multi-stage Dockerfile (e.g. build stage + minimal slim runtime), discard build dependencies, and execute as a non-root user.",
        "Copy the host machine's virtual environment or node_modules directly into the container filesystem.",
        "Enable SSH daemon and install desktop debugging packages inside the production image."
      ],
      correctIndex: 1,
      explanation: "Multi-stage builds reduce attack surface and image size by discarding compilers, while non-root execution mitigates privilege escalation."
    },
    {
      id: 7,
      category: "Concurrency & Asynchronous I/O",
      question: `In '${displayRepo}', under what operational conditions is it architecturally advantageous to use asynchronous concurrency (async/await) over traditional multi-threaded blocking calls?`,
      options: [
        "When running heavy CPU-bound cryptography or matrix multiplications on a single thread.",
        "For high-volume I/O-bound operations (database queries, network API calls) where the event loop can serve concurrent connections while awaiting I/O.",
        "Asynchronous syntax should be avoided in production systems due to thread corruption.",
        "Only when executing single-threaded synchronous linear loops without network calls."
      ],
      correctIndex: 1,
      explanation: "Asynchronous event loops excel in I/O-bound workloads by yielding the CPU during network/disk wait times, enabling high concurrency."
    },
    {
      id: 8,
      category: "GitHub Repository Discipline & Branch Protection",
      question: `In your GitHub repository '${displayRepo}', what is the engineering rationale for enforcing branch protection rules, required CI status checks, and Pull Request approvals on the 'main' branch?`,
      options: [
        "It prevents developers from cloning the repository to local machines.",
        "It blocks broken commits, lint failures, and regression bugs from contaminating the production-ready trunk.",
        "It speeds up git commit hash calculation algorithms by 50%.",
        "It automatically deploys untested code directly to staging without human review."
      ],
      correctIndex: 1,
      explanation: "Branch protection and automated CI gates ensure every increment meets quality, testing, and review standards before merging."
    },
    {
      id: 9,
      category: "Performance Caching & Latency Optimization",
      question: `If frequently requested read endpoints in '${projTitle}' cause database query spikes, what caching strategy sustainably cuts response times from ~200ms to <5ms?`,
      options: [
        "Drop all database indices to reduce memory overhead.",
        "Deploy an in-memory key-value cache (e.g. Redis) with explicit TTL expiration and cache-aside invalidation.",
        "Store sensitive database records in unencrypted client-side browser cookies.",
        "Increase HTTP request polling frequency on the frontend client."
      ],
      correctIndex: 1,
      explanation: "In-memory caching (e.g. Redis) serves read-heavy hot paths in sub-milliseconds, shielding databases from recurring query load."
    },
    {
      id: 10,
      category: "Production Security & Secrets Management",
      question: `When committing and pushing code to '${displayRepo}', why must environment secrets (.env, database passwords, API keys) strictly never be checked into git, and why must stack traces never be exposed in API responses?`,
      options: [
        "Committed secrets leak permanent credentials into git commit histories, while exposed stack traces reveal internal file paths and software versions to attackers.",
        "Git repositories fail to push if files contain uppercase characters or token strings.",
        "Returning stack traces causes severe memory exhaustion in client browser tabs.",
        "It violates cosmetic code indentation guidelines."
      ],
      correctIndex: 0,
      explanation: "Git history is immutable once pushed; leaked secrets compromise infrastructure, and stack traces provide reconnaissance data for exploits."
    }
  ];
}

export const generateProjectTailoredMCQs = generateResumeAndGithubTailoredMCQs;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetRoleName: string;
  projects?: any[];
  skills?: string[];
  githubUrl?: string;
  onAssessmentCompleted: (scorePercentage: number, correctCount: number, answers: number[]) => void;
}

export const TechnicalMcqModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetRoleName,
  projects = [],
  skills = [],
  githubUrl = '',
  onAssessmentCompleted
}) => {
  const [selectedProjIdx, setSelectedProjIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  if (!isOpen) return null;

  const activeProject = projects.length > 0 ? projects[selectedProjIdx] : undefined;
  const questionsList = generateResumeAndGithubTailoredMCQs(activeProject, targetRoleName, skills, githubUrl);

  const currentQ = questionsList[currentIdx];
  const totalQuestions = questionsList.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  const handleSelectOption = (optionIdx: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIdx]: optionIdx
    });
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowConfirmSubmit(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setShowConfirmSubmit(false);
    }
  };

  const handleSwitchProject = (idx: number) => {
    setSelectedProjIdx(idx);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowConfirmSubmit(false);
  };

  const handleSubmitQuiz = () => {
    let correct = 0;
    const answerList: number[] = [];
    questionsList.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      answerList.push(chosen !== undefined ? chosen : -1);
      if (chosen === q.correctIndex) {
        correct += 1;
      }
    });

    const finalScore = Math.round((correct / totalQuestions) * 100);
    onAssessmentCompleted(finalScore, correct, answerList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs overflow-y-auto font-sans text-[#111827]">
      <div className="w-full max-w-3xl bg-white rounded-[28px] border border-[#EBECEF] shadow-2xl p-6 sm:p-8 space-y-6 my-auto relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-3 pb-4 border-b border-slate-100 pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
              Technical Skills Audit • 10 MCQs
            </span>
            <span className="text-xs text-slate-400">• {targetRoleName}</span>
            {activeProject && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
                Grounded in: {activeProject.title}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
              Code & System Implementation Assessment
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Questions are dynamically formulated based on your separate profile project's technology stack and engineering decisions.
            </p>
          </div>

          {/* Project Grounding Switcher (if user has profile projects) */}
          {projects.length > 1 && (
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                Switch Target Profile Project:
              </span>
              <div className="flex flex-wrap gap-2">
                {projects.map((proj, idx) => (
                  <button
                    key={proj.id || idx}
                    type="button"
                    onClick={() => handleSwitchProject(idx)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      idx === selectedProjIdx
                        ? 'bg-[#1A5336] text-white border-[#1A5336] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {proj.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Question Stepper Indicator & Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Question {currentIdx + 1} of {totalQuestions}</span>
            <span>{answeredCount} of {totalQuestions} Answered</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-[#1A5336] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 10 Question Pill Bubbles */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {questionsList.map((q, idx) => {
              const isAnswered = selectedAnswers[idx] !== undefined;
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${
                    isCurrent
                      ? 'bg-[#1A5336] text-white shadow-xs'
                      : isAnswered
                      ? 'bg-[#DCFCE7] text-[#166534]'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        <div className="p-5 sm:p-6 rounded-[22px] bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
              {currentQ.category}
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">Single Choice</span>
          </div>

          <div className="font-bold text-sm sm:text-base text-[#111827] leading-relaxed">
            {currentQ.question}
          </div>

          {/* 4 Options Grid */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentIdx] === optIdx;
              const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white border-[#1A5336] shadow-sm ring-2 ring-[#1A5336]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-[#1A5336] text-white'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : letter}
                  </div>
                  <div className={`text-xs font-medium leading-relaxed ${
                    isSelected ? 'text-[#111827] font-semibold' : 'text-slate-700'
                  }`}>
                    {opt}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={handlePrev}
            className="btn-secondary text-xs font-semibold px-4 py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentIdx < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={answeredCount === 0}
              onClick={handleSubmitQuiz}
              className="btn-primary text-xs font-extrabold px-6 py-2.5 rounded-full flex items-center gap-2 shadow-md bg-[#166534] hover:bg-[#14532D]"
            >
              <Award className="w-4 h-4" />
              <span>Submit & Calculate Readiness Score</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
