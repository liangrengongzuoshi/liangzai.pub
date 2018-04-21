---                                                                                                                                                                                                                                    
layout: post
title: thread-state
---

### java.lang.Thread.State
```
NEW---->RUNNABLE---->BLOCKED---->WAITING---->TIMED_WAITING---->TERMINATED

```

```
1、创建状态（Thread.State.NEW）
	只是创建了一个线程，而没有启动它（start）则线程状态为创建状态,并没有获得应有的资源。

2、可运行状态（Thread.State.RUNNABLE）
	调用t.start()启动一个线程，使该线程进入可运行的状态，并进入就绪队列中，当线程获取CPU的时间片则开始运行。

3、阻塞状态（Thread.State.BLOCKED）
	受阻塞并且正在等待监视器锁的线程状态。其正在等待监视器锁，以便进入一个同步的块/方法，或者在调用 Object.wait之后再次进入同步的块/方法。

4、等待状态（Thread.State.WAITING、TIMED_WAITING）
	a)Thread.State.WAITING：处于等待状态的线程正等待另一个线程，以执行特定操作。因为调用下列方法之一而处于等待状态：
		不带超时值的 Object.wait()
		不带超时值的 Thread.join()
		LockSupport.park()
	b)具有指定等待时间的某一等待线程的线程状态。
		Thread.sleep()
		带有超时值的 Object.wait()
		带有超时值的 Thread.join()
		LockSupport.parkNanos()
		LockSupport.parkUntil()

5、结束状态（Thread.State.TERMINATED）

```


