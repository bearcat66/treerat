#!/bin/sh
source ~/.tr-config/main1
PORT=3001 pm2 start -f /root/treerat/v2/react-backend/bin/www -- 3001
