---
layout: post
title: Storm 读取kafka
---

#### storm 读取kafka消息配置

```
public class SpoutConfig extends KafkaConfig implements Serializable {
    public List<String> zkServers = null; 	//记录Spout读取进度所用的zookeeper的host
    public Integer zkPort = null;			//记录进度用的zookeeper的端口
    public String zkRoot = null;			//进度信息记录于zookeeper的哪个路径下
    public String id = null;				//进度记录的id，想要一个新的Spout读取之前的记录，应把它的id设为跟之前的一样。
    public long stateUpdateIntervalMs = 2000;//用于metrics,多久更新一次状态。
 
    public SpoutConfig(BrokerHosts hosts, String topic, String zkRoot, String id) {
        super(hosts, topic);
        this.zkRoot = zkRoot;
        this.id = id;
    }
}

```

```
public final BrokerHosts hosts; //用以获取Kafka broker和partition的信息
public final String topic;//从哪个topic读取消息
public final String clientId; // SimpleConsumer所用的client id
 
public int fetchSizeBytes = 1024 * 1024; //发给Kafka的每个FetchRequest中，用此指定想要的response中总的消息的大小
public int socketTimeoutMs = 10000;//与Kafka broker的连接的socket超时时间
public int fetchMaxWait = 10000;   //当服务器没有新消息时，消费者会等待这些时间
public int bufferSizeBytes = 1024 * 1024;//SimpleConsumer所使用的SocketChannel的读缓冲区大小
public MultiScheme scheme = new RawMultiScheme();//从Kafka中取出的byte[]，该如何反序列化
public boolean forceFromStart = false;//是否强制从Kafka中offset最小的开始读起
public long startOffsetTime = kafka.api.OffsetRequest.EarliestTime();//从何时的offset时间开始读，默认为最旧的offset
public long maxOffsetBehind = 100000;//KafkaSpout读取的进度与目标进度相差多少，相差太多，Spout会丢弃中间的消息
public boolean useStartOffsetTimeIfOffsetOutOfRange = true;//如果所请求的offset对应的消息在Kafka中不存在，是否使用startOffsetTime
public int metricsTimeBucketSizeInSecs = 60;//多长时间统计一次metrics
    
```

