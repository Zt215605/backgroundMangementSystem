<template>
  <div>
    <!-- inline：代表的是行内表单，一行可以放置多个表单元素 -->
    <el-form :inline="true" class="demo-form-inline" :model="cForm">
      <el-form-item label="一级分类">
        <el-select
          placeholder="请选择"
          v-model="cForm.category1Id"
          @change="handler1"
          :disabled="show"
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
          :disabled="show"
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
          :disabled="show"
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
  </div>
</template>

<script>
export default {
  name: "CategorySelect",
  data() {
    return {
      // 一级分类数据
      list1: [],
      // 二级分类数据
      list2: [],
      // 三级分类数据
      list3: [],
      // 收集相应的一级二级三级分类的id
      cForm: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
    };
  },
  props: ["show"],
  mounted() {
    this.getCategory1List();
  },
  methods: {
    // 获取一级分类数据的方法
    async getCategory1List() {
      // 获取一级分类的请求：不需要携带参数
      let result;
      try {
        result = await this.$API.attr.reqCategory1List();
        // console.log(result);
        if (result.code == 200) {
          this.list1 = result.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    // 一级分类的select事件回调（一级分类option发生变化时获取相应的二级分类数据）
    async handler1() {
      // 清楚数据
      this.list2 = [];
      this.list3 = [];
      this.cForm.category2Id = "";
      this.cForm.category3Id = "";
      let { category1Id } = this.cForm;
      this.$emit("getCategoryId", { categoryId: category1Id, level: 1 });
      // 通过一级分类的id获取二级分类的数据
      let result;
      try {
        result = await this.$API.attr.reqCategory2List(category1Id);
        // console.log(result);
        if (result.code == 200) {
          this.list2 = result.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    // 二级分类的select事件回调（二级分类option发生变化时获取相应的二级分类数据）
    async handler2() {
      // 清除数据
      this.list3 = [];
      this.cForm.category3Id = "";
      let { category2Id } = this.cForm;
      this.$emit("getCategoryId", { categoryId: category2Id, level: 2 });
      // 通过二级分类的id获取三级分类的数据
      let result;
      try {
        result = await this.$API.attr.reqCategory3List(category2Id);
        // console.log(result);
        if (result.code == 200) {
          this.list3 = result.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    // 三级分类的select事件回调
    handler3() {
      const { category3Id } = this.cForm;
      this.$emit("getCategoryId", { categoryId: category3Id, level: 3 });
    },
  },
};
</script>

<style>
</style>