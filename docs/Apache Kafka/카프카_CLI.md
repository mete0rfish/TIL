# 카프카 토픽 CLI
```bash
kafka-topics --command-config playground.config --bootstrap-server localhost:9092 --topic forst_topic --create --partitions 1
```

```bash
kafka-topics --command-config playground.config --bootstrap-server localhost:9092 --list
```

# 카프카 콘솔 프로듀서 CLI

```bash
kafka-console-producer --producer.config playground.config --bootstrap-server localhost:9092 --topic first_topic
```

```bash
kafka-console-producer --producer.config playground.config --bootstrap-server localhost:9092 --topic first_topic --property parse.key=true --property key.separator=:
```

# 카프카 콘솔 컨슈머 CLI
