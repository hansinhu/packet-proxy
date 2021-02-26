## packet-proxy

一款具有静态资源代理、接口转发、Cookie 代理等功能的 Chrome 浏览器插件

### 功能

- 支持静态资源代理
- 支持 Cookie 代理
- 支持资源分组
- 支持 JSON 导入导出

### 如何安装

打开chrome应用市场，搜索并安装，或者也可以直接下载目录下的packet-proxy.crx文件，并拖拽进扩展程序中

![packet-proxy](https://images.tuyacn.com/rms-static/93e1a5e0-757e-11eb-9c5c-c32dfb6ed311-1614047207230.png?tyName=image-20210223102350838.png)

### 如何使用

#### 资源代理

1. 新建组，并启用
2. 添加代理路径（源地址 + 代理地址）；可以支持正则
3. 勾选复选框启用
4. 刷新相关的页面

![资源代理](https://images.tuyacn.com/rms-static/150e90b0-5266-11eb-bc15-27e102d5b696-1610188395835.png?tyName=1.png)

#### Cookie 代理

1. 添加代理路径（源地址 + 代理地址）；其中源地址必须是一个合法且带协议的 https?地址
2. 勾选复选框启用
3. 打开或刷新源网址，会自动读取到源地址的 cookie
4. 打开代理的网址，会自动把源地址的 cookie 塞到代理网址下

![Cookie代理](https://images.tuyacn.com/rms-static/1511c500-5266-11eb-93ad-cdb53fd2d912-1610188395856.png?tyName=2.png)

#### header添加

![header添加](https://images.tuyacn.com/rms-static/4b594f60-7580-11eb-9a62-5b4f20ec0966-1614047944534.png?tyName=header.png)
