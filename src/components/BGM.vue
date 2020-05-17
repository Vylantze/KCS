<template>
  <div class="bgm">
    <div v-for="(bgmCategoryName, index) in bgmCategoryOrder" :key="index">{{ bgmCategoryName }}</div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "BGM",
  props: {
    selectedBgm: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["BGMs", "bgmCategories", "bgmCategoryOrder"])
  },
  async mounted() {
    this.resizeUI();
    window.addEventListener("resize", this.resizeUI);
  },
  beforeDestroy() {
    // Unregister the event listener before destroying this Vue instance
    window.removeEventListener("resize", this.resizeUI);
  },
  methods: {}
};
</script>

<style lang="less" scoped>
.bgm {
  width: 100%;
  height: 100%;
}
</style>