---                                                                                                                                                                                                                                    
layout: post
title: zookeeper安装
---

#### zookeeper安装

```
1.安装java
2.安装zookeeper
#http://zookeeper.apache.org/releases.html
wget http://apache.claz.org/zookeeper/zookeeper-3.4.11/zookeeper-3.4.11.tar.gz
tar -zxf zookeeper-xxx.tar.gz
cd zookeeper-xxx
mkdir data


## 配置文件
vim conf/zoo.cfg
>tickTime=2000
>dataDir=/data/soft/zookeeper/data
>clientPort=2181
>initLimit=5
>syncLimit=2


## 启动zk服务器
bin/zkServer.sh start
# ZooKeeper JMX enabled by default
# Using config: /data/soft/zookeeper-3.4.11/bin/../conf/zoo.cfg
# Starting zookeeper ... STARTED


## 命令
bin/zkServer.sh start/stop/status/restart


## 启动CLI客户端
bin/zkCli.sh


```

#### zkClient命令
```
ls [path]	// 显示当前节点内容
ls2	[path]  // 显示当前节点数据，并能看到更新次数等数据
create [path] [data]	// 创建节点并赋值
get [path]	// 获取节点内容
set [path] [data]	// 修改节点内容
delete [path]		// 删除节点
rmr [path] 	//删除指定节点并递归删除子节点

create -s [path] [data] //创建顺序节点
create -e [path] [data]	//创建临时节点，client断开节点消失

quit		// 退出


>create /node1 "this is node1"
>get /node1
>set /node1 "change node1"
>set /node1/node11 "node11 in node1"
>get /node1/node11

```

#### shell交互
```
## 获取 ZooKeeper 服务的当前状态及相关信息。用户在客户端可以通过 telnet 或 nc 向 ZooKeeper 提交相应的命令

1. echo stat | nc 127.0.0.1 2181 ,查看哪个节点被选择作为follower或者leader
2. echo ruok | nc 127.0.0.1 2181 ,测试是否启动了该Server，若回复imok表示已经启动。
3. echo dump | nc 127.0.0.1 2181 ,列出未经处理的会话和临时节点。
4. echo kill | nc 127.0.0.1 2181 ,关掉server
5. echo conf | nc 127.0.0.1 2181 ,输出相关服务配置的详细信息。
6. echo cons | nc 127.0.0.1 2181 ,列出所有连接到服务器的客户端的完全的连接 / 会话的详细信息。
7. echo envi | nc 127.0.0.1 2181 ,输出关于服务环境的详细信息（区别于 conf 命令）。
8. echo reqs | nc 127.0.0.1 2181 ,列出未经处理的请求。
9. echo wchs | nc 127.0.0.1 2181 ,列出服务器 watch 的详细信息。
10. echo wchc | nc 127.0.0.1 2181 ,通过 session 列出服务器 watch 的详细信息，它的输出是一个与 watch 相关的会话的列表。
11. echo wchp | nc 127.0.0.1 2181 ,通过路径列出服务器 watch 的详细信息。它输出一个与 session 相关的路径。


```

#### 安装zkui

```
# maven
wget http://mirrors.hust.edu.cn/apache/maven/maven-3/3.5.2/binaries/apache-maven-3.5.2-bin.tar.gz
tar -xvf apache-maven.xxx.tar.gz
vim /etc/profile
>export MAVEN_HOME=/usr/local/maven/apache-maven-3.5.2
>PATH=$JAVA_HOME/bin:$MAVEN_HOME/bin:$PATH
source /etc/profile

mvn -version

# zkui
git clone git@github.com:DeemOpen/zkui.git
cd zkui
mvn clean install
# 会打包成jar文件
# 将zkui下config.cfg和jar文件放置于同目录，修改config.cfg文件,配置zk地址
nohup java -jar zkui-2.0-SNAPSHOT-jar-with-dependencies.jar 1>&2 2>debug.log &

# 访问
http://localhost:9090/

```

