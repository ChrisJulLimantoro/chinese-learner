PYTHON := uv run python
APP    := app.py

.PHONY: install run reset clean docker-up docker-down docker-logs

install:
	uv sync

run:
	$(PYTHON) $(APP)

reset:
	rm -f progress.db progress.db-shm progress.db-wal
	rm -f data/progress.db data/progress.db-shm data/progress.db-wal
	@echo "Progress cleared. Run 'make run' to start fresh."

clean:
	rm -rf .venv __pycache__ src/learner/__pycache__ src/learner/ui/__pycache__
	find . -name "*.pyc" -delete
	find . -name "*.pyo" -delete

docker-up:
	mkdir -p data
	docker-compose up --build -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f
