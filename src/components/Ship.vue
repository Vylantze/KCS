<template>
  <img
    src="ship/yamato/sprites/Yamato_Summer_Full.png"
    class="ship"
    :style="{ 'height': shipHeight, 'margin-bottom': shipMarginBottom }"
  />
</template>


<style lang="less" scoped>
.ship {
  position: absolute;
  bottom: 0;
  right: 0.5;
  left: 0.5;
  z-index: 100;
  cursor: pointer;
}

.set-height {
  height: 400px;
}
</style>

<script>
export default {
  name: "Ship",
  data() {
    return {
      heightModifier: 0
    };
  },
  computed: {
    shipHeight() {
      return `${window.innerHeight * 1.3}px`;
    },
    shipMarginBottom() {
      return `-${window.innerHeight * 0.3}px`;
    }
  },
  mounted() {
    console.log("Screen", window.innerHeight);
  }
};
</script>