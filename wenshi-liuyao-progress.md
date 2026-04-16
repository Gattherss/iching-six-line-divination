# 问时六爻 项目进度文档

> 供后续 Agent 接手开发使用
> 对外推荐名称：**问时六爻**（副标题：**纳甲六爻排盘**；历史内部代号：`chgdiv6`）
> 更新日期：2026-04-16
> 当前状态：**纳甲六爻系统、Supabase 云端同步、Git 仓库、Vercel 在线部署已完成**
> GitHub：https://github.com/Gattherss/iching-six-line-divination
> Vercel：https://wenshi-liuyao.vercel.app

---

## 一、项目概述

基于 Gitee 仓库 `chenshaoxuemei/chgdiv6_bkp`（兰州大学同学的 Stata 六爻占卜命令 `chgdiv6`）进行算法改进和平台迁移，最终交付物为单个 HTML 文件，可离线使用，也可在线访问。当前对外命名已确定为”问时六爻”。

## 二、已完成

### 2.1 原始算法分析 ✅

- 完整逆向了 `chgdiv6_chat.ado` 和 `chgdiv6.ado` 的算法逻辑
- 识别了三个核心问题并撰写了改进提案

### 2.2 改进提案 ✅

文件：`D:\desk\占卜workflows\wenshi-liuyao-improvement-proposal.md`（桌面 workflow 同步副本，含完整技术细节和文献依据）

三项改进：
- **改进A（已实现）**：事时交互种子 — SHA-256(input + 时辰标识)，同一时辰内同一输入得同一卦，跨时辰不同卦
- **改进B（已实现）**：大衍筮法概率修正 — P(老阴)=1/16, P(少阳)=7/16, P(少阴)=5/16, P(老阳)=3/16
- **改进C（已实现）**：SHA-256 替代原始字节累加哈希

### 2.3 未来开源骨架 ✅

已新增目录：`workplace/wenshi-liuyao-web/`

这一层不是后端工程，而是一个适合未来单独开 GitHub 仓库的静态站点骨架，目标是把“可维护源码”“在线部署版”“离线单文件版”分开：

- `site/`：未来应当直接维护的分离源码（`index.html` / `styles.css` / `app.js`）
- `scripts/`：导入旧版单文件 HTML、本地开发、静态构建、离线打包脚本
- `dist/`：GitHub Pages 用的静态构建产物
- `release/`：离线单文件发布产物

已写入的脚本：

- `npm run import:legacy`：优先从 `workplace/wenshi-liuyao.html` 导入分离源码，并兼容旧版 `workplace/chgdiv6.html`
- `npm run dev`：本地静态开发服务器（PowerShell 里直接运行 npm）
- `npm run build`：生成 `dist/` 和 `release/wenshi-liuyao-offline.html`
- `npm run build:workspace`：在构建产物之外，额外同步回当前工作区的 `workplace/wenshi-liuyao.html`
- `npm run preview`：预览 `dist/`

这一轮又补了一层构建兼容：

- `site/vendor/dom-to-image-lite.js` 已纳入源码目录
- `npm run build` 会把 vendor 截图脚本同步复制进 `dist/vendor/`
- 离线单文件版会把截图 vendor 脚本直接内联，不依赖 CDN
- `npm run import:legacy` 现在兼容“单脚本旧版 HTML”和“vendor + app 双脚本离线版 HTML”

已新增：

- `workplace/wenshi-liuyao-web/README.md`：未来单独开源时的工作流说明
- `.github/workflows/wenshi-liuyao-pages.yml`：预留的 GitHub Pages 自动部署工作流

这一方案的含义是：

- 当前不需要 Supabase
- 开发时使用 PowerShell + npm 即可
- 部署时优先考虑 GitHub Pages
- 离线单文件版继续保留，但不再要求把“单文件 HTML”当作唯一源码形态
### 2.4 核心HTML文件 ✅

文件：`D:\desk\占卜workflows\wenshi-liuyao.html`（桌面 workflow 同步副本，当前版本 ~144KB；页面可见名称已改为“问时六爻”）

