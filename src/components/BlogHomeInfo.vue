<script lang="ts" setup>
import BlogHomeOverview from './BlogHomeOverview.vue'
import BlogHotArticle from './BlogHotArticle.vue'
import BlogHomeTags from './BlogHomeTags.vue'
import BlogFriendLink from './BlogFriendLink.vue'
import { useActiveTag } from "../composables/config/blog";
const activeTag = useActiveTag()
</script>

<template>
  <div class="blog-info" data-pagefind-ignore="all">
    <!-- 统计数据，日后支持，点击筛选出左侧的数据 -->
    <BlogHomeOverview />

    <!-- 置顶的一些文章 -->
    <BlogHotArticle />

    <!-- 友链 -->
    <BlogFriendLink />

    <!-- 标签 -->
    <BlogHomeTags v-if="!activeTag.label"/>
  </div>
</template>

<style lang="scss" scoped>
.blog-info {
  display: flex;
  flex-direction: column;
  min-width: 240px;
  position: relative;
  box-sizing: border-box;
}

@media screen and (min-width: 767px) {
  .blog-info {
    max-width: 360px;
  }
}
</style>
