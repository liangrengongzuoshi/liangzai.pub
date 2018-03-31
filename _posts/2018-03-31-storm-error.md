---
layout: post
title: One Storm Error Record
---


### storm的ui页面查看topo启动着，但却没有消费，几个小时内ack数量为0；

#### 发现部分异常日志
```
b.s.d.supervisor [INFO] 8fa284d2-fa65-49cf-92cb-2bbbcc9cda9a still hasn't started
b.s.d.supervisor [INFO] 8fa284d2-fa65-49cf-92cb-2bbbcc9cda9a still hasn't started
b.s.d.supervisor [INFO] 8fa284d2-fa65-49cf-92cb-2bbbcc9cda9a still hasn't started

b.s.d.supervisor [INFO] Removing code for storm id ins-xxxx-platform_tomcat_xxxx-7-1520835552
b.s.d.supervisor [INFO] Shutting down and clearing state for id 2b1f4e18-7630-46a7-b66f-1cf8fabf93ea. Current supervisor time: 1520835232. State: :disallowed, Heartbeat: #backtype.storm.daemon.common.WorkerHeartbeat{:time-secs 1520835232, :storm-id "ins-xxxx-platform_tomcat_xxxx-2-1520588881", :executors #{[2 2] [-1 -1] [1 1]}, :port 6707}
b.s.d.supervisor [INFO] Shutting down b3992bfb-a1c6-4ddc-a5ee-8671b2992b99:2b1f4e18-7630-46a7-b66f-1cf8fabf93ea
b.s.d.supervisor [INFO] Shut down b3992bfb-a1c6-4ddc-a5ee-8671b2992b99:2b1f4e18-7630-46a7-b66f-1cf8fabf93ea
b.s.d.supervisor [INFO] Downloading code for storm id ins-xxxx-platform_tomcat_xxxx-7-1520835552 from /data/storm/data/nimbus/stormdist/ins-xxxx-platform_tomcat_xxxx-7-1520835552
b.s.d.supervisor [INFO] Finished downloading code for storm id ins-xxxx-platform_tomcat_xxxx-7-1520835552 from /data/storm/data/nimbus/stormdist/ins-xxxx-platform_tomcat_xxxx-7-1520835552
b.s.d.supervisor [INFO] Launching worker with assignment #backtype.storm.daemon.supervisor.LocalAssignment{:storm-id "ins-xxxx-platform_tomcat_xxxx-7-1520835552", :executors ([1 1] [2 2])} for this supervisor b3992bfb-a1c6-4ddc-a5ee-8671b2992b99 on port 6707 with id 8fa284d2-fa65-49cf-92cb-2bbbcc9cda9a

```

#### 原因
```
#GC导致程序暂停，Nimbus收不到Supervisor的心跳；
#Nimbus认为worker死掉，并重启topology;

#频繁GC或GC时间过长有可能是分配内存较小，可适当加大分配内存；


// 增加心跳超时时间
nimbus.task.timeout.secs: 600
nimbus.supervisor.timeout.secs: 600

```
