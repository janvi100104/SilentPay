#!/bin/bash
curl -sf -H 'Content-Type: application/json' -d '{"id":1,"jsonrpc":"2.0","method":"chain_getBlockHash","params":[1]}' http://127.0.0.1:9944
echo ""
echo "---"
curl -sf -H 'Content-Type: application/json' -d '{"id":1,"jsonrpc":"2.0","method":"chain_getBlockHash","params":[1]}' http://127.0.0.1:8088/api/v4/graphql
echo ""
