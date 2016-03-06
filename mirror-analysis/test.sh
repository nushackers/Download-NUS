#!/bin/bash
FILES=/var/www/download/data/*
for f in $FILES
do
	#cat /var/log/nginx/mirror.lo* | grep "/mirror/$(basename "$f")/" | grep -v "68.180.230.246" | wc -l
	echo "$(basename "$f") | $(cat /var/log/nginx/mirror.lo* | grep "/mirror/$(basename "$f")/" | grep -v "68.180.230.246" | wc -l)"
done