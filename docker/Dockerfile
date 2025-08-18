# FROM node:22.17.0-alpine

# WORKDIR /frontend

# COPY ./frontend/package.json ./frontend/package-lock.json* ./

# RUN yarn install

# COPY ./frontend .

# CMD ["yarn", "dev"]
# docker/Dockerfile.prod

###########
# BUILDER #
###########
# docker/Dockerfile
FROM node:22.17.0-alpine

# where we'll live in the container
WORKDIR /frontend

# bring in only the lockfiles + manifest, install deps
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# copy everything else
COPY frontend ./

# allow Next.js to bind to 0.0.0.0
ENV HOST=${APP_HOST:-0.0.0.0}
ENV PORT=${APP_PORT:-3000}

EXPOSE ${PORT}

# # next dev needs the --hostname flag to bind publicly
# CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "${PORT}"]
# use shell form so vars get expanded at runtime
CMD sh -c "npm run dev -- --hostname $HOST --port $PORT"