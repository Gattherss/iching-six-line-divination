# 问时六爻 | I Ching Six-Line Divination

> 基于 SHA-256 事时合参种子的六爻排盘系统，支持大衍筮法与纳甲解析。
>
> A hexagram casting and analysis system based on SHA-256 time-seeded PRNG, supporting both the Yarrow Stalk method and Najia (Six Lines) interpretation.

---

## 缘起 / Origin

本项目的灵感来源于chenshaoxuemei在 Gitee 上发布的 Stata 命令 `chgdiv6`（仓库：`chenshaoxuemei/chgdiv6_bkp`）。原作者使用 Stata 的 `runiform()` 随机数函数实现了一套基于钱筮法的六爻占卜工具，包含卦辞变占、数字/文字起卦等基础功能。

This project was inspired by a Stata command `chgdiv6` published on Gitee (repository: `chenshaoxuemei/chgdiv6_bkp`) by chenshaoxuemei. The original implementation used Stata's `runiform()` random number function to build a coin-method hexagram casting tool with basic features like changing-line interpretation and numeric/text-based seed generation.

### 为什么要改造 / Why This Rewrite

原作者的 `chgdiv6` 作为 Stata 命令存在三个结构性问题，我在分析后进行了系统性改造：

The original `chgdiv6` had three structural problems, which I addressed through systematic redesign:

**1. 事与时的割裂 / Severance of Matter and Time**

原版因数/文字起卦是确定性的——`chgdiv6 114514` 无论何时执行都得到同一卦。这违背了《周易》"变动不居，周流六虚"的基本精神。邵雍《梅花易数》明确要求即使以数起卦，也须加入年月日时参与动爻计算。

The original numeric/text seeding was deterministic — `chgdiv6 114514` always produced the same hexagram regardless of when it was run. This contradicts the I Ching's fundamental principle of "unceasing change" (变动不居). Shao Yong's *Meihua Yishu* explicitly requires temporal participation even in numeric casting.

**改进**：以 `SHA-256(input + "|" + 时辰标识)` 生成种子，同一时辰内同一问事得同一卦，跨时辰则因时而异。时辰粒度（两小时）是传统占卜的基本时间单元。

**Solution**: Seed generated as `SHA-256(input + "|" + shichen)`. The same question within the same shichen (two-hour period) yields the same hexagram; across shichen, it changes. This shichen granularity is the fundamental time unit in traditional divination practice.

**2. 钱筮法概率偏差 / Coin-Method Probability Deviation**

原版使用三枚硬币（钱筮法），老阴与老阳概率相等（各 1/8）。但《周易·系辞》所载大衍筮法经组合数学推导，老阴仅 1/16，老阳 3/16，呈现"阳主阴从"的不对称结构。钱筮法抹去了这一数理差异。

The original used the three-coin method where old yin and old yang had equal probability (1/8 each). However, the yarrow stalk method documented in the *Xici* yields 1/16 for old yin and 3/16 for old yang — an asymmetric structure reflecting yang dominance. The coin method erases this mathematical difference.

**改进**：默认采用大衍筮法概率分布（P(老阴)=1/16, P(少阳)=7/16, P(少阴)=5/16, P(老阳)=3/16），还原《系辞》的数理结构。

**Solution**: Default probability distribution matches the yarrow stalk method (P(old yin)=1/16, P(shao yang)=7/16, P(shao yin)=5/16, P(old yang)=3/16), restoring the mathematical structure of the *Xici*.

**3. 文字哈希质量 / Text Hash Quality**

原版对中文字符的处理是提取字节中的数字字符逐字累加，碰撞率高。

The original text hashing extracted numeric characters from byte representations and summed them, with high collision rates.

**改进**：改用 SHA-256 哈希，碰撞概率降至 2^-128 量级。

**Solution**: Replaced with SHA-256 hashing, reducing collision probability to the 2^-128 range.

### 平台迁移 / Platform Migration

原作者的实现在 Stata 环境中运行，依赖 `runiform()` 和 Stata 的数据文件（`.dta`）存储卦辞。我将整个系统迁移为**纯前端单文件 HTML 应用**：

The original implementation ran in Stata, depending on `runiform()` and `.dta` files for hexagram text storage. I migrated the entire system into a **pure frontend single-file HTML application**:

