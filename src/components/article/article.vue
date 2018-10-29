<template>
    <Row class="content" type="flex" justify="center">
        <Col span="18" style="padding:40px;font-size:18px;box-shadow: 0px 2px 2px #888888;background:#fff;" v-html="text">
        </Col>
    </Row>
</template>

<script>
    /**
     *  引入工具类库 或 Navtive API
     *  example : import widget from 'gapi/widget'
     */
    import axios from 'axios'
    /**
     *  引入mutation-types
     *  example : import * as article from './article'
     */

    export default {
        components: {
           
        },
        data: function() {
            return {
                R:'',
                textMark:this.$store.state.text
            }
        },
        computed: {
            text(){
                let self = this;
                return self.textMark;
            }
        },
        methods: {

        },
        created () {
            let self = this;
            // self.getData();
        }
    }

    
</script>
<style src="../../../node_modules/highlight.js/styles/github.css"></style>

