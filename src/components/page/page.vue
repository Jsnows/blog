<template>
    <Row v-if="listData" class="content" type="flex" justify="center">
        <Col justify="center" span="16">
            <template v-for="(item,index) in listData">
                <Row style="border-radius:5px;box-shadow: 0px 1px 2px rgba(150,150,150,0.3);background:#fff;">
                    <Row>
                        <Col style="padding:10px;" span="19">
                            <!-- <router-link :to="{name:'article',query:{name:item.file_name}}"> -->
                                <a @click="detail(item.file_name)" class="title">{{item.name}}</a>
                            <!-- </router-link> -->
                            <div class="desc">{{item.desc}}</div>
                            <div class="tag">
                                <template v-for="(icon,iIndex) in item.icons">
                                    <Icon style="margin:0 5px 0;" size="20" :type="icon"></Icon>
                                </template>
                            </div>
                            <span style="font-size:12px;color:#a1a1a1;">发表于 {{item.createTime}}</span>
                        </Col>
                        <Col span="4" offset="1">
                            <img style="height:100px;" :src="item.img"/>
                        </Col>
                    </Row>
                </Row>
                <br/>
                <br/>
            </template>
            <Row class="content" type="flex" justify="center">
                <Col align="middle">
                    <Page @on-change="toPage" :total="allNum"></Page>
                </Col>
            </Row>
        </Col>
        <Col span="5" offset="1">
            <Affix>
		<Row class="slidebar">
                <h3 align="middle" class="solid-title">github好玩项目推荐
                </h3>
                <ul class="githublist">
                    <li><Icon type="social-github"></Icon><a class="project-name" target="view_window" href="https://github.com/robbyrussell/oh-my-zsh">《oh-my-zsh》好玩的shell工具</a></li>
                    <li><Icon type="social-github"></Icon><a class="project-name" target="view_window" href="https://github.com/Jsnows/mgd">《MGD》开源markdown编辑器</a></li>
                    <li><Icon type="social-github"></Icon><a class="project-name" target="view_window" href="https://github.com/guangqiang-liu/OneM">《OneM》RN写的完整项目</a></li>
                    <li><Icon type="social-github"></Icon><a class="project-name" target="view_window" href="https://github.com/titman/iScreenSaver">一个可以用js写mac屏保的mac开源插件,超赞!</a></li>
                </ul>
		</Row>
            </Affix>
        </Col>
    </Row>
</template>

<script>

    export default {
        components: {
            
        },
        data: function() {
            return {
                listData:this.$store.state.data.list,
                page:1,
                allNum:this.$store.state.data.total
            }
        },
        computed: {

        },
        methods: {
            detail(name){
                let url= window.location.href + 'article?'+'name='+name;
                window.open(url);
            },
            toPage(page){
                let self = this;
                self.page = page;
                self.getData();
            },
            getData(){
                let self = this;
                axios.get(`http://10.216.98.70:8081/home?page=${self.page}`)
                    .then(data=>{
                        self.listData = data.data.list;
                        console.log(data.data);
                        self.allNum = data.data.total;
                    })
                    .catch(err=>{console.log(err)})
            }
        },
        created () {
            let self = this;
        }
    }

    
</script>

<!-- CSS 样式 -->
<!-- <style src="static/css/global.css"></style> -->
<style>
    .slidebar{
        border-radius:10px;
        box-shadow:0px 2px 1px rgba(150,150,150,0.3);
        border:1px solid #ebebeb;
        background: #fff;
    }
    .solid-title{
        border-bottom:1px solid #626262;
        margin: 0px 10px;
        color:#555;
        font-weight:400;
    }
    .githublist{
        font-size:18px;
        list-style:none;
        padding:5px 0px 20px 10px;
        border-top:1px solid #e7e7e7;
        margin: 0px 10px;
    }
    .project-name{
        color:#686868;
        font-size:14px;
        margin-left:5px;
        margin-bottom:5px;
    }
    .project-name:hover{
        color:#000;
    }
</style>
