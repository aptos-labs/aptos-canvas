# Aptos Canvas: Processor

## Crates
When we say "pixel data" we mean specifically the pixels of the canvas. When I say "metadata" I mean everything else, e.g. pixel attribution information.

- `api`: Contains a few components. It can be run as a standalone service but also used as a library (i.e. in `service`).
  - `metadata_api`: The API that sits on top of the DB. This serves canvas metadata as a GraphQL API.
  - `pixels_api`: This serves pixel data from local storage through the mmap. This is only useful when using local storage for the pixel data. Otherwise serving the pixel data is not the concern of this code, e.g. if it is hosted on GCS, where it is already directly accessible.
- `processor`: This tails the txn stream service, writes pixel data to file storage, and writes canvas metadata to a DB. It can be run as a standalone service but also used as a library (i.e. in `service`).
- `pixel-storage`: Logic for storing pixel data in file storage.
- `metadata-storage`: Logic for storing canvas metadata in the DB.
- `migrations`: Written by hand, this defines the DB schema. Use this to setup tables in the DB.
- `entities`: This reads the tables in the DB and defines entities to help with reading to / writing from the DB and making it possible to expose data via GraphQL (courtesy of Seaography derive magic).
- `move-types`: The `src/` in this dir is generated based on the GraphQL schema representation of the ABI of the Move module. See below for how to regenerate it.
- `service`: Top level service that ties it all together. It can run the 3 desired combinations of services. We do this all in one place for convenience since coupling all the deps isn't a big deal.

## Configuration
The `service` crate uses [Figment](https://github.com/SergioBenitez/Figment) to parse configuration. This means you can set config values in a file as well as env vars and they will be parsed hierarchically and merged into one final config. For more information about how this works see the `Config::from_str` function in [`service/src/config.rs`](service/src/config.rs).

## Local Development
Make sure you have postgres installed and running.

Spin up a local development environment (node API + txn stream service):
```
aptos node run-local-testnet --force-restart --assume-yes
```

Recreate the DB (you need to update the user here to your postgres username):
```
psql postgres://dport@127.0.0.1:5432/postgres -c 'DROP DATABASE IF EXISTS canvas' && psql postgres://dport@127.0.0.1:5432/postgres -c 'CREATE DATABASE canvas'
```

Run the processor:
```
rm -rf /tmp/canvases && mkdir /tmp/canvases
cargo run -p service -- -c configs/local.yaml
```

The metadata API will be running at http://127.0.0.1:7645. You can access the gql playground at http://127.0.0.1:7645/v1/metadata/graphql.

You should also expect to see images appear from the LocalFlusher at `/tmp/flushed`.

## Running against testnet
Get an auth key for the txn stream service from the API gateway site: https://aptos-api-gateway-prod.firebaseapp.com/api-keys.

Replace `replace_me` in `configs/example_testnet.yaml` with the auth key.

Do the step above where you replace the DB.

Run the processor using the testnet config:
```
cargo run -p service -- -c configs/example_testnet.yaml
```

## Updating DB
Install the necessary tools:
```
cargo install sea-orm-cli@^0.12
```

To change the DB, first go to `migrations/` and create a new migration (see the README there).

To run migrations, assuming you have already created a `canvas` database:
```
sea-orm-cli migrate -d migrations --database-url postgres://dport:@localhost/canvas
```

Now, to generate entities with GraphQL hooked up, do this:
```
sea-orm-cli generate entity --lib --seaography -o entities/src --database-url postgres://dport:@localhost:5432/canvas
```

If you added a new table, make sure to go register it with the API GraphQL schema at `api/src/metadata_api/schema.rs`.

## Generating Move types
See [../move/README.md](../move/README.md).

## Building Docker Image
Make sure you have a Docker buildx builder set up, then run this:
```
GIT_SHA=local GCP_DOCKER_ARTIFACT_REPO=local docker buildx bake --progress=plain --load -f ./docker-bake.hcl
```

Use the image like this:
```
docker run local/graffio-backend:local
```

You may need to prefix that with `DOCKER_DEFAULT_PLATFORM=linux/amd64` if you built this image using the remote builder and you're on an ARM machine.

## Notes
- The GraphQL API only accepts account addresses in LONG form without the leading 0x. It returns them the same way.
- For now, the best way to get the schema.graphql file is to go to http://127.0.0.1:7645/metadata/gql and use the Download -> SDL button.
- This code relies on a variety of features that haven't been landed in their repos. This means, particularly with the indexer libs, we do not pick up new features as they come out.
  - To generate the Rust code representing the Move types we rely on banool/rust-move-codegen in aptos-core.
  - To make it possible to write an indexer in a modular way we rely on banool/txn-parsers in aptos-indexer-processors.
