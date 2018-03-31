---
layout: post
title: shadowsocks科学上网
---

#### 下载安装包并执行
```
wget --no-check-certificate https://raw.githubusercontent.com/teddysun/shadowsocks_install/master/shadowsocks.sh
chmod a+x shadowsocks.sh && ./shadowsocks.sh   // 按指示输入密码、端口等

```

#### 起止命令
```
/etc/init.d/shadowsocks  start
/etc/init.d/shadowsocks  stop
/etc/init.d/shadowsocks  restart
/etc/init.d/shadowsocks  status

```

#### python方式
```
apt-get install python-pip
pip install shadowsocks
// 添加配置文件
ssserver -c /etc/shadowsocks.json -d start/stop/restart		//服务端
sslocal -c /etc/shadowsocks.json -d start/stop/restart		//客户端

```

#### 配置(服务端)
```
/etc/shadowsocks.json
{
    "server":"0.0.0.0",
    "local_address":"127.0.0.1",
    "local_port":1080,
    "port_password":{
        "1080":"XXX",
        "2080":"XXX"
    },
    "timeout":300,
    "method":"chacha20",
    "fast_open":false
}

```

#### 配置(客户端)
```
{
	"server":"remote-shadowsocks-server-ip",
	"server_port":443,
	"local_address":"127.0.0.1",
	"local_port":1080,
	"password":"ss-passwd",
	"timeout":300,
	"method":"chacha20-ietf",
	"fast_open":false,
	"workers":1
}

```


#### 安装libsodium支持chacha20编码
##### centos
```
yum -y groupinstall "Development Tools"
wget https://github.com/jedisct1/libsodium/releases/download/1.0.11/libsodium-1.0.11.tar.gz
tar xf libsodium-1.0.11.tar.gz && cd libsodium-1.0.11
./configure && make -j2 && make install
echo /usr/local/lib > /etc/ld.so.conf.d/usr_local_lib.conf
ldconfig

```

##### ubuntu
```
apt-get install build-essential
wget https://github.com/jedisct1/libsodium/releases/download/1.0.11/libsodium-1.0.11.tar.gz
tar xf libsodium-1.0.11.tar.gz && cd libsodium-1.0.11
./configure && make -j2 && make install
ldconfig

```


#### 防火墙，添加端口
```
firewall-cmd --permanent --zone=public --add-port=你的端口/tcp
firewall-cmd --reload
systemctl stop firewalld	// 关闭防火墙

```

