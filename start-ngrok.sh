#!/bin/bash
gnome-terminal -- ngrok http --domain=noted-aardvark-superb.ngrok-free.app 4000

# Explicitly mention the full path to nodemon
nodemon -r ts-node/register ./src/server.ts