**基础功能（第一批实现）：**
1. **起卦算法**：SHA-256 种子 → xorshift128 PRNG → 大衍筮法概率分布 → 6爻生成
2. **时辰系统**：显示当前时辰（十二地支），种子粒度为时辰（2小时）
3. **变占法**：朱熹《易学启蒙》变占七则，按变爻数(0-6)取卦辞/爻辞
4. **卦辞数据**：518条卦辞/爻辞从原始 `.dta` 文件导出为 JSON 内嵌
5. **UI**：深色主题，阴阳爻可视化，本卦/变卦并排显示
6. **历史记录**：localStorage 存储，支持导出JSON/导入/清空
7. **输入系统**：任意字符串输入，SHA-256 统一处理，不区分数字/文字

**纳甲六爻系统（第二批实现）：**
8. **八宫归属**：64卦 → 8宫映射，含卦位名称（本宫/一世/二世/三世/四世/五世/游魂/归魂）
9. **纳甲装卦**：每爻配天干+地支+五行，分内外卦查表
10. **六亲**：兄弟/子孙/妻财/官鬼/父母（基于宫五行 vs 爻五行）
11. **六神**：青龙/朱雀/勾陈/腾蛇/白虎/玄武（基于日干起始）
12. **世应**：世爻/应爻位置自动标记（金色世，红色应）
13. **日干支计算**：JDN公式，已用 2025-07-08=戊寅日 验证
14. **月支估算**：节气近似表，12个月段映射
15. **十二长生/旺衰**：长生→沐浴→...→养的12状态，五行各有起点
16. **变卦纳甲**：变卦也完整装卦显示（与本卦并排）
17. **用神选择交互**：点击本卦六亲标签指定用神，再次点击取消
18. **神煞自动标注**：选定用神后，元神(绿)/忌神(红)/仇神(橙)/闲神(灰)着色
19. **纳甲详解面板**：折叠面板，内含本卦/变卦两列表格
20. **动爻/旬空标记**：标记列显示老阴动/老阳动，并按日干支计算旬空
21. **月令/日辰关系标记**：标记列显示月建、月破、月合、月刑、月害、月支破、月暗合，以及日辰、日冲、日合、日刑、日害、日破、日暗合
22. **历史详情弹层**：点击任一历史记录后弹出完整信息视图，可集中查看卦象、时间、六爻和解读文本
23. **文字化复制**：历史详情支持一键复制为纯文字稿，便于贴到笔记、聊天或案例整理文档
24. **卦历复盘**：新增自定义时间、输入与六爻状态的复盘面板，可手动生成复盘结果，并将旧历史载入复盘
25. **移动端适配升级**：手机端针对输入区、历史卡片、复盘表单、详情弹层和双卦展示进行了重新排布
26. **工具页签工作区**：结果区下方已重组为“工具 / 历史 / 复盘”三页签；首次进入默认落在历史，新起卦后自动切到工具，历史载入复盘后自动切到复盘
27. **当前盘面文本导出**：工具页签可直接为当前盘面生成完整文字稿，并支持复制与下载 `.txt`；历史详情弹层与当前盘面共用同一套文字格式化函数
28. **当前盘面截图**：工具页签可对当前 `.result-card` 直接导出 PNG，静态部署版与离线单文件版都内置本地截图脚本
29. **本地设置抽屉**：新增 `wenshi-liuyao_settings_v1`，支持默认展开纳甲、紧凑排盘、标记显示模式、字体大小与历史保留上限，并可刷新后保留
30. **历史搜索 / 筛选**：历史页签顶部新增关键词、来源、时间三维筛选；支持输入、本卦、变卦、解读文本匹配，以及当下起卦 / 卦历复盘 / 今日 / 近7天 / 近30天过滤

### 2.5 关键设计决策记录

