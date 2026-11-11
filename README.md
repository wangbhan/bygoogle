# 迈谷科技官网

根据设计稿实现的响应式企业官网。Node.js 提供页面与静态资源，并将表单请求转发给 FastAPI。FastAPI 通过 psycopg 将咨询需求保存至 PostgreSQL。

## Docker 部署

在装有 Docker 和 Compose 的主机上，将项目目录复制到部署位置。首次部署时在项目根目录创建配置。

```bash
test -e .env || cp .env.example .env
```

编辑 `.env`，分别为 `POSTGRES_PASSWORD` 和 `MAIGU_DB_PASSWORD` 填写密码。可运行两次 `openssl rand -hex 24` 生成不同密码。默认通过主机的 `3000` 端口提供网站。若需变更端口，设置 `HTTP_PORT`。同机反向代理可将 `HTTP_BIND_ADDRESS` 设置为 `127.0.0.1`。

```bash
docker compose up -d --build --wait
docker compose ps
curl -fsS http://127.0.0.1:3000/api/health
```

在部署主机打开 [官网](http://127.0.0.1:3000)，或从其他设备使用部署主机的地址和配置的端口访问。若修改了 `HTTP_PORT`，请同时替换访问和健康检查命令中的端口。

| 服务 | 容器地址 | 职责 |
| --- | --- | --- |
| `frontend` | `frontend:3000` | 提供网页和静态资源，通过内部网络将表单请求转给 FastAPI |
| `backend` | `backend:8000` | 校验并写入咨询需求，启动时创建 `inquiries` 表 |
| `database` | `database:5432` | PostgreSQL 17，使用命名卷 `postgres_data` 持久化 |

只有 `frontend` 发布主机端口。PostgreSQL 首次初始化数据卷时创建 `maigu` 数据库及非超级用户 `maigu_app`。已有数据卷的数据库密码保存在 PostgreSQL 中，轮换时需先修改数据库角色密码，再同步 `.env` 并重建相应服务。

### 更新与停止

```bash
docker compose logs -f backend database
docker compose up -d --build --wait
docker compose down
```

以上命令分别用于查看日志、更新和停机。`docker compose down` 会保留数据库卷，带 `--volumes` 会删除卷和其中的数据。

### 导入现有 PostgreSQL 数据

如果已有网站数据库，在首次启动前端与后端之前执行以下步骤。源端使用 PostgreSQL 客户端导出，将 `SOURCE_DATABASE_URL` 设为旧库连接串。

```bash
pg_dump --no-owner --no-privileges "$SOURCE_DATABASE_URL" > maigu.sql
docker compose up -d --wait database
docker compose exec -T database sh -c \
  'PGPASSWORD="$MAIGU_DB_PASSWORD" exec psql -h 127.0.0.1 -U maigu_app -d maigu -X -v ON_ERROR_STOP=1 --single-transaction' \
  < maigu.sql
docker compose up -d --build --wait
```

## 本地开发

需要 Node.js 20+、Python 3.10+ 和运行中的 PostgreSQL。在项目根目录创建 Python 虚拟环境并安装依赖。

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
```

如果 PostgreSQL 运行在本机，且当前系统用户可连接并创建数据库，可用以下命令创建数据库并启动后端。

```bash
createdb maigu
DATABASE_URL=postgresql:///maigu .venv/bin/python -m uvicorn backend.main:app --port 8000
```

已有 PostgreSQL 实例时，直接将 `DATABASE_URL` 设置为该实例的连接串，例如 `postgresql://用户名:密码@主机:5432/数据库名`。数据库需预先创建，FastAPI 首次启动时会在默认 schema 中创建 `inquiries` 表。

在第二个终端启动前端。

```bash
npm start
```

打开 [官网](http://127.0.0.1:3000)。后端接口文档位于 [FastAPI 文档](http://127.0.0.1:8000/docs)。

## 模块与数据

- `frontend/src/page.mjs` 包含导航、首屏、核心业务、三项服务详情、关于我们、案例、联系表单和页脚。
- `frontend/src/content.mjs` 集中维护服务、能力卡片和案例内容。
- `frontend/public` 包含样式、页面交互和本地图片。首屏和 AI中转配图按官网视觉风格生成，其余配图从设计稿提取。
- `POST /api/inquiries` 接收 `name`、`company`、`contact` 和 `message`，创建记录后返回 HTTP 201 与记录 ID。
- PostgreSQL 的 `inquiries` 表存放咨询记录，数据库负责生成记录 ID 和提交时间。
- 前端支持 `HOST`、`PORT` 和 `API_ORIGIN`。开发时可用 `npm run dev` 监听服务端代码改动。

联系信息沿用设计稿，案例详情依据设计稿文案补充。页脚备案号应在取得正式信息后填写。短剧插图入口打开案例详情，播放功能需要视频文件。
