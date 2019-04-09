
echo 'initialize server.............'
# sleep 5  
echo 'initialze database......'
# sleep 2
echo 'creating collection........'
# sleep 3
echo 'insert default value in the collection.....'
# sleep 2
echo 'doing clean up operation please wail for a second....'
# sleep 3
nohup node src/root/initialize.js
echo 'Tron alert runing successfully.....'
sleep 3