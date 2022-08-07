<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelect @getCategoryId="getCategoryId" :show="scene != 0" />
    </el-card>
    <el-card>
      <!-- 这里将来是有三部分进行切换 -->
      <div v-show="scene == 0">
        <!-- 展示spu列表的结构 -->
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSpu"
          :disabled="!category3Id"
          >添加SPU</el-button
        >
        <el-table style="width: 100%" border :data="records">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <hint-button
                type="success"
                icon="el-icon-plus"
                size="mini"
                title="添加sku"
                @click="addSku(row)"
              ></hint-button>
              <hint-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改spu"
                @click="updateSpu(row)"
              ></hint-button>
              <hint-button
                type="info"
                icon="el-icon-info"
                size="mini"
                title="查看当前spu全部sku列表"
                @click="handler(row)"
              ></hint-button>
              <el-popconfirm
                title="这是一段内容确定删除吗？"
                @onConfirm="deleteSpu(row)"
              >
                <hint-button
                  type="danger"
                  icon="el-icon-danger"
                  size="mini"
                  title="删除spu"
                  slot="reference"
                ></hint-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align: center"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total"
          @current-change="getSpuList"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
      <SpuForm v-show="scene == 1" @changeScene="changeScene" ref="spu" />
      <SkuForm v-show="scene == 2" ref="sku" @changeScenes="changeScenes" />
    </el-card>
    <el-dialog
      :title="`${spu.spuName}的sku列表`"
      :visible.sync="dialogTableVisible"
      :before-close="close"
    >
      <el-table :data="skuList" v-loading="loading">
        <el-table-column
          prop="skuName"
          label="名称"
          width="width"
          header-align="center"
          align="center"
        ></el-table-column>
        <el-table-column
          header-align="center"
          align="center"
          property="price"
          label="价格"
          width="width"
        ></el-table-column>
        <el-table-column
          header-align="center"
          align="center"
          prop="weight"
          label="重量"
          width="width"
        >
        </el-table-column>
        <el-table-column
          header-align="center"
          align="center"
          label="默认图片"
          width="width"
        >
          <template v-slot="{ row, $index }">
            <img :src="row.skuDefaultImg" alt="" style="width: 100px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SpuForm from "./SpuForm";
