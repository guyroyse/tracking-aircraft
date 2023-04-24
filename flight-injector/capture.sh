nc localhost 30002 | while read line; do echo "$(date -Iseconds) $line"; done
