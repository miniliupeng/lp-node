.PHONY: help check lint run-00 run-01 run-02 run-03 run-04 run-05 run-06 run-07 run-08 run-all test

help:
	@echo "Available commands:"
	@echo "  make check    - Run TypeScript type checks"
	@echo "  make lint     - Run Biome lint & format check"
	@echo "  make run-00   - Run all Phase 00 examples"
	@echo "  make run-01   - Run all Phase 01 examples"
	@echo "  make run-02   - Run all Phase 02 examples"
	@echo "  make run-03   - Run all Phase 03 examples"
	@echo "  make run-04   - Run all Phase 04 examples"
	@echo "  make run-05   - Run all Phase 05 examples"
	@echo "  make run-06   - Run all Phase 06 examples"
	@echo "  make run-07   - Run all Phase 07 examples"
	@echo "  make run-08   - Run all Phase 08 examples"
	@echo "  make run-all  - Run all Phases in sequence"

check:
	pnpm exec tsc --noEmit

lint:
	pnpm exec biome check --write .

run-00:
	pnpm exec tsx 00-toolchain-and-engineering-primer/01-node-runtime-and-pnpm/main.ts
	pnpm exec tsx 00-toolchain-and-engineering-primer/02-modern-typescript-setup/main.ts
	pnpm exec tsx 00-toolchain-and-engineering-primer/03-native-test-runner/main.ts
	pnpm exec tsx 00-toolchain-and-engineering-primer/04-env-and-configuration/main.ts

run-01:
	pnpm exec tsx 01-typescript-essential-types/01-primitive-and-reference/main.ts
	pnpm exec tsx 01-typescript-essential-types/02-narrowing-and-type-guards/main.ts
	pnpm exec tsx 01-typescript-essential-types/03-utility-types-practical/main.ts
	pnpm exec tsx 01-typescript-essential-types/04-satisfies-and-const/main.ts

run-02:
	pnpm exec tsx 02-event-loop-and-async/01-event-loop-and-timers/main.ts
	pnpm exec tsx 02-event-loop-and-async/02-async-await-error-handling/main.ts
	pnpm exec tsx 02-event-loop-and-async/03-async-local-storage/main.ts
	pnpm exec tsx 02-event-loop-and-async/04-process-exit-and-uncaught/main.ts

run-03:
	pnpm exec tsx 03-fs-buffer-and-streams/01-fs-and-path-basics/main.ts
	pnpm exec tsx 03-fs-buffer-and-streams/02-buffer-and-binary/main.ts
	pnpm exec tsx 03-fs-buffer-and-streams/03-streams-and-backpressure/main.ts
	pnpm exec tsx 03-fs-buffer-and-streams/04-web-streams-interop/main.ts

run-04:
	pnpm exec tsx 04-network-and-realtime/01-native-http-server/main.ts
	pnpm exec tsx 04-network-and-realtime/02-tcp-socket-basics/main.ts
	pnpm exec tsx 04-network-and-realtime/03-websocket-heartbeat/main.ts

run-05:
	pnpm exec tsx 05-concurrency-and-processes/01-child-process-basics/main.ts
	pnpm exec tsx 05-concurrency-and-processes/02-cluster-multicore/main.ts
	pnpm exec tsx 05-concurrency-and-processes/03-worker-threads-cpu-bound/main.ts

run-06:
	pnpm exec tsx 06-data-layer-and-auth/01-zod-runtime-validation/main.ts
	pnpm exec tsx 06-data-layer-and-auth/02-sqlite-embedded-database/main.ts
	pnpm exec tsx 06-data-layer-and-auth/03-auth-cookie-session-jwt/main.ts

run-07:
	pnpm exec tsx 07-modern-web-frameworks/01-fastify-core-and-plugins/main.ts
	pnpm exec tsx 07-modern-web-frameworks/02-nestjs-ioc-and-aop/main.ts

run-08:
	pnpm exec tsx 08-ai-primitives-and-capstone/01-mcp-server-protocol/main.ts
	pnpm exec tsx 08-ai-primitives-and-capstone/02-sse-ai-streaming/main.ts
	pnpm exec tsx 08-ai-primitives-and-capstone/03-capstone-pipeline-orchestration/main.ts

run-all: run-00 run-01 run-02 run-03 run-04 run-05 run-06 run-07 run-08

test:
	node --test 00-toolchain-and-engineering-primer/03-native-test-runner/main.test.ts
