docker-compose up --build -d
./wait-for-it.sh localhost:5432 -- docker exec -it app npm run migration:run
