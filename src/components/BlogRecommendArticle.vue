<template>
  <div
    class="recommend"
    :class="{ card: sidebarStyle === 'card' }"
    v-if="_recommend !== false && (recommendList.length || emptyText)"
    data-pagefind-ignore="all"
  >
    <!-- 头部 -->
    <div class="card-header">
      <span class="title" v-if="title">{{ title }}</span>
      <el-button v-if="showChangeBtn" size="small" type="primary" text @click="changePage">
        {{ nextText }}
      </el-button>
    </div>
    <!-- 文章列表 -->
    <ol class="recommend-container" v-if="currentWikiData.length">
      <li
        v-for="(v, idx) in currentWikiData"
        :key="v.route"
        :class="{ 'summary-item': isSummaryItem(v) }"
        class="recommend-list-item"
      >
        <!-- 序号 - 汇总项不显示序号 -->
        <i v-if="!isSummaryItem(v)" class="num">{{ getArticleNumber(idx) }}</i>
        <!-- 简介 -->
        <div class="des">
          <!-- title -->
          <el-link
            type="info"
            class="title"
            :class="{
              current: isCurrentDoc(v.route),
              'summary-title': isSummaryItem(v)
            }"
            :href="v.route"
          >
            {{ v.meta.title }}
          </el-link>
          <!-- 描述信息 -->
          <div class="suffix">
            <!-- 日期 -->
            <!-- <span class="tag">{{ formatShowDate(v.meta.date) }}</span> -->
          </div>
        </div>
      </li>
    </ol>
    <div class="empty-text" v-else>{{ emptyText }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRoute, withBase } from "vitepress";
import { ElButton, ElLink } from "element-plus";
// import { formatShowDate } from '../utils/client'
import { useArticles, useBlogConfig } from "../composables/config/blog";

const { recommend: _recommend } = useBlogConfig();

const sidebarStyle = computed(() =>
  _recommend && _recommend?.style ? _recommend.style : "sidebar",
);

const recommendPadding = computed(() => (sidebarStyle.value === "card" ? "10px" : "0px"));
const recommend = computed(() => (_recommend === false ? undefined : _recommend));
const title = computed(() => recommend.value?.title ?? "");
const pageSize = computed(() => recommend.value?.pageSize || 9);
const nextText = computed(() => recommend.value?.nextText || "换一组");
const emptyText = computed(() => recommend.value?.empty ?? "暂无相关文章");

const docs = useArticles();

const route = useRoute();
type RecommendItem = (typeof docs.value)[0] & { route: string };
const recommendList = computed(() => {
  // 中文支持
  const paths = decodeURIComponent(route.path).split("/");

  const origin = docs.value
    .map((v) => ({ ...v, route: withBase(v.route) }))
    // 过滤出公共路由前缀
    // 限制为同路由前缀
    .filter(
      (v) =>
        v.route.split("/").length === paths.length &&
        v.route.startsWith(paths.slice(0, paths.length - 1).join("/")),
    )
    // 过滤出带标题的
    .filter((v) => !!v.meta.title)
    // 过滤掉自己
    .filter(
      (v) =>
        (recommend.value?.showSelf ?? true) ||
        v.route !== decodeURIComponent(route.path).replace(/.html$/, ""),
    )
    // 过滤掉不需要展示的
    .filter((v) => v.meta.recommend !== false)
    .filter((v) => recommend.value?.filter?.(v) ?? true);

  const topList: RecommendItem[] = [];
  const endList: RecommendItem[] = [];
  origin.map((v) => {
    // 修复：recommend 为 0 时也应该被处理（0 是有效值）
    if (v.meta.recommend === undefined || v.meta.recommend === null) return;
    v.meta.recommend < origin.length ? topList.push(v) : endList.push(v);
  });
  topList.sort((a, b) => Number(a.meta.recommend) - Number(b.meta.recommend));
  endList.sort((a, b) => Number(a.meta.recommend) - Number(b.meta.recommend));

  const normalList = origin.filter((v) => v.meta?.recommend === undefined || v.meta?.recommend === null);
  normalList.sort((a, b) => +new Date(b.meta.date) - +new Date(a.meta.date));

  return topList.concat(normalList, endList);
});

const isCurrentDoc = (value: string) => {
  return value === decodeURIComponent(route.path).replace(/.html$/, "");
};

// 判断是否为汇总项
const isSummaryItem = (item: RecommendItem) => {
  console.log(`item`,item)
  return item.route?.includes('/index')
};

// 计算文章序号（排除汇总项）
const getArticleNumber = (idx: number) => {
  // 统计当前索引之前有多少个汇总项
  let summaryCount = 0;
  for (let i = 0; i <= idx; i++) {
    if (isSummaryItem(currentWikiData.value[i])) {
      summaryCount++;
    }
  }
  // 序号 = 索引 + 1 - 汇总项数量
  return idx + 1 - summaryCount;
};

const currentPage = ref(1);
const changePage = () => {
  const newIdx = currentPage.value % Math.ceil(recommendList.value.length / pageSize.value);
  currentPage.value = newIdx + 1;
};

const currentWikiData = computed(() => {
  const startIdx = (currentPage.value - 1) * pageSize.value;
  const endIdx = startIdx + pageSize.value;
  return recommendList.value.slice(startIdx, endIdx);
});

const showChangeBtn = computed(() => {
  return recommendList.value.length > pageSize.value;
});
</script>

<style lang="scss" scoped>
.card-header {
  margin-bottom: 16px;
  font-size: 18px;
}
.recommend {
  flex-direction: column;
  padding: v-bind(recommendPadding);
}

.recommend-container {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0 10px 0 0px;
  width: 100%;

  li {
    display: flex;

    .num {
      display: block;
      font-size: 14px;
      color: var(--description-font-color);
      font-weight: 600;
      margin: 6px 8px 10px 0;
      width: 22px;
      height: 18px;
      line-height: 18px;
      text-align: center;
    }

    .des {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .title {
      font-size: 14px;
      color: var(--vp-c-text-1);
      word-break: break-all;
      white-space: break-spaces;
      &.current {
        color: var(--vp-c-brand-1);
      }
    }

    .suffix {
      font-size: 12px;
      color: var(--vp-c-text-2);
    }
  }

  // 汇总项特殊样式 - 简约风格
  .summary-item {
    margin-top: -30px;
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--vp-c-divider-light);

    .summary-title {
      font-weight: 400;
      font-size: 16px;
      color: var(--vp-c-text-1);
    }
  }
}
</style>
