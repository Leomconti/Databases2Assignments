#!/bin/bash

# Get into the data directory
docker exec -it mysql bash -c "cd /data && mysql -u root --password=admin123 < employees.sql"

# Test the database out:
# docker exec -it mysql mysql -u root --password=admin123    
# select * from salaries LIMIT 10;