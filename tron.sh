export ENV_CONFIG=config-stag
# export ENV_CONFIG=config-bex-prod
# export ENV_CONFIG=config-tpf-prod

echo 'Starting Tron-Application'
sleep 2s
echo 'The following configuration are active:'+ENV_CONFIG
sleep 1s
echo 'Finish :Scanning Database configuration and repository.'
sleep 1s
echo 'TronApplication initialized with port(s): '6001' (http)'

#Tron MainNet url
# export TRON_URL = https://api.trongrid.io

nohup node server.js &

echo 'Application started .....'