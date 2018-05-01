---
layout: post
title: ReentrantLock
---

#### ReentrantLock  可重入锁

```
Lock lock=new ReentrantLock(true);//公平锁
Lock lock=new ReentrantLock(false);//非公平锁
公平锁:线程获取锁的顺序是加锁的顺序
非公平锁:指抢锁机制，先lock的线程不一定先获得锁。

1.获得锁的线程，在持有锁期间，如再次请求不需要排队，可直接处理；
2.公平锁模式：线程获取锁的顺序跟请求顺序保持一致；
3.非公平锁模式：不提倡但允许插队，当持有锁或请求锁时间较短，可使用非公平锁，增加插队带来的吞吐量；

```

##### Condtion对象
```
Lock lock = new ReentrantLock();
Condition condition = lock.newCondition();
// 一个condition对象的signal（signalAll）方法和该对象的await方法是一一对应的
// 即一个condition对象不能唤醒其他condition对象的await方法	

// ReentrantLock类可以唤醒指定条件的线程，而object的唤醒是随机的

// 通过创建Condition对象来使线程wait，必须先执行lock.lock方法获得锁
try {
	lock.lock();
	condition.signal();
} finally {
	lock.unlock();
}

```

##### 方法
```
lock()：获得锁，如果锁被占用，进入等待。
lockInterruptibly()：获得锁，但优先响应中断。
tryLock()：尝试获得锁，如果成功，立即放回 true，反之失败返回 false。该方法不会进行等待，立即返回。
tryLock(long time, TimeUnit unit)：在给定的时间内尝试获得锁。
unLock()：释放锁。

```


