# 问时六爻 | I Ching Six-Line Divination

> 基于 SHA-256 事时合参种子的六爻排盘系统，支持大衍筮法与纳甲解析。
>
> A hexagram casting and analysis system based on SHA-256 time-seeded PRNG, supporting both the Yarrow Stalk method and Najia (Six Lines) interpretation.

---

## 在线使用 / Online Access

- **在线版**：https://wenshi-liuyao.vercel.app
- **本地版**：直接双击 `wenshi-liuyao.html` 在浏览器中打开
- **Online**：https://wenshi-liuyao.vercel.app
- **Local**：Double-click `wenshi-liuyao.html` to open in any browser

---

## 功能特性 / Features

### 起卦排盘 / Hexagram Casting
- **SHA-256 事时合参**：用户输入 + 当前时辰联合种子，SHA-256 哈希 + Xorshift128 生成卦象
- **大衍筮法**：支持手动揲蓍起卦
- **变卦识别**：老阴/老阳自动标记，生成变卦
- **SHA-256 Time-Seeded**: User input combined with the current shichen (时辰) as seed, hashed via SHA-256 and passed through Xorshift128
- **Yarrow Stalk Method**: Manual divination mode
- **Changing Lines**: Old Yin/Old Yang auto-marked with transformed hexagram

### 纳甲六爻 / Najia Six Lines
- **完整纳甲系统**：天干地支、六亲、世应、六神自动装配
- **五行生克**：旺衰判断、六亲关系推导
- **用神选取**：按占卜类型推荐用神
- **六十四宫**：八纯卦、宫位、飞伏计算
- **Full Najia System**: Heavenly Stems, Earthly Branches, Six Relations, Shi/Ying, Six Spirits
- **Five Elements**: Strength/weakness analysis, relational derivation
- **Useful Spirit**: Auto-recommended by divination type
- **Sixty-Four Palaces**: Pure hexagrams, palace classification, flying/hidden spirits

### 数据管理 / Data Management
- **云端同步**（Supabase）：跨设备自动同步
- **Magic Link 登录**：邮箱免密认证
- **离线可用**：localStorage 缓存，联网自动同步
- **同步码**：手动编码传输（备用方案）
- **历史管理**：搜索/筛选/单条删除/导出导入
- **复盘**：从历史重新排盘分析
- **Cloud Sync** (Supabase): Cross-device automatic synchronization
- **Magic Link Auth**: Email-based passwordless login
- **Offline Support**: localStorage cache with auto-sync on reconnect
- **Sync Code**: Manual encoded transfer (fallback)
- **History**: Search, filter, single-delete, export/import
- **Replay**: Re-analyze from history

### 界面 / Interface
- **深色主题**：沉浸式暗色 UI，金色点缀
- **响应式布局**：适配桌面与移动端
- **复制/截图**：一键复制盘面文字或截图
- **Dark Theme**: Immersive dark UI with gold accents
- **Responsive**: Desktop and mobile
- **Copy/Screenshot**: One-click text copy or screenshot

---

## 技术栈 / Tech Stack

| 层 / Layer | 技术 / Technology |
|---|------|
| 前端 / Frontend | Pure HTML + CSS + JavaScript (zero frameworks, zero build tools) |
| 加密 / Crypto | Web Crypto API (SHA-256) |
| PRNG | Xorshift128 |
| 存储 / Storage | localStorage (local cache) |
| 云端 / Cloud | Supabase (PostgreSQL + Auth + RLS) |
| 部署 / Deploy | Vercel (static site) |

---

## 项目结构 / Project Structure

```
.
├── wenshi-liuyao.html      # 主应用（单文件全功能）/ Main app (single file)
├── config-supabase.js       # Supabase 配置 / Supabase config
├── vercel.json              # Vercel 部署配置 / Vercel deploy config
├── README.md                # 本文档 / This document
└── tools/                   # 辅助工具 / Auxiliary tools
```

---

## Supabase 配置 / Supabase Setup

### 1. 创建项目 / Create Project

访问 https://supabase.com/dashboard 创建新项目，获取 **Project URL** 和 **anon public key**。

Create a new project at https://supabase.com/dashboard, then get your **Project URL** and **anon public key**.

### 2. 执行 SQL / Run SQL

在 Supabase SQL Editor 中执行以下 SQL：

Run the following SQL in Supabase SQL Editor:

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

### 3. 填写配置 / Fill Config

编辑 `config-supabase.js`：

Edit `config-supabase.js`:

```javascript
window.WENSHI_SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
window.WENSHI_SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

---

## 核心算法 / Core Algorithms

### SHA-256 事时合参 / SHA-256 Time-Seeded Hash

```
seed = SHA-256(userInput + "|" + shichenKey)[:32]
```

- `userInput`：用户输入 / user input content
- `shichenKey`：当前时辰地支标识 / current shichen Earthly Branch identifier (子丑寅卯...)
- 取前 32 字符作为 Xorshift128 种子 / First 32 chars used as Xorshift128 seed

### 六爻生成 / Line Generation

基于 Xorshift128 PRNG，每爻独立生成 / Each line generated independently via Xorshift128:

| 爻 / Line | 名称 / Name | 概率 / Probability |
|---|---|---|
| 6 | 老阴 Old Yin | ~6.25% |
| 7 | 少阳 Shao Yang | ~31.25% |
| 8 | 少阴 Shao Yin | ~31.25% |
| 9 | 老阳 Old Yang | ~6.25% |

### 纳甲装配 / Najia Assembly

遵循《京氏易传》体系 / Based on the Jingfang Yizhuan system:

1. 确定卦宫 → 八纯卦归属 / Determine palace (八纯卦)
2. 装配天干 → 纳甲法（乾坤特殊） / Assign Heavenly Stems via Najia (special rules for Qian/Kun)
3. 装配地支 → 按阴阳顺逆 / Assign Earthly Branches (yin/yang, forward/reverse)
4. 推导六亲 → 以宫之五行为基准 / Derive Six Relations based on palace element
5. 装配六神 → 以占卜日天干为序 / Assign Six Spirits by divination day's Heavenly Stem
6. 标定世应 → 按卦宫定位 / Mark Shi/Ying by palace position

---

## 许可证 / License

MIT
