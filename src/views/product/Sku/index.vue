<template>
  <div>
    <el-table style="width: 100%" border :data="records">
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="skuName" label="名称" width="width">
      </el-table-column>
      <el-table-column prop="skuDesc" label="描述" width="width">
      </el-table-column>
      <el-table-column label="默认图片" width="140">
        <template slot-scope="{ row, $index }">
          <img
            :src="row.skuDefaultImg"
            alt=""
            style="width: 100px; height: 100px; margin: 0 9.5px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="重量" width="100">
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100"> </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template v-slot="{ row, $index }">
          <!-- 对于上架与下架的箭头看个人喜好，我的想法是箭头向上代表处于下架状态，而老师的是箭头向上代表处于上架状态 -->
          <el-button
            v-if="row.isSale == 1"
            @click="cancelSale(row)"
            type="success"
            icon="el-icon-sort-down"
            size="mini"
          ></el-button>
          <el-button
            v-else
            type="success"
            @click="sale(row)"
            icon="el-icon-sort-up"
            size="mini"
          ></el-button>
          <el-button
            type="primary"
            @click="edit"
            icon="el-icon-edit"
            size="mini"
          ></el-button>
          <el-button
            type="info"
            @click="getSkuInfo(row)"
            icon="el-icon-info"
            size="mini"
          ></el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="getSkuList"
      style="text-align: center"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
    >
    </el-pagination>
    <!-- 抽屉效果 -->
    <el-drawer title="" :visible.sync="show" :show-close="false" size="50%">
      <el-row>            
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{ skuInfo.skuName }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{ skuInfo.skuDesc }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{ skuInfo.price }}元</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="16">
          <template>
            <el-tag
              type="success"
              style="margin: 5px 5px"
              v-for="(attr, index) in skuInfo.skuAttrValueList"
              :key="attr.id"
              >{{ attr.attrId }}--{{ attr.valueId }}</el-tag
            >
          </template>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="16">
          <!-- 其实最好就是给样式通过类名写在style中便于维护 -->
          <el-carousel
            height="150px"
            class="ceshi"
            style="width: 350px; margin: 0 auto"
          >
            <el-carousel-item
              v-for="item in skuInfo.skuImageList"
              :key="item.id"
            >
              <img :src="item.imgUrl" alt="" style="width: 100%" />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: "Sku",
  data() {
    return {
      page: 1, //代表当前第几页
      limit: 10, //当前页面有多少条数据
      records: [], //存储sku分页列表的数据
      total: 0, //存储分页器总数据条数
      skuInfo: {}, //存储sku信息
      show: false,
    };
  },
  mounted() {
    // 获取sku列表
    this.getSkuList();
  },
  methods: {
    // 虎丘sku列表数据的方法
    async getSkuList(pager = 1) {
      this.page = pager;
      const { page, limit } = this;
      let result;
      try {
        result = await this.$API.sku.reqSkuList(page, limit);
        if (result.code == 200) {
          this.records = result.data.records;
          this.total = result.data.total;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    // 修改显示条数回调
    handleSizeChange(limit) {
      this.limit = limit;
      this.getSkuList();
    },
    // 上架回调
    async sale(sku) {
      let result;
      try {
        result = await this.$API.sku.reqSale(sku.id);
        if (result.code == 200) {
          sku.isSale = 1;
          this.$message({ type: "success", message: "上架成功" });
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    // 下架回调
    async cancelSale(sku) {
      let result;
      try {
        result = await this.$API.sku.reqCancel(sku.id);
        if (result.code == 200) {
          sku.isSale = 0;
          this.$message({ type: "success", message: "下架成功" });
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    // 编辑回调
    edit() {
      this.$message({ type: "info", message: "正在开发中" });
    },
    // 获取sku详情的回调
    async getSkuInfo(sku) {
      // 展示抽屉
      this.show = true;
      let result;
      try {
        result = await this.$API.sku.reqSkuById(sku.id);
        if (result.code == 200) {
          this.skuInfo = result.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
  },
};
</script>

<style scoped>
.el-row .el-col-5 {
  font-size: 18px;
  text-align: right;
  font-weight: bold;
}
.el-col {
  margin: 10px;
}
>>> .el-carousel__button {
  width: 10px;
  height: 10px;
  background: red;
  border-radius: 50%;
}
</style>
<style>
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 150px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
/* 下面这个样式放在scoped中不生效，这是因为scoped私有化了，使用深度选择器才能影响到子组件样式 */
/* 个人注释：对于这种组件想要写一下样式但是结构没有出现在当前组件中类名不确定可以打开浏览器检查元素看，老师就是这样做的  
    如果结构在当前样式中可以可以使用自己添加类名或使用内联样式更加方便 */
/*
  写到scoped中使用深度选择器
.el-carousel__button {
  width: 10px;
  height: 10px;
  background: red;
  border-radius: 50%;
} */
</style>


