---
layout: post
title: thread-auxiliary
---

#### 多线程辅助类

##### CountDownLatch和CyclicBarrier都能够实现线程之间的等待，只不过它们侧重点不同：

```
># CountDownLatch一般用于某个线程A等待若干个其他线程执行完任务之后，它才执行；
># CyclicBarrier一般用于一组线程互相等待至某个状态，然后这一组线程再同时执行；
># Semaphore其实和锁有点类似，它一般用于控制对某组资源的访问权限

>># CountDownLatch是不能够重用的，而CyclicBarrier是可以重用的。

```

##### CountDownLatch
```
public CountDownLatch(int count);  		//参数count为计数值
public void await();   					//线程挂起，直到count值为0才继续执行
public boolean await(long timeout, TimeUnit unit);  //和await()类似，超时后，count没变为0扔继续执行
public void countDown();  			//将count值减1

```

##### CyclicBarrier
```
public CyclicBarrier(int parties) {}
public CyclicBarrier(int parties, Runnable barrierAction) {}
//参数parties指让多少个线程或者任务等待至barrier状态；
//参数barrierAction为当这些线程都达到barrier状态时会执行的内容。


// 挂起当前线程，直至所有线程都到达barrier状态再同时执行后续任务
public int await(); 
// 同上，超时后如果还有线程未达到barrier状态，让达到barrier状态的线程执行
public int await(long timeout, TimeUnit unit);
 
```

##### Semaphore
```
Semaphore翻译成字面意思为 信号量，
Semaphore可以控同时访问的线程个数，
		通过 acquire() 获取一个许可，如果没有就等待，
		而 release() 释放一个许可。

//参数permits表示许可数目，即同时可以允许多少线程进行访问
public Semaphore(int permits) 
//参数fair表示是否公平，即等待时间越久的越先获取许可
public Semaphore(int permits, boolean fair)


// 方法
public void acquire() 			//获取一个许可
public void acquire(int permits) //获取permits个许可
public void release() 			//释放一个许可
public void release(int permits) //释放permits个许可

public int availablePermits() //得到可用的许可数目
 
```


