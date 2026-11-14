#!/usr/bin/env python3
# github.com 被网络拦截时，用 GitHub Git Data API 提交。
# 工作方式：把工作区文件与远端树逐文件比对（git hash-object），只上传变化的文件。
# 用法：TOKEN=xxx python .dev/push.py "<commit message>"
import base64, json, os, subprocess, sys, urllib.request

REPO = "tomo614/tongdai"
API = "https://api.github.com"
TOKEN = os.environ["TOKEN"]
MSG = sys.argv[1] if len(sys.argv) > 1 else "update"


def call(method, path, body=None):
    req = urllib.request.Request(API + path,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 method=method)
    req.add_header("Authorization", "token " + TOKEN)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode())


def sh(*a):
    return subprocess.run(a, capture_output=True, text=True, check=True).stdout


ref = call("GET", "/repos/%s/git/ref/heads/main" % REPO)
parent = ref["object"]["sha"]
head = call("GET", "/repos/%s/git/commits/%s" % (REPO, parent))
base_tree = head["tree"]["sha"]
print("远端提交", parent[:7])

remote = {}
tree = call("GET", "/repos/%s/git/trees/%s?recursive=1" % (REPO, base_tree))
for e in tree["tree"]:
    if e["type"] == "blob":
        remote[e["path"]] = e["sha"]

local = [p for p in sh("git", "ls-files").splitlines() if p.strip()]
entries, changed = [], []
for path in local:
    if not os.path.exists(path):
        continue
    # --no-filters：按磁盘原始字节取 hash，才能和远端 blob 真实比对（否则 CRLF 归一化会让每个文件都判为“已变更”）
    sha = sh("git", "hash-object", "--no-filters", path).strip()
    if remote.get(path) == sha:
        continue
    blob = call("POST", "/repos/%s/git/blobs" % REPO,
                {"content": base64.b64encode(open(path, "rb").read()).decode(), "encoding": "base64"})
    entries.append({"path": path, "mode": "100644", "type": "blob", "sha": blob["sha"]})
    changed.append(path)

for p in remote:
    if p not in set(local):
        entries.append({"path": p, "mode": "100644", "type": "blob", "sha": None})

print("变更 %d 个文件" % len(changed))
if not entries:
    print("无需提交")
    sys.exit(0)

tree = call("POST", "/repos/%s/git/trees" % REPO, {"base_tree": base_tree, "tree": entries})
commit = call("POST", "/repos/%s/git/commits" % REPO,
              {"message": MSG, "tree": tree["sha"], "parents": [parent]})
call("PATCH", "/repos/%s/git/refs/heads/main" % REPO, {"sha": commit["sha"]})
print("done", commit["sha"])
