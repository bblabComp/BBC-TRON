
echo 'Reading Environment .........'
echo 'Success ......'
# export orgWallet = TGQ1EuFx8wpPJErtcCYLVigpT8r3kuHDgj

# export MAIN_URL = http://localhost:8087/api/v1/tron

# #Tron TestNet url
# export TRON_URL = https://api.shasta.trongrid.io

export ENV_CONFIG=config-stag
# export ENV_CONFIG=config-bex-prod
# export ENV_CONFIG=config-tpf-prod

#Tron MainNet url
# export TRON_URL = https://api.trongrid.io

nohup node server.js &

echo 'Application started .....'