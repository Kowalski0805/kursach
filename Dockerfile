FROM node:18-alpine

WORKDIR /home/node/app
# RUN npm i
CMD ["npm", "start"]