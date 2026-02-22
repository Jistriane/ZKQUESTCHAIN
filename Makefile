SHELL := /usr/bin/env bash

.PHONY: circuit contracts frontend

circuit:
	./scripts/build_circuit.sh

contracts:
	./scripts/build_contracts.sh

frontend:
	cd frontend && npm install && npm run build
