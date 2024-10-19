<template>
    <div class="system-message">
      <div class="system-message-wraper">
      <div class="message-bot">
        <span>🤖</span>
      </div>
      <div class="system-message-content">
          <div class="system-message-meta">
            <div class="system-message-user-name">Channel Bot</div>
              <div class="system-message-time">{{new Date().toLocaleTimeString()}}</div>
          </div>
          <span class="disclaimer">System message (only you can see this message)</span>
          <div v-if="commandType === 'list'" class="user-list-message">
            <span class="users-list-title">Users in this channel</span>
            <ul>
              <li v-for="user in users" :key="user.nickname">
                <q-icon name="account_circle" size="40px" color="primary"></q-icon>
                <div>
                    <div class="text-weight-bold">@{{ user.nickname }}</div>
                    <user-status :status="user.status"/>
                </div>
              </li>
            </ul>
          </div>
      
          <div v-else-if="commandType === 'invite'" class="invite-message">
            <span>📭 You invited <strong>@{{ invitedUser }}</strong> to this channel!</span>
          </div>
      </div>   
    </div> 
  </div>
  </template>
  
  <script>
  import UserStatus from './UserStatus.vue';
  
  export default {
    name: 'SystemMessage',
    components: {
      UserStatus, 
    },
    props: {
      commandType: {
        type: String,
        required: true, 
      },
      users: {
        type: Array,
        default: () => [],
      },
      invitedUser: {
        type: String,
        default: '',
      },
    },
  };
  </script>
  
<style scoped>

.system-message {
    background-color: #FFFDF4;
    padding: 20px 20px;
}
  .system-message-wraper{
    display: flex;
    gap: 10px;
}
  .message-bot{
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 36px;
    width: 36px;
    margin-top: 6px;
    border-radius: 6px;
    background-color: #ECECEC;
}
.system-message-content {
    width: 100%;
}

.system-message-content p {
    padding-top: 2px;
    font-size: 15px;
    font-weight: 400;
    margin: 0px;
}

.system-message-user-name{
    font-size: 15px;
    font-weight: 700;
}

.system-message-time{
    color: var(--Black, #000);
    font-size: 12px;
    font-style: normal;
    font-weight: 300;
}

.system-message-meta{
    display: flex;
    gap: 24px;
    align-items: center;
}

.user-list-message, .invite-message {
  margin-top: 10px;
}

.users-list-title {
  font-size: 20px;
  font-weight: bold;
}

.disclaimer {
  font-size: 11px;
  font-weight: bold;
  color: #5A5A5A;
}

ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

li {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
}
</style>
  