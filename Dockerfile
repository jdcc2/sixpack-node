#
FROM nodesource:xenial:argon
RUN mkdir -p /opt/sixpack
WORKDIR /opt/sixpack
COPY package.json /opt/sixpack
RUN npm install
#Copy all source files
COPY . /opt/sixpack
EXPOSE 3000
CMD [ "node", "app.js" ]