| 决策 | 结论 | 理由 |
|---|---|---|
| 种子时间粒度 | 时辰（2小时） | 输入在时辰内有因果力且可验证；跨时辰因时制宜；传统时间单位 |
| 输入语义性 | 不携带语义 | 输入是心理状态的索引性标记，不是命题性内容 |
| 大衍筮法还原方式 | 终端概率分布直接采样 | 过程性维度在软件中已不可还原，概率保真是最优折中 |
| 确定性模式 | 不保留 | 用户不追求可重现性，时辰粒度已解决"输入有意义"的需求 |
| 运行环境 | 单HTML文件+浏览器 | 无依赖、Unicode完美支持、桌面双击即用 |
| 未来开源形态 | 静态站点源码 + 离线单文件发布 | 既保留双击即用的便利，又让 Git 管理和 Pages 部署更专业 |
| 项目命名 | 问时六爻 / 纳甲六爻排盘 / `wenshi-liuyao` | 对外名称直接体现“时”与六爻并行的方法辨识度，同时保留 `chgdiv6` 作为历史追溯代号 |
| 纳甲面板交互 | 折叠面板，点击六亲选神 | 减少信息密度干扰，按需展开；六亲是纳甲体系中最核心的判断维度 |
| 工具区结构 | 三页签工作区（工具 / 历史 / 复盘） | 让排盘结果、动作工具、历史归档与卦历复盘各自有清晰入口，避免把整页堆成一条长面板 |
| 文本导出模板 | 只保留“详版” | 当前阶段优先保证文本口径统一，避免简版 / 专业版两套模板分叉 |
| 截图策略 | 只截当前盘面主卡片 | 分享场景最常见，复杂度也适中；不先做整页长图，避免离线版引入过重依赖 |
| 设置持久化 | 浏览器本地 `localStorage` | 不需要后端，和离线单文件定位一致，同时让不同用户各自在本机保留自己的显示习惯 |
| 变卦六亲判定 | 仍以本卦宫五行为“我” | 变卦自身可独立装卦，但六亲在常用纳甲实务中通常仍据本卦宫五行判定 |
| 旺衰精度 | 月支近似节气 | 每年节气差1-2天，对长生十二状态判断无实质影响 |
| 暗合口径 | 取常用宽口径 | 将常见通合与通禄合一并纳入标记，便于实际看盘时快速识别 |

---

## 三、纳甲六爻系统实现细节

### 3.1 数据表与常量定义

所有常量定义在 `<script>` 段的"纳甲六爻系统"注释块中。

#### 天干地支五行

```javascript
const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];  // 索引0-9
const DIZHI_NA = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];  // 索引0-11
const WUXING_ZHI = ['水','土','木','木','土','火','火','土','金','金','土','水'];  // 地支→五行
const WUXING_GAN = ['木','木','火','火','土','土','金','金','水','水'];  // 天干→五行
```

#### 经卦纳甲表 (`NAJIA_TRIGRAM`)

每个经卦有内外两套天干地支：

```javascript
{
  '乾': { gan: ['壬','甲'], nei: ['子','寅','辰'], wai: ['午','申','戌'] },
  '坤': { gan: ['癸','乙'], nei: ['未','巳','卯'], wai: ['丑','亥','酉'] },
  '震': { gan: ['庚','庚'], nei: ['子','寅','辰'], wai: ['午','申','戌'] },
  '巽': { gan: ['辛','辛'], nei: ['丑','亥','酉'], wai: ['未','巳','卯'] },
  '坎': { gan: ['戊','戊'], nei: ['寅','辰','午'], wai: ['申','戌','子'] },
  '离': { gan: ['己','己'], nei: ['卯','丑','亥'], wai: ['酉','未','巳'] },
  '艮': { gan: ['丙','丙'], nei: ['辰','午','申'], wai: ['戌','子','寅'] },
  '兑': { gan: ['丁','丁'], nei: ['巳','卯','丑'], wai: ['亥','酉','未'] }
}
```

- `gan[0]` = 外卦天干, `gan[1]` = 内卦天干
- `nei[0]` = 三爻地支, `nei[1]` = 二爻地支, `nei[2]` = 初爻地支
- `wai[0]` = 上爻地支, `wai[1]` = 五爻地支, `wai[2]` = 四爻地支

#### 八宫五行

