<template>
    <q-dialog v-model="isPopupOpen">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="popup-title text-h6">Create channel</div>
          <q-space/>
          <q-btn icon="close" flat round dense v-close-popup/>
        </q-card-section>
  
        <q-card-section>
        <span v-if="errorMessage" class="q-mt-sm text-negative" icon="error">
            {{ errorMessage }}
        </span>

          <q-input filled v-model="channelName"
            label="Channel name *" :rules="[val => !!val]"
            maxlength="30"/>

        
          <q-input filled
            v-model="usernames" type="textarea"
            label="Invite people (separate nicknames with comma “,”)"/>
            <q-toggle v-model="isPrivate" label="Is private?"/>
        </q-card-section>
  
        <q-card-actions align="right">
          <q-btn no-caps label="Create channel" color="primary" @click="createChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>
  
<script>
  import { useUserStore } from 'src/stores/userStore';
  import { Notify } from 'quasar';

  export default {
    name: 'CreateChannelPopup',
    data() {
      return {
        isPopupOpen: false,
        channelName: '',
        errorMessage: null,
        isPrivate: false,
        usernames: '',
        userStore: useUserStore(),
      };
    },
    methods: {
      createChannel() {
        const result = this.userStore.createChannel(this.channelName, this.isPrivate, this.usernames);
        if (result) {
          this.isPopupOpen = false;
          Notify.create({
            type: 'positive',
            message: `Channel "${this.channelName}" was successfully created!`,
            timeout: 3000
          });
        } else {
          this.errorMessage = 'Invalid channel name';
        }
      }
    }
  };
</script>
  
<style scoped>
  .q-card {
    width: 500px;
    max-width: 100%;
    padding: 10px;
  }

  .popup-title {
    font-weight: bold;
  }

  .q-input {
    margin: 10px 0px;
    padding: 0;
  }

</style>
  