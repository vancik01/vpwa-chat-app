<template>
    <div class="message-bar">
        <q-editor 
            min-height="4rem"
            :toolbar="toolbarOptions"
            placeholder="Your message or use / to use commands ..."
            v-model="editorContent" 
            @keydown="handleKeyDown"
        />
        <div class="send-icon">
            <q-btn 
                @click="postMessage"
                :disable="!isMessage"
                color="primary" 
                icon="send" 
                size="sm" 
                padding="4px 6px" 
            />
        </div>
    </div>
    
</template>

<script>
import { useChannelStore } from 'src/stores/channelStore';
const chatStore = useChannelStore()

export default {
    data() {
        return {
            toolbarOptions: [
                ['bold', 'italic', 'underline', 'link', ''], // Add more as needed or keep it minimal
            ],
            editorContent: ''            
        }
    },

    methods: {
        postMessage(){
            if(this.isMessage){
                chatStore.postMessage(this.editorContent)
                    this.editorContent = ''
            }
        },
        handleKeyDown(key){
            if(key.code == 'Enter'){
                this.postMessage()
                key.preventDefault();
            }

        }
    },
    computed:{
        isMessage(){
            return this.editorContent != '' ? true : false
        }
    },
}
</script>

<style scoped>
    .message-bar {
        padding: 16px 16px 24px 16px;
        border-top: 1px solid #DDDDDD;
    }

    .q-editor{
        background-color: #F7F7F7;
    }
    .q-editor{
        display: flex;
        flex-direction: column;
    }
    .q-editor__toolbars-container{
        order: 2;
    }
    .q-editor__content{
        order: 1;
    }
    .q-editor__toolbar{
        border: none;
    }

    .send-icon{
        position: absolute;
        right:24px;
        bottom: 32px;
        
    }
</style>