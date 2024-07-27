"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/node/getArticles.ts
var getArticles_exports = {};
__export(getArticles_exports, {
  getArticles: () => getArticles,
  getPosts: () => getPosts,
  pageMap: () => pageMap
});
module.exports = __toCommonJS(getArticles_exports);
var import_fast_glob = require("fast-glob");
var import_gray_matter = __toESM(require("gray-matter"));
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));

// src/utils/node/index.ts
var import_child_process = require("child_process");

// src/utils/client/index.ts
function formatDate(d, fmt = "yyyy-MM-dd hh:mm:ss") {
  if (!(d instanceof Date)) {
    d = new Date(d);
  }
  const o = {
    "M+": d.getMonth() + 1,
    // 月份
    "d+": d.getDate(),
    // 日
    "h+": d.getHours(),
    // 小时
    "m+": d.getMinutes(),
    // 分
    "s+": d.getSeconds(),
    // 秒
    "q+": Math.floor((d.getMonth() + 3) / 3),
    // 季度
    S: d.getMilliseconds()
    // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      `${d.getFullYear()}`.substr(4 - RegExp.$1.length)
    );
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
      );
  }
  return fmt;
}

// src/utils/node/index.ts
function clearMatterContent(content) {
  let first___;
  let second___;
  const lines = content.split("\n").reduce((pre, line) => {
    if (!line.trim() && pre.length === 0) {
      return pre;
    }
    if (line.trim() === "---") {
      if (first___ === void 0) {
        first___ = pre.length;
      } else if (second___ === void 0) {
        second___ = pre.length;
      }
    }
    pre.push(line);
    return pre;
  }, []);
  return lines.slice(second___ || 0).join("\n");
}
function getDefaultTitle(content) {
  const title = clearMatterContent(content).split("\n")?.find((str) => {
    return str.startsWith("# ");
  })?.slice(2).replace(/^\s+|\s+$/g, "") || "";
  return title;
}
function getFileBirthTime(url) {
  let date = /* @__PURE__ */ new Date();
  try {
    const infoStr = (0, import_child_process.spawnSync)("git", ["log", "-1", '--pretty="%ci"', url]).stdout?.toString().replace(/["']/g, "").trim();
    if (infoStr) {
      date = new Date(infoStr);
    }
  } catch (error) {
    return formatDate(date);
  }
  return formatDate(date);
}
function getTextSummary(text, count = 100) {
  return clearMatterContent(text).match(/^# ([\s\S]+)/m)?.[1]?.replace(/#/g, "")?.replace(/!\[.*?\]\(.*?\)/g, "")?.replace(/\[(.*?)\]\(.*?\)/g, "$1")?.replace(/\*\*(.*?)\*\*/g, "$1")?.split("\n")?.filter((v) => !!v)?.slice(1)?.join("\n")?.replace(/>(.*)/, "")?.slice(0, count);
}

// src/utils/node/getArticles.ts
var pageMap = /* @__PURE__ */ new Map();
function getArticles(cfg) {
  const srcDir = cfg?.srcDir || process.argv.slice(2)?.[1] || ".";
  const files = import_fast_glob.glob.sync(`${srcDir}/**/*.md`, { ignore: ["node_modules"] });
  const data = files.map((v) => {
    let route = v.replace(".md", "");
    if (route.startsWith("./")) {
      route = route.replace(
        new RegExp(
          `^\\.\\/${import_path.default.join(srcDir, "/").replace(new RegExp(`\\${import_path.default.sep}`, "g"), "/")}`
        ),
        ""
      );
    } else {
      route = route.replace(
        new RegExp(
          `^${import_path.default.join(srcDir, "/").replace(new RegExp(`\\${import_path.default.sep}`, "g"), "/")}`
        ),
        ""
      );
    }
    pageMap.set(`/${route}`, v);
    const fileContent = import_fs.default.readFileSync(v, "utf-8");
    const { data: frontmatter } = (0, import_gray_matter.default)(fileContent, {
      excerpt: true
    });
    const meta = {
      ...frontmatter
    };
    if (!meta.title) {
      meta.title = getDefaultTitle(fileContent);
    }
    if (!meta.date) {
      meta.date = getFileBirthTime(v);
    } else {
      const timeZone = cfg?.timeZone ?? 8;
      meta.date = formatDate(
        /* @__PURE__ */ new Date(`${new Date(meta.date).toUTCString()}+${timeZone}`)
      );
    }
    const _tags = typeof meta.tags === "string" ? [meta.tags] : meta.tags;
    meta.tags = [.../* @__PURE__ */ new Set([..._tags || []])].flat();
    const wordCount = 200;
    meta.description = meta.description || getTextSummary(fileContent, wordCount);
    meta.cover = meta.cover ?? (fileContent.match(/[!]\[.*?\]\((https:\/\/.+)\)/)?.[1] || "");
    if (meta.publish === false) {
      meta.hiddenInHome = true;
      meta.recommend = false;
    }
    return {
      route: `/${route}`,
      meta
    };
  }).filter((v) => v.meta.layout !== "home");
  return data;
}
function getPosts(cfg) {
  const data = getArticles(cfg);
  import_fs.default.writeFileSync(
    import_path.default.join(process.cwd(), "src/data/posts.json"),
    JSON.stringify(data)
  );
  console.log(" pageMap", pageMap, data);
  return data;
}
getPosts();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getArticles,
  getPosts,
  pageMap
});
