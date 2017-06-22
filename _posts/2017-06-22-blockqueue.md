---
layout: post
title: 阻塞队列BlockingQueue
---


### 阻塞队列BlockingQueue

* 如果队列是空的,取东西的操作将会被阻断进入等待状态,直到队列进了数据才会被唤醒.
* 如果队列是满的,任何存东西的操作也会被阻断进入等待状态,直到队列里有空间才会被唤醒. 

#### 常用方法

```
1)add(object):添加数据；如果BlockingQueue可以容纳,则返回true,否则报异常 
2)offer(object):添加数据；如果BlockingQueue可以容纳,则返回true,否则返回false.
3)put(object):添加数据,如果BlockQueue没有空间,则调用此方法的线程被阻断直到BlockingQueue里面有空间再继续. 
4)addAll(objects):批量添加数据；能放进多少放多少，如果队列满则抛异常，剩余数据丢失.


5)poll(_time):取走排在首位的对象,若不能立即取出,则可以等time参数规定的时间,取不到时返回null.
6)take():取走排在首位的对象,若BlockingQueue为空,阻断进入等待状态直到Blocking有新的对象被加入为止.

```

#### 具体的实现类

```
1)ArrayBlockingQueue:规定大小的BlockingQueue;
	构造函数必须带一个int参数指明大小.所含的对象以FIFO(先入先出)顺序排序. 
2)LinkedBlockingQueue:大小不定的BlockingQueue;
	若构造函数带一个规定大小的参数,则有大小限制;否则大小由Integer.MAX_VALUE来决定.对象是以FIFO(先入先出)顺序排序的 
	
3)PriorityBlockingQueue:类似于LinkedBlockQueue;但排序不是FIFO,而是依据对象的自然顺序或构造函数的Comparator决定顺序. 
4)SynchronousQueue:特殊的BlockingQueue,对其的操作必须是放和取交替完成的. 

```

#### LinkedBlockingQueue和ArrayBlockingQueue比较

```
LinkedBlockingQueue的数据吞吐量要大于ArrayBlockingQueue.
但在线程数量很大时其性能的可预见性低于ArrayBlockingQueue.     

```	

#### 生产者，消费者

```
public class Test {

	private static final ArrayBlockingQueue<String> LIST = new ArrayBlockingQueue<String>(1000);
	private static boolean isOver = false;

	public static void read() {
		while (!Thread.interrupted()) {
			try {
				String str = "";
				// dosomething

				LIST.put(str);

				// 完成任务，将标记isOver置为true
				// isOver = true;
			} catch (Exception e) {
				e.printStackTrace();
			} finally {
				isOver = true;
			}
		}
	}

	public static void process() {
		while (!Thread.interrupted()) {
			try {
				String str = LIST.poll(5, TimeUnit.SECONDS);
				if (str == null) {
					if (isOver) {
						System.out.println("处理完毕");
						System.exit(0);
					} else {
						try {
							Thread.sleep(1000);
						} catch (Exception e) {
						}
						continue;
					}
				}
				// dosomething

			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	/**
	 * 一个线程生产，多个线程消费
	 */
	public static void main(String[] args) {
		Executors.newSingleThreadExecutor().submit(new Runnable() {
			@Override
			public void run() {
				read();
			}
		});

		int threadNum = 4;
		ExecutorService es = Executors.newFixedThreadPool(threadNum);
		for (int i = 0; i < threadNum; i++) {
			es.execute(new Runnable() {
				@Override
				public void run() {
					process();
				}
			});
		}
	}
}

```
