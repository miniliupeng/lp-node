.PHONY: help check lint run-00 run-01 run-02 run-03 run-04 run-05 run-06 run-07 run-08 test

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

check:
	pnpm exec tsc --noEmit

lint:
	pnpm exec biome check --write .

run-00:
	pnpm exec tsx 00-toolchain-and-engineering-primer/01-node-runtime-and-pnpm/main.ts
	pnpm exec tsx 00-toolchain-and-engineering-primer/02-modern-typescript-setup/main.ts
	pnpm exec tsx 00-toolchain-and-engineering-primer/03-native-test-runner/main.ts
	pnpm exec tsx 00-toolchain-and-engineering-primer/04-env-and-configuration/main.ts

test:
	node --test 00-toolchain-and-engineering-primer/03-native-test-runner/main.test.ts
