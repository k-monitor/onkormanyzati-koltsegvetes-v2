#!/bin/bash
gridsome build \
	&& md2pdf README.md \
	&& scp -P 2267 -r dist/* README.pdf ahalo@ahalo.hu:/var/www/deepdata.hu/terezvaros.koko/