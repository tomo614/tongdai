# 「同代」项目剩余分片任务书（共 3 个子任务，22 位作家）

项目根目录：`C:\Users\lenovo\WorkBuddy\2026-11-14-14-19-03\tongdai`

以下三段是发给子代理（subagent）的完整 prompt，逐字复制即可派发。三个任务相互独立，可并行。

## 公共规范（每个 prompt 里已含，此处仅作备忘）

- 子代理只准写自己负责的那一个文件；禁止 git、禁止改 index.html、禁止在项目根留临时文件。
- 每人写完必须执行 `node --check <自己负责的文件>` 和 `node .dev/validate.js`（不得新增错误）。
- 若子代理因 502/429 断线：先 `ls -l` 看文件是否已写完整（≥60KB 且 `node --check` 通过、该分片作者数达标），完整就收下；不完整才重派。

## 任务 A：给 data/w-n-3.js 追加 2 位

你是「同代」项目的数据撰写员。项目根目录：`C:\Users\lenovo\WorkBuddy\2026-11-14-14-19-03\tongdai`（所有命令先 cd 到这里）。

任务：`data/w-n-3.js` 现有 8 位拉美作家（卡彭铁尔、鲁尔福、富恩特斯、略萨、米斯特拉尔、帕斯、加莱亚诺、普伊格），请在**最后一位作家对象之后、结尾的 `]);` 之前**追加 2 位：

1. 埃内斯托·萨巴托 Ernesto Sabato（阿根廷，1911–2011，id 用 `sabato`）
2. 马里奥·贝内德蒂 Mario Benedetti（乌拉圭，1920–2009，id 用 `benedetti`）

开工前：先读 `.dev/SPEC.md`（撰写规范）；再读 `data/w-n-3.js` 全文对齐格式与引号风格（双引号）。

硬性规范（违反即返工）：
- author 字段：id（小写唯一）、name、en、alias、birth/death、country、era、field、bio（60–120 字）、works（3–5 部，中文译名+年份）、peers。
- peer 字段：`{ n, e, b, d, c, f, t, r, met, metAt, ev:[{y,e}], end, endWhy, x }`；t ∈ friend/rival/mentor/family/circle/patron/context/influence/none；r 6–18 字；met 无考写 null 且 metAt 写「具体年月失载」；ev ≥1 条、每条 e 15–40 字；end/endWhy 未终结写 null；x 60–160 字。
- 每人 peers 10–16 条，至少 2 条 t:"none" 且其中至少 1–2 位是跨文明同时代人（对日本、中国、阿拉伯、非洲作家）。
- 决裂必须 end+endWhy 且 ev 里有诱因；每人 influence ≤1；严禁编造精确假年份。
- 库内已有作家只能作 peer，`n` 必须与其 `name` 逐字一致（先 `grep -h -o 'name: *"[^"]*"' data/*.js | sort -u | grep 关键词` 反查）。库内已有：博尔赫斯、科塔萨尔、马尔克斯、聂鲁达、阿斯图里亚斯、奥内蒂（在 w-n-4）、李斯佩克托、阿马多、马沙多·德·阿西斯（在 w-n-4）、加莱亚诺、普伊格、帕斯、富恩特斯、略萨（都在库内）。

内容提示：萨巴托——物理学家转作家，《隧道》1948、《英雄与坟墓》1961；与博尔赫斯由亲近到疏远（政治立场）可考。贝内德蒂——乌拉圭「45 一代」，1973 政变后流亡，与加莱亚诺同乡同代可考；与奥内蒂关系可考。

完成后执行 `node --check data/w-n-3.js` 与 `node .dev/validate.js`（错误须为 0），回报文件行数、两位的 peers 数、validate 结果。禁止 git，禁止动其他文件。

## 任务 B：写 data/w-n-7.js（加拿大与澳新 10 位）

你是「同代」项目的数据撰写员。项目根目录：`C:\Users\lenovo\WorkBuddy\2026-11-14-14-19-03\tongdai`（所有命令先 cd 到这里）。

任务：只写一个文件 `data/w-n-7.js`（现为空壳），包含以下 10 位作家（按此顺序）：

1. 伦纳德·科恩 Leonard Cohen（加拿大，1934–2016，id `cohen`）
2. 马尔科姆·劳里 Malcolm Lowry（英国/加拿大，1909–1957，id `lowry`）
3. 休·麦克伦南 Hugh MacLennan（加拿大，1907–1990，id `maclennan`）
4. 加斯东·米龙 Gaston Miron（加拿大·魁北克，1928–1996，id `miron`）
5. 帕特里克·怀特 Patrick White（澳大利亚，1912–1990，id `pwhite`）
6. 彼得·凯里 Peter Carey（澳大利亚，1943– ，id `pcarey`）
7. 蒂姆·温顿 Tim Winton（澳大利亚，1960– ，id `winton`）
8. 凯特·格伦维尔 Kate Grenville（澳大利亚，1950– ，id `grenville`）
9. 亚历克西斯·赖特 Alexis Wright（澳大利亚，1950– ，id `awright`）
10. 珍妮特·弗雷姆 Janet Frame（新西兰，1924–2004，id `frame`）

开工前：先读 `.dev/SPEC.md`；再读一个已完成分片作格式样例（如 `data/w-n-6.js`，那里有门罗、阿特伍德、翁达杰、安妮·卡森）；`data/` 已有 770 位作家，库内已有的（如门罗、阿特伍德、翁达杰、希尔兹、卡森、劳伦斯）只能作 peer，`n` 逐字一致，反查：`grep -h -o 'name: *"[^"]*"' data/*.js | sort -u | grep 关键词`。

