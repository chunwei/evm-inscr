# evm-inscr

EVM inscription project.

## Getting Started

A Next.js project.

## Available Scripts

### Running the development server.

```bash
    npm run dev
```

### Building for production.

```bash
    npm run build
```

### Running the production server.

```bash
    npm run start
```
### Create a docker image.

```bash
    docker build -t evm-inscr .
```
### Running within a docker container.

```bash
    # -p map port,  -v map data volumn
    docker run -d -p 3000:3000 -v ./data:/app/data evm-inscr
```
### 针对Mac M1/M2 arm cpu，要打包docker发到linux amd64服务器，需要用`docker buildx`
```bash
    # for mainnet
    ./buildx-and-gzip.sh mainnet
    # for testnet
    ./buildx-and-gzip.sh testnet
    # 省略参数，默认是testnet
    ./buildx-and-gzip.sh
```
然后把.gz包发送到服务器，再在服务器端docker import
```bash
    docker import elex.tar.gz ebo:amd-v1.0.0
    # 检查是否导入成功
    docker images
```
然后，进入到服务目录，停止并删除同名docker容器，重新启动服务
```bash
    cd /data/nextjs_site/evm-inscr
    # 停止并删除同名docker容器
    docker stop evm-inscr
    docker rm evm-inscr
    # 启动新容器
    docker run --name evm-inscr -d -p 3000:3000 -v $(pwd)/data:/app/data evm-inscr:amd-v1.0.0 node /app/server.js
    # 检查容器是否正常运行
    docker ps
    # 查看容器日志
    docker logs -f evm-inscr
```

### Running ts-node 本地程序前先在`package.json`中设置
```json
"type":"module"
```
或者 加命令行参数 `--compiler-options`
```sh
ts-node --compiler-options {\"module\":\"CommonJS\"} src/utils/debounce.ts
```

### 一些注意事项

#### Antd form validator

##### 自定义validator一定要返回能被解决的promise，特别是debounce(validator)的情况。
validator函数中返回了一个promise,但如果这个promise内部通过setTimeout设置了一个定时器,然后在定时器执行前通过clearTimeout取消了定时器,将导致promise永远pending状态,不会被resolve或者reject。
解决办法之一：保存 promise 的 resolve 和 reject 回调,在特定条件下主动调用 reject 或 resolve 来终止 promise

##### 通过 `useWatch` 和 `validateFields` 来动态更新disable状态
注意 ⚠️ validateOnly: true 不更新UI，将导致错误信息不显示
```ts
const dnsVal = Form.useWatch('dns', form)

const [submitDisabled, setSubmitDisabled] = useState(false)

useEffect(() => {
if (!dnsVal) return
form
    .validateFields(['dns'], { validateOnly: false })
    .then(() => {
    setSubmitDisabled(false)
    })
    .catch(() => {
    setSubmitDisabled(true)
    })
}, [form, dnsVal])
```

## Learn More

### **Ant Design**

A design system for enterprise-level products. Create an efficient and enjoyable work experience.

[Go To Documentation](https://ant.design/docs/react/introduce)

### **CSS / styled-jsx**

Next.js comes with built-in support for CSS and styled-jsx. Styled-jsx is full, scoped and component-friendly CSS support for JSX (rendered on the server or the client).

[Go To Documentation](https://github.com/vercel/styled-jsx)

### **Fetch**

Next.js has a built-in polyfill for the fetch API. You don&#39;t need to worry about using it on either server or client side.

[Go To Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

### **Axios**

Promise based HTTP client for the browser and node.js.

[Go To Documentation](https://github.com/axios/axios)

### **Environment Variables**

Use environment variables in your next.js project for server side, client or both.

[Go To Documentation](https://github.com/vercel/next.js/tree/canary/examples/environment-variables)

### **Reverse Proxy**

Proxying some URLs can be useful when you have a separate API backend development server and you want to send API requests on the same domain.

[Go To Documentation](https://webpack.js.org/configuration/dev-server/#devserverproxy)

### **Bundle Analyzer**

Use webpack-bundle-analyzer in your Next.js project. Visualize size of webpack output files with an interactive zoomable treemap.

[Go To Documentation](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer)


### **React Query**

Hooks for fetching, caching and updating asynchronous data in React.

[Go To Documentation](https://react-query.tanstack.com/overview)

### **react-use**

A Collection of useful React hooks.

[Go To Documentation](https://github.com/streamich/react-use)

### **React Redux**

Redux helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test.

[Go To Documentation](https://redux.js.org/introduction/getting-started)

### **RTK Query**

RTK Query is a powerful data fetching and caching tool

[Go To Documentation](https://redux-toolkit.js.org/rtk-query/overview)

### **next-i18next**

next-i18next is a plugin for Next.js projects that allows you to get translations up and running quickly and easily, while fully supporting SSR, multiple namespaces with codesplitting, etc.

[Go To Documentation](https://github.com/isaachinman/next-i18next)

### **ESLint**

A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript. Maintain your code quality with ease.

[Go To Documentation](https://eslint.org/docs/user-guide/getting-started)

### **Prettier**

An opinionated code formatter; Supports many languages; Integrates with most editors.

[Go To Documentation](https://prettier.io/docs/en/index.html)

### **Testing Library**

The React Testing Library is a very light-weight solution for testing React components. It provides light utility functions on top of react-dom and react-dom/test-utils.

[Go To Documentation](https://testing-library.com/docs/)

### **Cypress**

Fast, easy and reliable testing for anything that runs in a browser.

[Go To Documentation](https://docs.cypress.io/guides/overview/why-cypress.html)

### **Docker**

Docker simplifies and accelerates your workflow, while giving developers the freedom to innovate with their choice of tools, application stacks, and deployment environments for each project.

[Go To Documentation](https://www.docker.com/get-started)

## License

MIT
