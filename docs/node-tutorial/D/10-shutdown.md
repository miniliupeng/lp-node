# D10 优雅退出

对应示例：[`examples/node-tutorial/D/04-graceful.mjs`](../../../examples/node-tutorial/D/04-graceful.mjs)

## 示例的顺序

1. 服务器开始听
2. 客户端发起 `/slow`，处理函数要等 80ms 才 `end('slow')`
3. 10ms 后调用 `server.close()`
4. 再发起一个普通 `fetch`，它失败（连接被拒绝）
5. `/slow` 的正文仍然是 `slow`
6. `close` 的回调在已有连接结束后执行

`close` 停止接受新连接，已接受的请求继续跑完。示例断言新请求失败、旧请求成功。

## 进程信号

编排器和进程管理器会发 `SIGTERM`。处理函数里：

1. `server.close()`
2. 停止从队列领取新任务
3. 等待进行中的请求和任务，但设置上限（例如 10 秒）
4. 关闭数据库连接
5. 超时仍未结束就让进程退出，由上层拉起

`SIGKILL` 不能被捕获。给优雅退出留的时间必须小于上层“SIGTERM 之后多久 SIGKILL”的配置。

`process.exit()` 会立刻结束，`close` 回调里的收尾可能跑不到。设 `process.exitCode`，让事件循环在句柄清空后自己结束。示例没有调用 `exit`，`close` 完成且没有别的句柄时进程自然结束。

## 还在跑的事件循环

未 `unref` 的定时器、没关的数据库句柄、没销毁的套接字会让进程停在 poll。用 `process.getActiveResourcesInfo()` 看还剩什么。心跳定时器使用 `unref`，见 B08。

## 自测

1. `server.close()` 之后，已经进来的慢请求会怎样？继续执行直到结束。
2. 新连接会怎样？不再接受。
3. 为什么退出要有超时？某个请求卡住时，进程必须能在限定时间里被替换。
