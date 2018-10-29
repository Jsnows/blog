const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const express = require('express')
const compression = require('compression')
const microcache = require('route-cache')
const resolve = file => path.resolve(__dirname, file)
const config = require('./base.config.js')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(path.join(__dirname,'./data/data.json'));
const db = low(adapter);
const deMark = require('./serverApi/de-markdown.js');

const {createBundleRenderer} = require('vue-server-renderer')

const isProd = process.env.NODE_ENV !== 'development'
const useMicroCache = process.env.MICRO_CACHE !== 'false'
const serve = (path, cache) => express.static(resolve(path), {
    maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})
const app = express()
app.use(bodyParser.urlencoded({ extended: true ,limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static('public'));
app.all('*',function (req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","POST,GET");
    next();
});
app.post('/updata',function(req,res){
    if(req.body.secret !== config.secret){
        let data = {
            code:-10000,
            message:'没有权限'
        }
        res.end(JSON.stringify(data));
        return
    }
    if(!req.body.name || !req.body.desc || !req.body.file_name || !req.body.icons || !req.body.img || !req.body.content){
        let data = {
            code:-3,
            message:'有参数为空'
        }
        res.end(JSON.stringify(data));
        return
    }
    fs.exists(path.join(__dirname,`./data/${req.body.file_name}.md`), function(status){
        let data = {};
        let obj = {
            "name":req.body.name,
            "desc":req.body.desc,
            "file_name":req.body.file_name,
            "icons":req.body.icons,
            "img":req.body.img,
            "createTime":new Date().toLocaleDateString()
        }
        if(!status){
            var filename = path.join(__dirname,`./data/${req.body.file_name}.md`);
            fs.writeFile(filename, req.body.content, (err) => {
                if (err){
                    data = {
                        code:-2,
                        message:'保存失败'
                    }
                    res.end(JSON.stringify(data));
                }else{
                    db.get('articles').unshift(obj).write();
                    data = {
                        code:0,
                        message:'保存成功'
                    }
                    res.end(JSON.stringify(data));
                }
            });
        }else{
            data = {
                code:-1,
                message:'这个文件有了'
            }
            res.end(JSON.stringify(data));
        }
    })
})
app.post('/delete',function(req,res){
    if(req.body.secret !== config.secret){
        var data = {
            code:-10000,
            message:'没有权限'
        }
        res.end(JSON.stringify(data));
        return
    }
    fs.unlink(path.resolve(__dirname,`./data/${req.body.file_name}.md`),function(err){
        if(err){
            var data = {
                code:'-1',
                message:'删除失败'
            }
            res.end(JSON.stringify(data));
        }else{
            db.get('articles').remove({file_name:req.body.file_name}).write();
            var data = {
                code:'0',
                data:'删除成功'
            }
            res.end(JSON.stringify(data));
        }
    })
})
app.post('/change',function(req,res){
    if(req.body.secret == config.secret){
        var filename = path.join(__dirname,`./data/${req.body.file_name}.md`);
        fs.writeFile(filename, req.body.content, (err) => {
            if (err){
                let data = {
                    code:-2,
                    message:'修改失败'
                }
                res.end(JSON.stringify(data));
            }else{
                let data = {
                    code:0,
                    data:'修改成功'
                }
                res.end(JSON.stringify(data));
            }
        });
    }else{
        let data = {
            code:-10000,
            data:'没有权限'
        }
        res.end(JSON.stringify(data));
    }
})

app.use(compression({threshold: 0}))
app.use('/dist', serve('./dist', true))
app.use(microcache.cacheSeconds(1, req => useMicroCache && req.originalUrl))

function createRenderer(bundle, options) {
    // 返回一个渲染函数
    return createBundleRenderer(bundle, Object.assign(options, {
        // 设置缓存，用法参考下面链接
        // https://github.com/isaacs/node-lru-cache
        cache: LRU({
            max: 1000,
            maxAge: 1000 * 60 * 15
        }),
        basedir: resolve('./dist'),
        runInNewContext: false
    }))
}

let renderer
let readyPromise
// html模板路径
const templatePath = resolve('./src/app/index/index.html')

if (isProd) {
    // 生产环境直接应用打包后的manifest文件
    const template = fs.readFileSync(templatePath, 'utf-8')
    const bundle = require('./dist/vue-ssr-server-bundle.json')
    const clientManifest = require('./dist/vue-ssr-client-manifest.json')
    renderer = createRenderer(bundle, {
        template,
        clientManifest
    })
} else {
    // 开发环境
    console.log('文件打包中……')
    readyPromise = require('./build/setup-dev-server')(
        app,
        templatePath,
        (bundle, options) => {
            console.log('打包完成。');
            renderer = createRenderer(bundle, options)
        }
    )
}

function render(req, res) {
    const s = Date.now()
    // console.log(req.url)
    const handleError = err => {
        if (err.url) {
            // console.log(err.url)
            res.redirect(err.url)
        } else if (err.code === 404) {
            res.status(404).send('404 | Page Not Found')
        } else {
            res.status(500).send('500 | Internal Server Error')
            console.error(`error during render : ${req.url}`)
            console.error(err.stack)
        }
    }
    const context = {
        title: '崔琼雪',
        url: req.url
    }
    renderer.renderToString(context, (err, html) => {
        if (err) {
            return handleError(err)
        }
        // 5.返回带有数据的页面
        res.send(html)
        if (!isProd) {
            console.log(`whole request: ${Date.now() - s}ms`)
        }
    })
}

app.get('/home',function(req,res){
    var page = req.query.page;
    var data = {
        code:0,
        data:{
            list:db.get('articles').value().slice((page-1)*10,page*10),
            total:db.get('articles').value().length
        }
    }
    res.end(JSON.stringify(data));
})
app.get('/text',function(req,res){
    if(!req.query.file_name){
        var data = {
            code:-1,
            message:'无效参数'
        }
        res.end(JSON.stringify(data));
            return
        }
        fs.exists(path.join(__dirname,`./data/${req.query.file_name}.md`), function(status){
            if(!status){
                var data = {
                    code:-2,
                    message:'文章未找到'
                }
                res.end(JSON.stringify(data));
            }else{
                if(fs.readFileSync(path.join(__dirname,`./data/${req.query.file_name}.md`))){
                    var text = deMark(fs.readFileSync(path.join(__dirname,`./data/${req.query.file_name}.md`)).toString());
                    var data = {
                        code:0,
                        data:text
                    }
                    res.end(JSON.stringify(data));
                }
            }
        })
    })
app.get('/public/wenjuan',function(req,res){
    var str = fs.readFileSync(path.join(__dirname,'./public/wenjuan.html'));
    res.end(str)
})

app.get('/chensihan',function(req,res){
    let chen = new FileSync(path.join(__dirname,'./data/chensihan.json'));
    let chendb = low(chen);
    var data = 'ok';
    console.log(req.query)
    if(req.query.type == 'read'){
        data = {
            pagenum:chendb.get('data').value().length,
            data: chendb.get('data').value()
        }
    }else if(req.query.type == 'write'){
        req.query.data = JSON.parse(req.query.data);
        chendb.get('data').push(req.query.data).write();
        data = {
            pagenum:chendb.get('data').value().length
        }
    }
    res.end(JSON.stringify(data));
})
app.get('*', isProd ? render : (req, res) => {
    // 0.这里是第一步接收请求将req,res传递给render
    readyPromise.then(() => render(req, res))
})


const port = isProd? 80 : 8081;
app.listen(port, () => {
    console.log(`server started at localhost:${port}`)
})
