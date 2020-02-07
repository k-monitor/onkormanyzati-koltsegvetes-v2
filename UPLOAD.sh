#!/bin/bash
gridsome build \
	&& md2pdf README.md \
	&& scp -r dist/* README.pdf zsolt@storm:/var/www/deepdata.hu/koko/