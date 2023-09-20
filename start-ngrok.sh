#!/bin/bash
gnome-terminal -- ngrok http 4000

# Explicitly mention the full path to nodemon
/home/kwanso/Documents/Backend/node_modules/.bin/nodemon -r ts-node/register /home/kwanso/Documents/Backend/src/server.ts