import SkuForm from "./SkuForm";
export default {
  name: "Spu",
  data() {
    return {
      // 分类的的id
      category1Id: "",
      category2Id: "",
      category3Id: "",
      // 控制三级联动的可操作性
      show: true,
      page: 1, //分页器当前是第几页
      limit: 3, //每一页需要展示多少条数据
      records: [], //存储spu列表的数据
      total: 0, //总共数据条数
      scene: 0, //0代表的展示spu列表数据  1添加sup|修改spu  2添加sku
      // 控制对话框的显示与隐藏
      dialogTableVisible: false,
      spu: {},
      skuList: [], //存储sku列表的数据
      loading: true,
    };
  },
  components: {
    SkuForm,
    SpuForm,
  },
  methods: {
    // 三级联动的自定义事件，可以给子组件的id传递给父组件
    getCategoryId({ categoryId, level }) {
      // categoryId可以获取到一二三级id，level用来区分相应的几级id
      if (level == 1) {
        this.category1Id = categoryId;
        // 清除2，3级分类的id
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        // 清除3级分类的id
        this.category3Id = "";
      } else {
        this.category3Id = categoryId;
        // 获取spu列表数据进行展示
        this.getSpuList();
      }
    },
    async getSpuList(pages = 1) {
      this.page = pages;
      // 解构出参数
      const { page, limit, category3Id } = this;
      // 携带三个参数：page 第几页  limit 每一页所需要展示的数据条数  category3Id三级分类id
      let result;
      try {
        result = await this.$API.spu.reqSpuList(page, limit, category3Id);
        if (result.code == 200) {
          this.total = result.data.total;
          this.records = result.data.records;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    /*  使用上面个函数合并这个函数
    // 点击分页器第几页的回调   这里会自动注入一个参数，这个参数代表的当前页
    handleCurrentChange(page){
      this.page=page;
      this.getSpuList();
    } */
    //展示数据变化的回调
    handleSizeChange(limit) {
      this.limit = limit;
      this.getSpuList();
    },
    // 添加spu的回调
    addSpu() {
      this.scene = 1;
      // 通知子组件SpuForm发请求 并将category3Id通过函数参数的形式传递过去        //这种写法调用函数并顺便给参数传递过去还省去了props传递的方式
      this.$refs.spu.addSpuData(this.category3Id);
    },
    // 修改某一个spu
    updateSpu(row) {
      this.scene = 1;
      // 获取子组件的SpuForm
      // 在负组件中可以通过$ref获取子组件，vm.$children来获取等等
      this.$refs.spu.initSpuData(row);
    },
    // 自定义事件回调(spuForm)
    changeScene({ scene, flag }) {
      // flag这个形参是为了区分保存按钮时添加还是修改
      // 切换结构（场景）
      this.scene = scene;
      // 子组件通知父组件切换场景，需要再次获取spu列表的数据进行展示
      if (flag == "修改") {
        this.getSpuList(this.page);
      } else {
        this.getSpuList();
      }
    },
    // 删除spu的回调
    async deleteSpu(row) {
      let result;
      try {
        result = await this.$API.spu.reqDeleteSpu(row.id);
        if (result.code == 200) {
          this.$message({ type: "success", message: "删除成功" });
          // 代表spu个数大于1停留到当前，反之回到上一页
          this.getSpuList(this.records.length > 1 ? this.page : this.page - 1);
        }
      } catch (error) {
        console.warn("error :>> ", error);
      }
    },
    // 添加sku按钮的回调
    addSku(row) {
      // 切换场景为2
      this.scene = 2;
      // 父组件调用子组件的方法，让子组件还请求，共三个
      this.$refs.sku.getData(this.category1Id, this.category2Id, row);
    },
    // skuForm通知父组件修改场景
    changeScenes(scene) {
      this.scene = scene;
    },
    //查看sku的按钮回掉
    async handler(spu) {
      // this.skuList=[];     //这种方式是我写的，在点开的时候将数据置空，老师的写法是写在关闭对话框的回调中
      // loading显示
      // this.loading = true;
      // 点击后对话框可见
      this.dialogTableVisible = true;
      // 保存spu信息
      this.spu = spu;
      // 获取sku列表的数据进行展示
      let result;
      try {
        result = await this.$API.spu.reqSkuList(spu.id);
        if (result.code == 200) {
          this.skuList = result.data;
          // loading隐藏
          this.loading = false;
        }
      } catch (error) {
        console.warn("error :>> ", error);
      }
    },
    // 关闭对话框的回调
    close(done){
      this.loading=true;
      this.skuList=[];
      // 用于关闭对话框
      done();
    }
  },
  /* 
    个人扩展：父组件触发子组件事件个人最容易想到的是ref与全局事件总线绑定函数

    网络扩展：
      Vue 父组件中触发子组件的方法：

      使用场景：
          在父组件点击子组件时，触发子组件的初始化方法。

      方式一：

      ①子组件中使用 ref 属性

      <ParentComponent>
          <ChildComponents ref="ChildComponents"></ChildComponents>
      </ParentComponent>
      ②父组件事件中使用 $refs 获取到子组件，并调用其方法：

      this.$refs.ChildComponents.init();

      方式二：父组件每次点击传递给子组件一个属性值，子组件监听该属性的变化来触发其方法。

      ①父组件设置属性值：

      <ParentComponent>
          <ChildComponents :update="timer"></ChildComponents>
      </ParentComponent>
      export default {
        name: "ParentComponent",
        data() {
          return {
            timer: "",
          };
        },
        methods: {
          handleClick(tab, event) {
            this.timer = new Date().getTime();
          },
        },
      };

      ②子组件监听属性值：

      export default {
        name: "ChildComponents",
        props: ["update"],
        watch: {
          update: function() {
            this.init();
          },
        },
      
        methods: {
          init: function() {
            console.log("init");
          },
        },
      };

      原文链接：https://blog.csdn.net/guokexiaohao/article/details/113730983
        
  */
};
</script>

<style scoped>
</style>