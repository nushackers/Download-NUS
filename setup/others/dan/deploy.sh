cd /var/www/Download-NUS
git reset --hard HEAD
git pull
#npm install --python=/usr/bin/python26
#npm update --python=/usr/bin/python26
grunt deploy-compile
TMPDIR=/var/www/mirror3/dan-tmp/ forever restart /var/www/Download-NUS/index.js