```javascript
const GONG_WUXING = { '乾':'金','兑':'金','离':'火','震':'木','巽':'木','坎':'水','艮':'土','坤':'土' };
```

#### 五行生克映射

```javascript
const WX_SHENG     = { '金':'水','水':'木','木':'火','火':'土','土':'金' };
const WX_KE        = { '金':'木','木':'土','土':'水','水':'火','火':'金' };
const WX_SHENG_REV = { '水':'金','木':'水','火':'木','土':'火','金':'土' };
const WX_KE_REV    = { '木':'金','土':'木','水':'土','火':'水','金':'火' };
```

#### 六神配置

```javascript
const LIUSHEN = ['青龙','朱雀','勾陈','腾蛇','白虎','玄武'];
const LIUSHEN_START = { '甲':0, '乙':0, '丙':1, '丁':1, '戊':2, '己':3, '庚':4, '辛':4, '壬':5, '癸':5 };
```

#### 十二长生起点

```javascript
const SHIERSHENGCHANG_START = {
  '金': 5,   // 长生在巳(索引5)
  '木': 11,  // 长生在亥(索引11)
  '水': 8,   // 长生在申(索引8)
  '火': 2    // 长生在寅(索引2)，火土同
};
```

#### 月支节气范围表

```javascript
const YUEZHI_RANGES = [
  { zhi: 0,  name: '子', startM: 12, startD: 7,  endM: 1,  endD: 5 },
  { zhi: 1,  name: '丑', startM: 1,  startD: 5,  endM: 2,  endD: 4 },
  { zhi: 2,  name: '寅', startM: 2,  startD: 4,  endM: 3,  endD: 5 },
  // ... 完整12个月
];
```

### 3.2 核心算法

#### 八宫归属计算 (`buildEightPalaces`)

动态生成64卦的八宫归属。对每个基础经卦 T：

```
基础六爻 = [t0,t1,t2,t0,t1,t2]  （索引0=上爻, 5=初爻）

八宫序列：
  本宫: 原始不变            → 世idx0, 应idx3
  一世: 翻idx5(初)          → 世idx5, 应idx2
  二世: 翻idx4(二)          → 世idx4, 应idx1
  三世: 翻idx3(三)          → 世idx3, 应idx0
  四世: 翻idx2(四)          → 世idx2, 应idx5
  五世: 翻idx1(五)          → 世idx1, 应idx4
  游魂: 五世基础上将idx2翻回 → 等价于翻idx5,4,3,1 → 世idx2, 应idx5
  归魂: 游魂基础上将idx3,4,5翻回 → 等价于仅翻idx1 → 世idx3, 应idx0
```

结果存入全局 `EIGHT_PALACES` 对象，key为6位divCode，value为 `{palace, position, shi, ying}`。

#### 卦码 → 上下卦分解 (`codeToTrigrams`)

```javascript
function codeToTrigrams(divCode) {
  const outer = divCode.slice(0, 3);  // 上卦: 上/五/四
  const inner = divCode.slice(3, 6);  // 下卦: 三/二/初
  // 遍历 TRIGRAM_BITS 匹配名称
  return { wai: waiName, nei: neiName };
}
```

#### 纳甲装卦 (`installNajia`)

对每个爻位 i (0=上, 5=初)：
- i < 3: 上卦，查 `NAJIA_TRIGRAM[tris.wai]`，天干=外卦天干(`gan[0]`)，地支=`wai[i]`
- i >= 3: 下卦，查 `NAJIA_TRIGRAM[tris.nei]`，天干=内卦天干(`gan[1]`)，地支=`nei[i-3]`

返回6个元素数组：`{bit, gan, zhi, zhiWu}`。

#### 六亲判定 (`getLiuQin`)

```
宫五行 vs 爻五行:
  同我 → 兄弟
  爻生宫(WX_SHENG) → 父母
  宫生爻(WX_SHENG) → 子孙
  爻克宫(WX_KE) → 官鬼
  宫克爻(WX_KE) → 妻财
```

#### 六神排列 (`getLiuShen`)

