#!/bin/bash
gridsome build \
	&& scp -r dist/* README.pdf zsolt@storm:/var/www/deepdata.hu/koko/