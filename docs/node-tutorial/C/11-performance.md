# C11 性能测量

对应示例：[`examples/node-tutorial/C/11-perf.mjs`](../../../examples/node-tutorial/C/11-perf.mjs)

## 先量再改

没有基线时，加缓存、加 Worker、改 `highWaterMark` 都无法判断。一次测量至少说明：测的是哪段代码、机器上还有什么、重复了几次。

## 事件循环延迟

`monitorEventLoopDelay({ resolution: 10 })` 采样“定时器比预期晚了多久”。示例开启它，等 40ms，再关掉，并断言 `mean` 是数字、`max >= 0`。单位是纳秒。数值随机器变化，示例不断言某个毫秒数。

延迟升高的常见原因：主线程在做 CPU 计算、同步文件 API、超大的 JSON 解析、垃圾回收停顿。线程池满会让 I/O 回调变慢，延迟直方图也会变差。

## 标记

```javascript
performance.mark('a');
performance.mark('b');
performance.measure('ab', 'a', 'b');
```

`duration` 是两个标记之间的毫秒数。示例只断言它大于等于 0。用它量一段纯计算或一次函数调用。量网络往返时，把标记打在发起前和响应后，并分开记录状态码。

`performance.now()` 是单调时钟，适合算间隔。`Date.now()` 是墙钟，可以被校时拨动。

## CPU 剖面

`node --prof 脚本` 生成 V8 日志，再用 `node --prof-process` 汇总。它告诉你时间花在 JavaScript 函数还是 C++ 绑定上。

检查器的 CPU 剖面适合开发环境。生产上持续开着检查器会有开销，也不要对公网暴露 9229。

## 活跃资源

`process.getActiveResourcesInfo()` 列出仍把事件循环留住的资源类型。进程该退出却不退出时，用它看是定时器、服务器还是套接字。示例只断言返回值是数组（长度非负）。

## 自测

1. 事件循环延迟直方图的单位是什么？纳秒。
2. 为什么用 `performance.now` 算间隔？它是单调的。
3. `--prof` 用来回答什么问题？CPU 时间花在哪些函数上。
