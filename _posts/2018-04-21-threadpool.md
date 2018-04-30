---
layout: post
title: java-thread-pool
---


#### ThreadPoolExecutor

```
#ThreadPoolExecutor 线程池核心类

public ThreadPoolExecutor(
							  int corePoolSize,
                              int maximumPoolSize,
                              long keepAliveTime,
                              TimeUnit unit,
                              BlockingQueue<Runnable> workQueue,
                              ThreadFactory threadFactory,
                              RejectedExecutionHandler handler) {}

> corePoolSize线程池的基本大小；当线程提交到线程池，线程池会创建一个线程来执行任务，即使现在有空闲线程存在；
>> 如果调用了prestartAllCoreThreads方法，线程池会提前创建并启动所有基本线程。

> maximumPoolSize线程池最大大小；如果队列满了，并且已创建的线程数小于最大线程数，线程池会再创建新的线程执行任务。
>> 如果使用了无界的任务队列，这个参数没有意义；

> workQueue保存等待执行的任务阻塞队列，可以选择：
>> ArrayBlockingQueue数组结构的有界阻塞队列FIFO；Executors.newSingleThreadExecutor()使用了该队列；
>> LinkedBlockingQueue链表结构的有界阻塞队列FIFO；Executors.newFixedThreadPool()使用了该队列；
>> SynchronousQueue不存储元素的队列，插入须等待另一个线程移除，否则阻塞；Executors.newCachedThreadPool()使用该队列；
>> PriorityBlockingQueue具有优先级的无限阻塞队列；

> keepAliveTime（配套TimeUnit使用）线程活动保持时间；线程池工作线程空闲后，保持存活时间；

> ThreadFactory用于设置创建线程的工厂；

> RejectedExecutionHandler饱和策略；
>> ThreadPoolExecutor.AbortPolicy：丢弃任务并抛出RejectedExecutionException异常。 
>> ThreadPoolExecutor.DiscardPolicy：也是丢弃任务，但是不抛出异常。 
>> ThreadPoolExecutor.DiscardOldestPolicy：丢弃队列最前面的任务，然后重新尝试执行任务（重复此过程）
>> ThreadPoolExecutor.CallerRunsPolicy：由调用线程处理该任务 

```

#### 线程池工作流程
```
首先线程池判断基本线程池是否已满？没满，创建一个工作线程来执行任务。满了，则进入下个流程。
其次线程池判断工作队列是否已满？没满，则将新提交的任务存储在工作队列里。满了，则进入下个流程。
最后线程池判断整个线程池是否已满？没满，则创建一个新的工作线程来执行任务，满了，则交给饱和策略来处理这个任务

```

#### 线程池关闭
```
shutdown()：将线程池的状态设置为shutdown状态，中断所有没有正在执行任务的线程；
shutdownnow()：
	遍历线程池的工作线程，然后逐个调用interrupt()来中断线程（无法响应中断的任务可能无法停止）；
	首先会将线程池状态设置为stop，然后尝试停止所有正在执行或暂停的任务线程，并返回等待执行的任务列表；

调用以上两个任意一个方法后，isShutdown()返回true；
当所有任务都已关闭后，才表示线程池关闭成功，调用isTerminaed()返回true；

```

#### 线程池的监控
```
taskCount：线程池需要执行的任务数量。
completedTaskCount：线程池在运行过程中已完成的任务数量。小于或等于taskCount。
largestPoolSize：线程池曾经创建过的最大线程数量。可以知道线程池是否满过。如等于线程池的最大大小，则表示线程池曾经满了。
getPoolSize：线程池的线程数量。如果线程池不销毁的话，池里的线程不会自动销毁，所以这个大小只增不减。
getActiveCount：获取活动的线程数。
getQueue().size()：获取阻塞队列中的线程数。

```

#### 根据任务的类型配置线程池大小：
```
如果是CPU密集型任务，需要尽量压榨CPU，参考值为 NCPU+1
如果是IO密集型任务，参考值为2*NCPU

```

