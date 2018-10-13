#!/bin/bash
nodeExecutable=`which node`
nodeInPath="export PATH=${PATH}:${nodeExecutable}"
periodicAction=$(echo "${nodeInPath}\nbtt-toggl"| sed -e 's/[\/&]/\\&/g')
touchAction="${periodicAction} toggle"

echo "Please paste the following json into BetterTouchTool:"
echo "-----------------STARTS ON NEXT LINE-----------------"
cat "btt.json" | sed -e "s/\[TOUCH ACTION\]/${touchAction}/g" | sed -e "s/\[PERIODIC ACTION\]/${periodicAction}/g"
echo "----------------ENDS ON PREVIOUS LINE----------------"

