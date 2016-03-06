#!/bin/bash
FILES=/var/www/download/data/*
for f in $FILES
do
	#cat /var/log/nginx/mirror.lo* | grep "/mirror/$(basename "$f")/" | grep -v "68.180.230.246" | wc -l
	echo "$(basename "$f") | $(cat /var/log/nginx/mirror.lo* | grep "/mirror/$(basename "$f")/" | grep -v "68.180.230.246" | grep -v "Baiduspider/2.0" | grep -v "http://www.mfisoft.ru/analyst/" | grep -v "http://ahrefs.com/robot/" | wc -l)"
done