- 脱离 Stata 依赖，浏览器双击即用
- 518 条卦辞/爻辞从 `.dta` 导出为 JSON 内嵌
- 从 Stata 的 `set seed` + `runiform()` 替换为 Web Crypto API (SHA-256) + Xorshift128 PRNG
- 无构建工具、无框架、零依赖

- No Stata dependency — double-click to open in any browser
- All 518 hexagram/line texts extracted from `.dta` and embedded as JSON
- Replaced Stata's `set seed` + `runiform()` with Web Crypto API (SHA-256) + Xorshift128 PRNG
- Zero build tools, zero frameworks, zero dependencies

---

## 在线使用 / Online Access

- **在线版**：https://wenshi-liuyao.vercel.app
- **本地版**：直接双击 `wenshi-liuyao.html` 在浏览器中打开
- **Online**：https://wenshi-liuyao.vercel.app
- **Local**：Double-click `wenshi-liuyao.html` to open in any browser

声明：仅供自我探索、学习使用。纳甲UI还是过于粗糙了，六亲关系刑冲克害也不够直观。不过本软件主要是用来起卦。对于解卦，可以点击“复制卦象文字”然后发送给秘塔AI（研究模式）或deepseek。如通晓解卦义理之高手，可以用“掌心六幺”这个软件来复盘。我自己在用，看卦象六亲非常方便也非常好用。
---

## 功能特性 / Features

### 起卦排盘 / Hexagram Casting
- **SHA-256 事时合参**：用户输入 + 当前时辰联合种子，SHA-256 哈希 + Xorshift128 生成卦象
- **大衍筮法概率**：还原《系辞》所载概率分布（P(老阴)=1/16, P(少阳)=7/16, P(少阴)=5/16, P(老阳)=3/16）
- **变卦识别**：老阴/老阳自动标记，生成变卦
- **SHA-256 Time-Seeded**: User input combined with current shichen (时辰) as seed, hashed via SHA-256 and passed through Xorshift128
- **Yarrow Stalk Probabilities**: Matches the *Xici* distribution (P(old yin)=1/16, P(shao yang)=7/16, P(shao yin)=5/16, P(old yang)=3/16)
- **Changing Lines**: Old Yin/Old Yang auto-marked with transformed hexagram

### 纳甲六爻 / Najia Six Lines
- **完整纳甲系统**：天干地支、六亲、世应、六神自动装配
- **五行生克**：旺衰判断、十二长生、六亲关系推导
- **用神选取**：按占卜类型推荐用神，点击交互选定后自动标注元神/忌神/仇神/闲神
- **六十四宫**：八纯卦、宫位、飞伏计算
- **神煞标记**：月建/月破/月合/月刑/月害/暗合、日辰/日冲/日合/日刑/日害/日破/旬空
- **Full Najia System**: Heavenly Stems, Earthly Branches, Six Relations, Shi/Ying, Six Spirits
- **Five Elements**: Strength/weakness analysis, twelve growth stages, relational derivation
- **Useful Spirit**: Interactive selection with auto-highlighting of yuan/ji/chou/xian spirits
- **Sixty-Four Palaces**: Pure hexagrams, palace classification, flying/hidden spirits
- **Spirit/Sha Markers**: Monthly and daily relational markers for each line

### 数据管理 / Data Management
- **云端同步**（Supabase）：跨设备自动同步，localStorage 离线缓存
- **Magic Link 登录**：邮箱免密认证
- **同步码**：手动编码传输（备用方案）
- **历史管理**：搜索/筛选/单条删除/导出导入
- **复盘功能**：从历史记录重新排盘分析
- **Cloud Sync** (Supabase): Cross-device sync with localStorage offline cache
- **Magic Link Auth**: Email-based passwordless login
- **Sync Code**: Manual encoded transfer (fallback)
- **History**: Search, filter, single-delete, export/import
- **Replay**: Re-analyze from historical records

### 界面 / Interface
- **深色主题**：沉浸式暗色 UI，金色点缀
- **响应式布局**：适配桌面与移动端
- **工具页签**：工具 / 历史 / 复盘三页签工作区
- **文字导出 / 截图**：一键复制盘面文字稿或导出 PNG
- **本地设置**：纳甲默认展开、紧凑排盘、字体大小等持久化配置
- **Dark Theme**: Immersive dark UI with gold accents
- **Responsive**: Desktop and mobile
- **Tabbed Workspace**: Tools / History / Replay
- **Text Export / Screenshot**: One-click text copy or PNG export
- **Local Settings**: Persistent display preferences

