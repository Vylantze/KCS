<template>
  <div class="bgm">
    <div v-for="(bgmCategoryName, categoryIndex) in bgmCategoryOrder" :key="categoryIndex">
      <h3>{{ bgmCategoryName }}</h3>
      <div class="list-holder">
        <div
          v-for="(source, index) in bgmCategories[bgmCategoryName]"
          :key="index"
          class="list-item"
          :class="{ 'selected': selectedBgm && selectedBgm.Source == source }"
          @click="changeSelectedBgm(BGMs[source])"
        >{{ BGMs[source].English }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "BGM",
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["BGMs", "bgmCategories", "bgmCategoryOrder", "selectedBgm"])
  },
  async mounted() {},
  methods: {
    changeSelectedBgm(bgm) {
      this.$store.commit("setSelectedBgm", bgm);
    }
  }
};
</script>

<style lang="less" scoped>
.bgm {
  width: 100%;
  height: 100%;
  padding: 0px 20px;

  .list-holder {
    margin-left: 10px;

    .list-item {
      padding: 2px 5px;
      &:hover {
        background-color: rgba(200, 200, 0, 0.8);
      }

      &.selected {
        background-color: rgba(0, 0, 255, 0.8);
      }
    }
  }
}
</style>