日干决定起始索引 `LIUSHEN_START[gan]`。
从初爻(idx=5)到上爻(idx=0)依次循环：
- 上爻(i=0): `LIUSHEN[(startIdx+5)%6]`
- 五爻(i=1): `LIUSHEN[(startIdx+4)%6]`
- ...
- 初爻(i=5): `LIUSHEN[startIdx%6]`

#### 日干支 (`getDayGanZhi`)

```javascript
function getJDN(y, m, d) { /* 标准JDN公式 */ }
const gan = (jdn + 9) % 10;  // 甲=0
const zhi = (jdn + 1) % 12;  // 子=0
```

#### 月支估算 (`getMonthZhi`)

遍历 `YUEZHI_RANGES` 匹配当前月日，返回地支索引。跨月处理通过 startM/endM 判断。

#### 十二长生 (`getWangShuai`)

```
dist = (yuezhiIndex - shiErShengChangStart[wuxing] + 12) % 12
→ SHIERSHENGCHANG_NAMES[dist]
  ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养']
```

#### 神煞 (`getShenSha`)

```
用神=金 → 元神=土, 忌神=火, 仇神=木
用神=水 → 元神=金, 忌神=土, 仇神=火
用神=木 → 元神=水, 忌神=金, 仇神=土
用神=火 → 元神=木, 忌神=水, 仇神=金
用神=土 → 元神=火, 忌神=木, 仇神=水
```

### 3.3 渲染与交互

#### 纳甲面板结构

```html
<div class="najia-panel">
  <button class="najia-toggle" onclick="toggleNajia()">纳甲详解 <span class="arrow">▶</span></button>
  <div class="najia-content">
    <!-- 基本信息行 -->
    <div class="najia-info">公历/日干支/月令/八宫/卦位</div>
    <!-- 本卦+变卦并排 -->
    <div class="najia-both">
      <div><!-- 本卦表格 --></div>
      <div><!-- 变卦表格 --></div>
    </div>
    <!-- 用神提示 -->
    <div class="najia-usage">点击六亲指定用神</div>
    <!-- 神煞说明（选定后才显示） -->
    <div class="najia-info">用神/元神/忌神/仇神</div>
  </div>
</div>
```

#### 表格列顺序

六神 | 旺衰 | 爻位 | 六亲 | 天干 | 地支 | 五行 | 世应 | 标记

#### 用神交互流程

1. `najiaYongShenIdx` 全局变量跟踪当前选中的爻位（-1=未选）
2. 点击六亲标签 → `selectYongShen(idx)` → 切换选中状态
3. 重新调用 `renderResult(window.__lastDivData)` 重绘整个结果区
4. 选中行的 `liuqin-tag` 添加 `selected-yong` 类（红色背景白字）
5. 其他行根据五行匹配添加 `role-yuan`(绿)/`role-ji`(红)/`role-chou`(橙)/`role-xian`(灰)
6. 未选中时不显示神煞说明区块

#### 渲染函数入口

```javascript
function renderNajiaPanel(data)
```

在 `renderResult()` 末尾调用，传入完整的最近一次起卦数据对象；面板内部据此固定起卦时刻，不再在重绘时重新取“当前时间”。

### 3.4 代码量统计

| 模块 | 行数 |
|---|---|
| 数据表和常量定义 | ~100 |
| 八宫归属计算 | ~40 |
| 纳甲装卦 | ~20 |
| 六亲计算 | ~10 |
| 六神计算 | ~10 |
| 日干支+月支 | ~20 |
| 十二长生/旺衰 | ~15 |
| 神煞计算 | ~10 |
| 纳甲渲染+交互+标记列 | ~210 |
| 纳甲CSS样式 | ~130 |
| 开源骨架脚本与说明 | ~150 |
| **总计** | **~650行（不含导出的分离源码）** |

---

## 四、文件清单

