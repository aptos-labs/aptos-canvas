# syntax=docker/dockerfile:1.4
FROM rust:1.72 as builder

WORKDIR /repo
COPY --link Cargo.toml Cargo.lock /repo/
COPY --link . /repo/

RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    # only build the service binary
    cargo build --config net.git-fetch-with-cli=true --release -p service

FROM buildpack-deps:bullseye

WORKDIR /app
COPY --link --from=builder /repo/target/release/service /usr/local/bin/service

ENTRYPOINT ["service"]
