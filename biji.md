bulid  
    index.js  webpack配置文件 [很少修改这个文件]

mock 
    mock数据的文件夹[模拟一些假数据]
node_modules
    项目依赖的模块
public
    ico图标，静态页面，public文件夹里面经常放一些静态资源，而且在项目打包的时候webpack不会编译这个文件夹，会原封不动的打包到dist文件夹里面

src
    程序员代码模块
    api文件夹:接口相关的
    assets文件夹:里面放置一些静态资源（一般是共享的），在webpack打包的时候会进行编译

    components文件夹：一般放置非路由组件获取全局组件
    icons这个文件夹中放了一些svg矢量图
    layout文件夹：里面放置了一些组件与混入
    router文件夹：放置路由相关
    store文件夹：vuex相关的
    style文件夹：放置一些样式相关的
    utils文件夹：requiest.js是axios二次封装文件
    view文件夹：放置路由组件

    App.vue根组件
    main.js入口文件
    permission.js:与导航守卫相关
    settings:项目配置项文件
    tests：作者写的测试文件

  
    后台管理系统API接口在线文档：
        http://39.98.123.211:8170/swagger-ui.html
        http://39.98.123.211:8216/swagger-ui.html
        

    el-form经常结合el-form-item使用
    el-table经常结合el-table-column

    elementUi中自定义验证规则作为一个重点去看  TradeMark就使用了，后面验证的还有好几个组件

    <el-form :inline="true" class="demo-form-inline" :model="cForm">
      <el-form-item label="一级分类">
        <el-select
          placeholder="请选择"
          v-model="cForm.category1Id"
          @change="handler1"
        >
          <el-option
            :label="c1.name"
            :value="c1.id"
            v-for="(c1, index) in list1"
            :key="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select
          placeholder="请选择"
          v-model="cForm.category2Id"
          @change="handler2"
        >
          <el-option
            :label="c2.name"
            :value="c2.id"
            v-for="(c2, index) in list2"
            :key="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select
          placeholder="请选择"
          v-model="cForm.category3Id"
          @change="handler3"
        >
          <el-option
            :label="c3.name"
            :value="c3.id"
            v-for="(c3, index) in list3"
            :key="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>


        这种代码之前理解错了，它是绑定了data中的数据，然后输入框中数据变化之后引起data中改变，然后才是model这个对象属性发生改变
    最开始我理解成了输入框变化导致model对象属性变化，然后出现model如何将新数据流向data的疑问

    个人发现v-model可以结合v-for使用，不过这种场景很少出现

    发现disabled这个属性不会自动转换布尔值，需要手动使用Boolean函数转换或使用!转换 如下：
             :disabled="!Boolean(category3Id)"  :disabled="!category3Id"

    注意：别再data中收集三级分类的id，因为对象存储数据无序存储


    个人注释：表单经常使用:model="data" 然后文本框等开始使用v-model来收集数据，表格经常使用:data="data" 来对数据进行展示，然而有时候也会使用v-model来对数据进行收集，如attr中就使用到了


    深拷贝，浅拷贝在面试的时候出现频率很高

    