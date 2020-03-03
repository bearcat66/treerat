#!/bin/sh
source ~/.tr-config/main1
PORT=3001 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3001
source ~/.tr-config/main2
PORT=3002 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3002
source ~/.tr-config/main3
PORT=3003 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3003
source ~/.tr-config/main4
PORT=3004 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3004
source ~/.tr-config/main5
PORT=3005 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3005
source ~/.tr-config/main1
PORT=3006 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3006
source ~/.tr-config/main2
PORT=3007 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3007
source ~/.tr-config/main3
PORT=3008 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3008
