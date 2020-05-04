<template>
  <div class="room-container center-div">
    <div class="room fixed">
      <img src="backgrounds/room_background.png" class="background" />
      <img src="backgrounds/room_window.png" class="background ontop" />
      <img src="backgrounds/room_objects.png" class="background ontop" />
    </div>
  </div>
</template>


<style lang="less" scoped>
.room-container {
  height: 100%;
  width: 100%;
  overflow: hidden;

  .room {
    height: 100%;

    .background {
      height: 100%;
      min-width: 800;
      object-fit: cover;
      user-select: none;

      &.ontop {
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}
</style>

<script>
export default {
  name: "Room"
};
</script>