---

## 技术栈 / Tech Stack

| 层 / Layer | 技术 / Technology |
|---|------|
| 前端 / Frontend | Pure HTML + CSS + JavaScript (zero frameworks, zero build tools) |
| 加密 / Crypto | Web Crypto API (SHA-256) |
| PRNG | Xorshift128 (seedable) |
| 存储 / Storage | localStorage (local cache) |
| 云端 / Cloud | Supabase (PostgreSQL + Auth + RLS) |
| 部署 / Deploy | Vercel (static site) |

---

## 核心算法详解 / Core Algorithms

### 一、SHA-256 事时合参种子

```
seed = SHA-256(userInput + "|" + shichenKey)[:32]
```

- `userInput`：用户输入（数字、文字或空）
- `shichenKey`：当前十二时辰标识（子丑寅卯辰巳午未申酉戌亥）
- SHA-256 前 32 字符作为 Xorshift128 种子

**为什么用时辰而非秒？**

传统易学的时间单位是"时辰"（两小时），而非秒或毫秒。邵雍《梅花易数》中"以数加时起卦"的"时"即指时辰。时辰粒度意味着：同一个问题在同一个时辰内结果相同，换了时辰才会变化。这既保留了"因时而变"的易学原则，又避免了毫秒级随机带来的"同一问事刷两次得不同卦"的不可验证性。

**Why shichen instead of seconds?**

The traditional time unit in I Ching practice is the shichen (two-hour period), not seconds. Shao Yong's *Meihua Yishu* uses shichen as the basic time unit for numeric casting. This preserves the principle of "change with time" while avoiding the unverifiability of millisecond-level randomness.

### 二、六爻生成 — 大衍筮法概率

每爻通过 Xorshift128 生成的均匀随机数映射到大衍筮法分布：

Each line maps a Xorshift128 uniform random integer to the yarrow stalk distribution:

| 爻 / Line | 名称 / Name | 本卦 / Original | 变卦 / Changed | 概率 / Probability |
|---|---|---|---|---|
| 6 | 老阴 Old Yin | ⚋ | ⚊ | 1/16 = 6.25% |
| 7 | 少阳 Shao Yang | ⚊ | ⚊ | 7/16 = 43.75% |
| 8 | 少阴 Shao Yin | ⚋ | ⚋ | 5/16 = 31.25% |
| 9 | 老阳 Old Yang | ⚊ | ⚋ | 3/16 = 18.75% |

实现方式：对 `[0, 16)` 的均匀随机整数做区间映射：

```javascript
const r = rng.nextInt(16);
if (r < 1)      return (0, 1);  // 老阴
if (r < 8)      return (1, 1);  // 少阳
if (r < 13)     return (0, 0);  // 少阴
                return (1, 0);  // 老阳
```

**数理来源**：大衍筮法三变求一爻，每变余数 {4, 8} 的概率比在变化，经组合数学推导（参见高亨《周易古经今注》附录四），最终得到上述分布。阳爻总概率 62.5%，阴爻总概率 37.5%，体现"天一地二"的原始数理结构。

**Mathematical Source**: The yarrow stalk method's three transformations per line yield the above distribution through combinatorial analysis (see Gao Heng's *Zhouyi Gujing Jinzhu*, Appendix 4). Total yang probability is 62.5%, yin 37.5% — reflecting the "Heaven One, Earth Two" numerical structure.

### 三、变占法

严格遵循朱熹《易学启蒙》所载变占七则，按变爻数（0–6）取辞：

Follows Zhu Xi's *Yixue Qimeng* seven rules for changing lines:

| 变爻数 / Changing Lines | 取辞规则 / Rule |
|---|---|
| 0 | 本卦卦辞 |
| 1 | 本卦变爻爻辞 |
| 2 | 本卦两变爻，以上爻为主 |
| 3 | 本卦卦辞 + 变卦卦辞 |
| 4 | 变卦不变爻爻辞，以下爻为主 |
| 5 | 变卦不变爻爻辞 |
| 6 | 变卦卦辞（乾坤二卦取"用九""用六"） |

### 四、纳甲六爻系统 / Najia Six Lines System

纳甲法相传为西汉京房所创，将天干地支配入卦爻，进而推演六亲、世应、六神等判断依据。本系统完整实现了这一体系：

The Najia method, attributed to Western Han scholar Jing Fang, assigns Heavenly Stems and Earthly Branches to hexagram lines, from which Six Relations, Shi/Ying positions, Six Spirits, and other interpretive dimensions are derived.

