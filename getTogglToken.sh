#!/bin/bash
echo "Please instert your Toggl token here (you can find it on your profile page https://toggl.com/app/profile):"
read -p "API Token: " token
echo -e "{\n \"api_token\": \"${token}\"\n}" > token.json