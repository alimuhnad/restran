FROM node:4.8.0

WORKDIR /app

ADD package.json /app/package.json
RUN npm install

ADD . /app

ENV SERVER_ROOT_URL http://appmob.iraq-soft.info
ENV SERVER_URL http://appmob.iraq-soft.info/parse
ENV PUBLIC_SERVER_URL http://appmob.iraq-soft.info/parse
ENV APP_NAME Appmob Admin Portal
ENV PUSH_ANDROID_SENDER_ID 97155455845
ENV PUSH_ANDROID_API_KEY AIzaSyALppLxh8NHmlaYLc6pcsLNjHwisF-pT2o
ENV PUSH_IOS_BUNDLE_ID info.iraqsoft.appmob
ENV MAILGUN_API_KEY key-57a1662cc6906f4827081a41ef95b973
ENV MAILGUN_DOMAIN mg.iraq-soft.info
ENV MAILGUN_FROM_ADDRESS 'Iraqsoft <info@iraq-soft.info>'
ENV MAILGUN_TO_ADDRESS info@iraq-soft.info

CMD [ "npm", "start" ]