硬性规范与任务 A 完全相同（外壳 `window.AUTHORS = (window.AUTHORS || []).concat([ ... ]);`、双引号、无注释、每人 peers 10–16 条、≥2 条 none 且含 1–2 位跨文明同代、非 none 必须有 met+ev、决裂 end+endWhy、influence ≤1、严禁编假年份）。

内容提示：科恩——诗人出身（《让我们比较神话》1956）转民谣；与琼尼·米切尔 1967 相识、长期纠葛可考；与欧文·雷顿的公开冲突可考；与鲍勃·迪伦同代可考。劳里——《在火山下》1947；妻子玛乔丽·邦纳是 family；与康拉德·艾肯交往可考；1957 死于加拿大。麦克伦南——《两种孤独》1945；与米龙立场对立可考。米龙——1970 十月危机期间被捕有明确记载。怀特——1973 诺奖首位澳洲得主；与画家西德尼·诺兰为伴侣（family）；与阿特伍德交往可考。凯里——1988、2001 两获布克；与翁达杰、拉什迪交往可考。温顿、格伦维尔、赖特——当代澳洲，与凯里/怀特同代，交往记载少的部分用 none/context，不硬编。弗雷姆——曾被误诊住院八年；弗兰克·萨吉森提供小屋让她写作（mentor）可考。跨文明对照可选：怀特—川端、弗雷姆—大江、凯里—石黑一雄、科恩—迪伦。

完成后执行 `node --check data/w-n-7.js` 与 `node .dev/validate.js`（错误须为 0），回报文件大小、10 位的 peers/none 合计、validate 结果、放弃的存疑素材。禁止 git，禁止动其他文件。

## 任务 C：写 data/w-n-8.js（加拿大澳新第二代 10 位）

你是「同代」项目的数据撰写员。项目根目录：`C:\Users\lenovo\WorkBuddy\2026-11-14-14-19-03\tongdai`（所有命令先 cd 到这里）。

任务：只写一个文件 `data/w-n-8.js`（现为空壳），包含以下 10 位作家（按此顺序）：

1. 凯瑟琳·曼斯菲尔德 Katherine Mansfield（新西兰/英国，1888–1923，id `mansfield`；**先 grep 确认库内是否已有，若已有则只作 peer 并以候补顶替名额**，候补依次为：珍妮特·弗雷姆（若 w-n-7 未收）、莫拉·比斯顿(Morley Callaghan 莫利·卡拉汉，加拿大 1903–1990)、卡罗尔·希尔兹（若 w-n-6 未收））
2. 埃莉诺·卡顿 Eleanor Catton（新西兰，1985– ，id `catton`）
3. 玛格丽特·劳伦斯 Margaret Laurence（加拿大，1926–1987，id `mlaurence`；先 grep 查重，若库内已有玛格丽特·劳伦斯则跳过并以候补顶替）
4. 伊丽莎白·乔利 Elizabeth Jolley（英国/澳大利亚，1923–2007，id `jolley`）
5. 海伦·加纳 Helen Garner（澳大利亚，1942– ，id `garner`）
6. 莱斯·默里 Les Murray（澳大利亚，1938–2019，id `lmurray`）
7. 大卫·马洛夫 David Malouf（澳大利亚，1934– ，id `malouf`）
8. 凯里·休姆 Keri Hulme（新西兰，1947–2021，id `hulme`）
9. 帕特里夏·格雷斯 Patricia Grace（新西兰，1937– ，id `pgrace`）
10. 默里·贝尔 Murray Bail（澳大利亚，1941– ，id `bail`）

开工前：先读 `.dev/SPEC.md`；再读格式样例（`data/w-n-7.js` 若已写好，或 `data/w-f-6.js`）；库内已有作家只能作 peer，`n` 逐字一致，反查：`grep -h -o 'name: *"[^"]*"' data/*.js | sort -u | grep 关键词`。

硬性规范与任务 A/B 完全相同（每人 peers 10–16 条、≥2 条 none 且含 1–2 位跨文明同代、非 none 必须有 met+ev、决裂 end+endWhy、influence ≤1、严禁编假年份）。

内容提示：曼斯菲尔德——与约翰·米德尔顿·穆里（编辑、伴侣，family）1911 相识、1918 结婚；与 D.H. 劳伦斯 1913 相识、一度邻居后反目（劳伦斯在小说里影射她）；与伍尔夫：霍加斯出版社出《序曲》，日记里对她既嫉妒又推崇，可考。卡顿——2013 年 28 岁成最年轻布克奖得主（《发光体》），同代交往记载少就用 none/context。劳伦斯——《石天使》1964，与阿特伍德、门罗同代可考。乔利——1959 移居西澳，晚年成名。加纳、默里、马洛夫、贝尔——当代澳洲文坛，默里政治保守与左翼文坛长期龃龉可考，与怀特关系紧张（不确定就 context/none）。休姆——《骨人》1985 布克奖，与弗雷姆、格雷斯同在新西兰文坛可考。格雷斯——毛利作家，《波蒂基》1986。

完成后执行 `node --check data/w-n-8.js` 与 `node .dev/validate.js`（错误须为 0），回报文件大小、10 位的 peers/none 合计、validate 结果、查重结论（哪几位换人）、放弃的存疑素材。禁止 git，禁止动其他文件。
