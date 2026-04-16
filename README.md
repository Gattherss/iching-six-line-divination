# 问时六爻 — 纳甲六爻排盘

> 基于 SHA-256 事时合参种子的六爻排盘系统，支持大衍筮法与纳甲解析。

## 在线使用

- **Web 版**：[部署后在此显示 URL]
- **本地版**：直接双击 `wenshi-liuyao.html` 在浏览器中打开

## 功能特性

### 起卦排盘
- **SHA-256 事时合参**：以用户输入 + 当前时辰（地支）联合种子，经 SHA-256 哈希 + Xorshift128 生成卦象
- **大衍筮法模拟**：支持手动揲蓍起卦
- **变卦自动识别**：老阴/老阳自动标记，生成变卦

### 纳甲六爻
- **完整纳甲系统**：天干地支、六亲、世应、六神自动装配
- **五行生克**：旺衰判断、六亲关系自动推导
- **用神选取**：按占卜类型自动推荐用神
- **六十四宫**：八纯卦、宫位、飞伏自动计算

### 数据管理
- **云端同步**（Supabase）：跨设备自动同步历史记录
- **Magic Link 登录**：邮箱免密认证
- **离线可用**：localStorage 缓存，联网后自动同步
- **同步码**：手动编码传输（备用方案）
- **历史管理**：搜索/筛选/单条删除/导出导入
- **复盘功能**：从历史记录中重新排盘分析

### 界面
- **深色主题**：沉浸式暗色 UI，金色点缀
- **响应式布局**：适配桌面与移动端
- **复制/截图**：一键复制盘面文字或截图保存

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | 纯 HTML + CSS + JavaScript（零框架、零构建工具） |
| 加密 | Web Crypto API (SHA-256) |
| PRNG | Xorshift128 |
| 存储 | localStorage（本地缓存） |
| 云端 | Supabase（PostgreSQL + Auth + RLS） |
| 部署 | Vercel（静态站点） |

## 项目结构

```
.
├── wenshi-liuyao.html      # 主应用文件（单文件全功能）
├── config-supabase.js       # Supabase 配置（需自行填写 URL 和 key）
├── PROGRESS_TRACKER.md      # 项目进度追踪
├── wenshi-liuyao-progress.md
└── tools/                   # 辅助工具
```

## Supabase 配置（云端同步）

### 1. 创建 Supabase 项目

访问 https://supabase.com/dashboard 创建新项目，获取 **Project URL** 和 **anon public key**。

### 2. 执行数据库迁移

在 Supabase SQL Editor 中执行：

```sql
create extension if not exists "uuid-ossp";

create table hexagram_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp timestamptz not null,
  shichen text not null,
  date_str text not null,
  input text,
  ben_name text not null,
  chg_name text not null,
  div_code text not null,
  chg_code text not null,
  chgsum int not null,
  results jsonb not null,
  names jsonb not null,
  lines jsonb not null,
  source text not null default 'auto',
  source_label text not null default '当下起卦',
  created_at timestamptz not null default now()
);

create unique index idx_hexagram_unique on hexagram_history(user_id, timestamp);
create index idx_hexagram_user_ts on hexagram_history(user_id, timestamp desc);

alter table hexagram_history enable row level security;

create policy "view_own" on hexagram_history for select using (auth.uid() = user_id);
create policy "insert_own" on hexagram_history for insert with check (auth.uid() = user_id);
create policy "delete_own" on hexagram_history for delete using (auth.uid() = user_id);
create policy "update_own" on hexagram_history for update using (auth.uid() = user_id);
```

### 3. 填写配置

编辑 `config-supabase.js`：

```javascript
window.WENSHI_SUPABASE_URL = 'https://你的项目ID.supabase.co';
window.WENSHI_SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

## Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署（首次会引导登录并选择项目）
vercel

# 部署到生产环境
vercel --prod
```

## 核心算法

### SHA-256 事时合参

```
seed = SHA-256(userInput + "|" + shichenKey)[:32]
```

- `userInput`：用户输入的内容
- `shichenKey`：当前时辰的地支标识（子丑寅卯...）
- 取前 32 字符作为 Xorshift128 种子

### 六爻生成

基于 Xorshift128 PRNG，每爻独立生成：
- 老阴（6）：概率 ~6.25%
- 少阳（7）：概率 ~31.25%
- 少阴（8）：概率 ~31.25%
- 老阳（9）：概率 ~6.25%

### 纳甲装配

遵循《京氏易传》体系：
1. 确定卦宫 → 八纯卦归属
2. 装配天干 → 纳甲法（乾坤特殊）
3. 装配地支 → 按阴阳顺逆
4. 推导六亲 → 以宫之五行为基准
5. 装配六神 → 以占卜日天干为序
6. 标定世应 → 按卦宫定位

## 许可证

MIT
