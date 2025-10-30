#!/bin/bash
set -e

cd "$(dirname $0)"

TARGET="${CARGO_TARGET_DIR:-target}"

rustup target add wasm32-unknown-unknown

cargo build --target wasm32-unknown-unknown --profile app-release

mkdir -p res

cp $TARGET/wasm32-unknown-unknown/app-release/calimero_marketplace.wasm ./res/

if command -v wasm-opt > /dev/null; then
  wasm-opt -Oz ./res/calimero_marketplace.wasm -o ./res/calimero_marketplace.wasm
fi

# Remove state_root from ABI for compatibility with codegen 0.1.1
if command -v jq > /dev/null && [ -f ./res/abi.json ]; then
  jq 'del(.state_root)' ./res/abi.json > ./res/abi.tmp.json && mv ./res/abi.tmp.json ./res/abi.json
fi
