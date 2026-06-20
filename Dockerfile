FROM python:3.12-slim
WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY app.py ./
COPY src/ ./src/

EXPOSE 8080
CMD ["uv", "run", "python", "app.py"]
