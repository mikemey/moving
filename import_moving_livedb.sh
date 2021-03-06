#!/bin/bash

DUMP_FILE=live_dump
MONGO_DB="moving"

echo "dumping remote tickers..."
ssh $MSMSERVER /bin/bash << EOF
  mongodump --db=${MONGO_DB} --gzip --archive=$DUMP_FILE
EOF

echo "transferring dump file..."
rsync --progress --partial -r $MSMSERVER:~/$DUMP_FILE .

echo "importing dump file..."
mongorestore --drop --gzip --archive=$DUMP_FILE

echo "cleanup..."
rm $DUMP_FILE
ssh $MSMSERVER /bin/bash << EOF
  rm $DUMP_FILE
EOF

echo "done"
