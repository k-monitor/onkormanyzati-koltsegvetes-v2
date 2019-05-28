#!/bin/bash
#rm -rf _site/*
#mkdir -p _site
#tar czf _site/jekyll-source.tgz _layouts 2* assets .gitignore .htaccess *.yml *.json *.md
#jekyll build
#scp -r ./_site/* ./_site/.htaccess zsolt@storm:/var/www/deepdata.hu/koko/
scp -r css data js index.html README.pdf zsolt@storm:/var/www/deepdata.hu/koko/