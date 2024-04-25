docker stop data-parser;
docker rm data-parser;
docker run -d --name=data-parser -v ./env:/home/node/app/env:ro -v ./tg-auth:/home/node/app/tg-auth:ro -v ./data:/home/node/app/data data-parser