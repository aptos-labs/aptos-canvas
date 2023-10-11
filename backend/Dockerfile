# syntax=docker/dockerfile:1.4
FROM rust:1.72-bullseye as builder

WORKDIR /repo
COPY --link Cargo.toml Cargo.lock /repo/
COPY --link . /repo/

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    # only build the service binary
    cargo build --config net.git-fetch-with-cli=true --release -p service

FROM debian:bullseye-slim

RUN apt-get update && apt-get install -y build-essential ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --link --from=builder /repo/target/release/service /usr/local/bin/service

ENTRYPOINT ["service"]