| 文件 | 说明 |
|---|---|
| `workplace/wenshi-liuyao.html` | 当前离线主文件（单文件版） |
| `D:\desk\占卜workflows\wenshi-liuyao.html` | 桌面 workflow HTML 副本 |
| `D:\desk\占卜workflows\wenshi-liuyao-improvement-proposal.md` | 桌面 workflow 提案副本 |
| `D:\desk\占卜workflows\wenshi-liuyao-progress.md` | 桌面 workflow 进度副本（本文件） |
| `workplace/wenshi-liuyao-web/site/` | 未来开源维护用的分离源码（`index.html` / `styles.css` / `app.js`） |
| `workplace/wenshi-liuyao-web/scripts/` | 导入旧版 HTML、本地开发、静态构建、离线打包脚本 |
| `workplace/wenshi-liuyao-web/dist/` | GitHub Pages 用的静态构建产物 |
| `workplace/wenshi-liuyao-web/release/wenshi-liuyao-offline.html` | 构建生成的离线单文件发布产物 |
| `workplace/wenshi-liuyao-web/README.md` | 未来单独开源时的工作流说明 |
| `.github/workflows/wenshi-liuyao-pages.yml` | 预留的 GitHub Pages 自动部署工作流 |
| `D:\desk\占卜workflows\` | 已移出项目目录的整体 workflow 文档目录，现包含三份同步副本与各阶段流程文件 |
| `C:\Users\97302\AppData\Local\Temp\chgdev6_bkp\` | 原始仓库克隆 + 导出的 JSON |

---

## 五、技术栈

- 纯前端：HTML + CSS + JavaScript，单文件，无依赖
- PRNG：xorshift128（可播种）
- 哈希：Web Crypto API 的 SHA-256
- 存储：浏览器 localStorage
- 编码：UTF-8，所有中文直接内嵌
- 开源工作流：PowerShell + npm（仅作为脚本入口，不依赖后端）
- 部署目标：GitHub Pages 静态托管

---

## 六、注意事项

1. 原始 `.dta` 数据已成功提取为 JSON 并内嵌于 HTML，518 条记录全部验证通过
2. 日干支 JDN 公式已用 2025-07-08=戊寅日 验证正确
3. 月支使用近似日期，精度足够（误差1-2天对旺衰无实质影响）
4. 用户计划开源此项目，所有数据存储在本地，不涉及服务器
5. 用户的核心关注：算法的易学原理正确性 > 功能丰富度 > 美观度
6. 变卦自身可以独立装卦，但变卦六亲仍以本卦宫五行为“我”来判定；这是当前页面采用的纳甲口径
7. 旺衰状态使用 CSS class 着色：`ws-帝旺`/`ws-临官` 绿色系，`ws-衰`/`ws-囚` 橙色系，`ws-死` 红色系
8. `window.__lastDivData` 全局变量用于存储最近一次起卦数据，供 `selectYongShen` 重绘时复用
9. `najiaYongShenIdx` 全局变量（初始-1）跟踪用神选择状态；新起一卦时重置，避免旧卦的用神选择污染新卦
10. 标记列统一承载动爻、旬空，以及各爻与月令、日辰之间的合冲刑害破暗合关系；移动端已改为上下堆叠并允许横向滚动，避免信息过密时看起来像“没显示出来”
11. 已修复旧版单文件 HTML 中缺失的 `</style>`，此前这会让浏览器解析和后续源码拆分变得不稳定
12. 原 `workplace/workflows/` 已整体移至 `D:\desk\占卜workflows\`，桌面目录现使用新的 `wenshi-liuyao` 系列文件名
13. 历史记录键名已切换为 `wenshi-liuyao_history`，但页面会自动迁移旧的 `chgdiv6_history`，不会让既有本地记录失效
14. 历史记录详情现在以弹层展开，并提供文字稿复制和载入复盘两个后续动作；这比原来的卡片内折叠更适合长文本与手机查看

### 6.5 2026-04-13 界面收束更新

- 纳甲主视图继续改成更轻的平行卡片，默认只保留爻位、六亲地支、卦爻图形与动变关系。
- 本卦卡片现在整张可点，用神、元神、忌神、仇神通过边框色和小标签提示，不再把主视图压成信息表。
- 旺衰、六神与完整关系标记全部退到“表格明细”，默认阅读体验更接近看卦，而不是看数据库。
- 纳甲说明文案缩短，手机端卡片高度、字号和留白继续收细，减少“臃肿”和“看起来很多但不知道先看哪”的感觉。

### 6.6 2026-04-13 纳甲骨架重排

- 纳甲面板的阅读顺序已经改成“先看卦，再看摘要”，顶部原先两排较重的 meta ribbon 不再先压在主视图上。
- 主视图外框、卡片高度、中轴宽度和标签尺寸都再次压薄，默认观感比上一版更接近参考图的留白与克制感。
- 纳甲摘要改成主视图下方的轻量信息条，只保留时日、卦位、动爻、世应和用神摘要，避免视觉入口被说明性信息占满。

## 七、可能的后续改进方向

| 方向 | 说明 | 优先级 |
|---|---|---|
| 变卦宫归属 | 变卦的八宫归属独立计算（非复用本卦宫），需学术依据 | 低 |
| 动爻标记 | 已实现：在本卦/变卦表格的“标记”列显示老阴动/老阳动 | 已完成 |
| 空亡计算 | 已实现：根据日干支计算旬空，并对落空爻加“旬空”标记 | 已完成 |
| 月破/日冲 | 已实现：按地支关系为各爻标注月破、日冲，以及月建/月合/月刑/月害/月支破/月暗合、日辰/日合/日刑/日害/日破/日暗合 | 已完成 |
| 六爻排盘历史 | 将纳甲结果也存入 localStorage | 低 |
| 用神选择持久化 | 当前已在新起一卦时自动重置；若后续需要”按问题类型记忆用神”，应另做显式设计 | 低 |

## 八、2026-04-16 云端同步与部署

### 8.1 历史记录单条删除

- 每条历史记录右上角增加 × 删除按钮
- 桌面端 hover 时显示，移动端常驻可见
- 删除前确认弹窗，显示卦名和日期

### 8.2 同步码功能（手动跨设备传输）

- 历史记录页签新增”同步码”按钮
- 导出：将最近 50 条记录压缩为 base64 编码（gzip + base64）
- 导入：粘贴同步码后自动去重合并
- 使用场景：手机与电脑间手动同步

### 8.3 Supabase 云端同步层

- 集成 Supabase JS Client（CDN 加载 `@supabase/supabase-js@2`）
- 认证：Magic Link 邮箱免密登录
- 混合存储架构：
  - localStorage 为即时缓存（离线可用）
  - Supabase 为数据源（跨设备同步）
  - 启动时云端→本地合并去重
  - 保存时立即写本地 + 后台队列推云端（2s 延迟批量刷新）
  - 删除时立即删本地 + 后台队列删云端
- 离线检测：`navigator.onLine` + `online`/`offline` 事件，断网时队列持久化，恢复网络自动冲刷
- Auth UI：状态栏（header 下方）、登录弹窗、退出确认

### 8.4 Git 仓库与 Vercel 部署

- GitHub 仓库：https://github.com/Gattherss/iching-six-line-divination
- 仓库名从 `wenshi-liuyao` 改为 `iching-six-line-divination`
- Vercel 生产部署：https://wenshi-liuyao.vercel.app
- 自动连接 GitHub，push 触发自动部署
- README 改为中英双语，包含缘起、算法详解、Supabase 配置指南

### 8.5 部署架构

```
用户浏览器 (vercel.app)
  ├── wenshi-liuyao.html (单文件全功能)
  ├── config-supabase.js (Supabase URL + anon key)
  └── CDN: @supabase/supabase-js@2
        ↓ 认证 + 数据读写
  Supabase (ppnsatnjmfregnjjkzqf)
  ├── Auth (Magic Link)
  └── PostgreSQL (hexagram_history + RLS)
```

## 九、技术债务与已知限制

| 项目 | 状态 | 说明 |
|---|---|---|
| Supabase 建表 SQL | 待执行 | 需在 Dashboard SQL Editor 执行 |
| Tauri 桌面版 | 已放弃 | 因路径中文 + MSVC 链接器问题，改用网页方案 |
| Vercel 项目名 | wenshi-liuyao | 原名未变，GitHub 已改为 iching-six-line-divination |




