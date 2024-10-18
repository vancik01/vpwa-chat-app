<template>
    <q-menu class="channel-menu" touch-position context-menu>
      <div class="channel-menu-content">

          <div class="item-wrapper" @click="handleOption('leave')" v-close-popup id="leave-item">
            <q-icon name="logout"/>
            <span>Leave channel</span>
          </div>
          
          <div v-if="isAdmin" class="item-wrapper" @click="handleOption('delete')" v-close-popup id="delete-item">
            <q-icon name="delete_outline"/>
            <span>Delete channel</span>
          </div>
        </div>
    </q-menu>
  </template>
  
  <script>
  export default {
    name: 'ChannelControls',
    props: {
      isAdmin: Boolean
    },
    methods: {
      handleOption(option) {
        this.$emit('optionSelected', option); 
      }
    }
  };
  </script>
  
<style>
.channel-menu {
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.10) !important;
  border-radius: 6px;
  border: 1px solid #EAEAEA;
  background: #F7F7F7;
  width: 175px;
}

.channel-menu .q-icon {
  padding-right: 3px;
}

.channel-menu-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 2px;
}

.item-wrapper {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  width:95%;
  margin: 3px;
}

.channel-menu .item-wrapper:hover, .channel-menu .item-wrapper.active {
    background-color: #EDEDED;
}

#leave-item {
    color: #CC963A;
}

#delete-item {
    color: #CC3A3A;
}
</style>