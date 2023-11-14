-   Conda environment

```
conda activate databases_m3
```

-   Start Cassandra docker container

```
docker run -d --name cassandra-docker -v ~/docker_volumes/cassandra:/var/lib/cassandra -p 9042:9042 cassandra
```
