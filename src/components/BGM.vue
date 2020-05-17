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
        >
          <div class="left">{{ BGMs[source].English }}</div>
          <div v-show="windowWidth > mobileWidth" class="right">{{ BGMs[source].Japanese }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "BGM",
  data() {
    return {
      windowWidth: 0
    };
  },
  computed: {
    ...mapGetters(["BGMs", "bgmCategories", "bgmCategoryOrder", "selectedBgm"]),
    mobileWidth() {
      return window.__mobileMode.width;
    }
  },
  async mounted() {
    this.recalculateWidth();
    window.addEventListener("resize", this.recalculateWidth);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.recalculateWidth);
  },
  methods: {
    // To get the correct ratio
    calculateWidthFromHeight(height) {
      return (
        (height * __roomBackground.naturalWidth) /
        (__roomBackground.naturalHeight * 1.0)
      );
    },
    recalculateWidth() {
      this.windowWidth = Math.min(
        window.innerWidth,
        this.calculateWidthFromHeight(window.innerHeight)
      );
    },
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
      display: flex;
      align-items: center;

      &:hover {
        background-color: rgba(200, 200, 0, 0.8);
      }

      &.selected {
        background-color: rgba(0, 0, 255, 0.8);
      }

      .left {
        flex: 1;
        margin-right: 5px;
      }

      .right {
        flex: 1;
        margin-left: 5px;
      }
    }
  }
}
</style>