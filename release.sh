#!/bin/bash

mkdir secrets && cd secrets
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key -N ""
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
ssh-keygen -t rsa -b 4096 -m PEM -f refreshTokenRS256.key -N ""
openssl rsa -in refreshTokenRS256.key -pubout -outform PEM -out refreshTokenRS256.key.pub
