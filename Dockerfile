FROM nodesource/xenial:latest
RUN mkdir -p /opt/sixpack
WORKDIR /opt/sixpack
COPY package.json /opt/sixpack
RUN npm install
#Copy all source files
COPY . /opt/sixpack
CMD [ "node", "app.js" ]
EXPOSE 3000