#### 4.1 八宫归属

64 卦分属八宫（乾兑离震巽坎艮坤），每宫八卦：本宫 → 一世 → 二世 → 三世 → 四世 → 五世 → 游魂 → 归魂。

64 hexagrams are organized into eight palaces, each with eight positions: Root → 1st → 2nd → 3rd → 4th → 5th → Wandering Soul → Returning Soul.

**动态生成算法**：对本宫六爻 `[t0,t1,t2,t0,t1,t2]`，通过逐爻阴阳翻转（"翻"）生成各世卦：

Dynamic generation through sequential yin/yang line flipping:
- 一世：翻初爻（索引 5）
- 二世：翻二爻（索引 4）
- 三世：翻三爻（索引 3）
- 四世：翻四爻（索引 2）
- 五世：翻五爻（索引 1）
- 游魂：五世基础上翻四爻回原
- 归魂：游魂基础上翻三/四/五爻回原

#### 4.2 纳甲装卦

根据经卦纳甲表，为每爻配天干 + 地支：

Each line receives a Heavenly Stem + Earthly Branch from the trigram Najia table:

| 经卦 | 内卦天干 | 外卦天干 | 内卦地支（三二初） | 外卦地支（上五四） |
|---|---|---|---|---|
| 乾 | 甲 | 壬 | 子 寅 辰 | 午 申 戌 |
| 坤 | 乙 | 癸 | 未 巳 卯 | 丑 亥 酉 |
| 震 | 庚 | 庚 | 子 寅 辰 | 午 申 戌 |
| 巽 | 辛 | 辛 | 丑 亥 酉 | 未 巳 卯 |
| 坎 | 戊 | 戊 | 寅 辰 午 | 申 戌 子 |
| 离 | 己 | 己 | 卯 丑 亥 | 酉 未 巳 |
| 艮 | 丙 | 丙 | 辰 午 申 | 戌 子 寅 |
| 兑 | 丁 | 丁 | 巳 卯 丑 | 亥 酉 未 |

#### 4.3 六亲判定

以宫之五行为"我"，按五行生克关系推导：

Using the palace's element as "self," derive Six Relations through generation/overcoming:

| 关系 / Relation | 六亲 / Name |
|---|---|
| 同我 / Same | 兄弟 Brothers |
| 我生 / I generate | 子孙 Offspring |
| 生我 / Generated by | 父母 Parents |
| 我克 / I overcome | 妻财 Wealth |
| 克我 / Overcomes me | 官鬼 Officials |

#### 4.4 六神排列

以占卜日天干决定起始六神，从初爻到上爻依次排列：

The divination day's Heavenly Stem determines the starting Six Spirit, arranged from first to top line:

| 日干 / Day Stem | 初爻起始 / First Line |
|---|---|
| 甲、乙 | 青龙 |
| 丙、丁 | 朱雀 |
| 戊 | 勾陈 |
| 己 | 腾蛇 |
| 庚、辛 | 白虎 |
| 壬、癸 | 玄武 |

#### 4.5 世应与神煞

**世应**：世爻代表问卦人自身，应爻代表对方或所问之事。位置由卦在宫中的世位决定。

**Shi/Ying**: Shi represents the querent, Ying represents the other party or the matter in question. Positions determined by the hexagram's palace rank.

**神煞系统**：选定用神后，自动标注：
- **元神**（生用神者）— 绿色
- **忌神**（克用神者）— 红色
- **仇神**（被用神克者）— 橙色
- **闲神**（无关者）— 灰色

**Spirit system**: After selecting the Useful Spirit, auto-highlights:
- **Yuan Spirit** (generates useful) — green
- **Ji Spirit** (overcomes useful) — red
- **Chou Spirit** (overcome by useful) — orange
- **Xian Spirit** (unrelated) — gray

#### 4.6 月令与日辰关系

基于日干支（JDN 公式计算）和月支（节气近似），为每爻标注：

Based on day Ganzhi (JDN formula) and monthly branch (solar term approximation):

- **月建**：爻支与月支相同
- **月破**：爻支与月支六冲
- **月合/日合**：六合关系
- **月刑/日刑**：三刑关系
- **月害/日害**：六害关系
- **日冲**：日支六冲
- **旬空**：日干支所在旬的空亡

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





## 许可证 / License

MIT
