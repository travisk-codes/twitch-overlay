#!/bin/bash

while inotifywait -r -e modify,create,delete,move .; do
	sudo npm run build
done