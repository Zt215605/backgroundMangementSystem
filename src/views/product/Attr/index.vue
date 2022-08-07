<template>
  <div>
    <el-card style="magin: 20px 0">
      <CategorySelect @getCategoryId="getCategoryId" :show="!isShowTable" />
    </el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addAttr"
          >添加属性</el-button
        >
        <!-- 表格：展示平台属性 -->
        <el-table :data="attrList" style="width: 100%" border>
          <el-table-column
            type="index"
            prop="prop"
            label="序号"
            width="80"
            align="center"
          >
          </el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150">
          </el-table-column>
          <el-table-column prop="prop" label="属性值列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
                style="margin: 0 20px"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="updateAttr(row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加属性或者修改属性的结构 -->
      <div v-show="!isShowTable">
        <el-form :inline="true" ref="form" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrInfo.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrValue"
          :disabled="!attrInfo.attrName"
          >添加属性值</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
        <el-table
          :data="attrInfo.attrValueList"
          style="width: 100%; margin: 20px 0px"
          border
        >
          <el-table-column align="center" type="index" label="序号" width="80">
          </el-table-column>
          <el-table-column width="width" prop="prop" label="属性值名称">
            <template slot-scope="{ row, $index }">
              <!-- 思考？ 即使这部分结构不隐藏在这里刚开始为啥使用ref也拿不到el-input这个实例 -->
              <el-input
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
                v-show="row.flag"
                :ref="$index"
                @blur="toLook(row)"
                @keyup.native.enter="toLook(row)"
              ></el-input>
              <span
                v-show="!row.flag"
                @click="toEdit(row, $index)"
                style="display: block"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column width="width" prop="prop" label="操作">
            <template slot-scope="{ row, $index }">
              <!-- 气泡提示框     旧版本elementUi中是onConfirm事件-->
              <el-popconfirm
                :title="`你确定删除${row.valueName}吗？`"
                @onConfirm="deleteAttrValue($index)"
              >
                <el-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  >删除</el-button
                >
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          @click="addOrUpdateAttr"
          :disabled="attrInfo.attrValueList.length < 1"
          >保存</el-button
        >
        <el-button @click="isShowTable = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 按需引入lodash当中的深拷贝
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      // 平台属性字段
      attrList: [],
      // 这个属性控制表格的显示与隐藏
      isShowTable: true,
      // 收集新增属性|修改属性
      attrInfo: {
        attrName: "", //属性名
        attrValueList: [
          //属性值，因为属性值可以是多个，因此需要的是数组，每个属性值都是对象（包含attrId与valueName）
        ],
        categoryId: 0, //三级分类的id
        categoryLevel: 3, //因为服务器也需要区分是几级id
      },
    };
  },
  methods: {
    //自定义事件的回调
    getCategoryId({ categoryId, level }) {
      // 区分三级分类相应的id，以及父组件进行存储
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
      } else {
        // 代表三级分类的id有了
        this.category3Id = categoryId;
        // 发请求获取平台属性数据
        this.getAttrList();
      }
    },
    // 获取平台属性的数据
    // 当用户确定三级分类的数据时，可以向服务器发请求获取平台数据进行展示
    async getAttrList() {
      // 获取分类的id
      let { category1Id, category2Id, category3Id } = this;
      let result;
      try {
        result = await this.$API.attr.reqAttrList(
          category1Id,
          category2Id,
          category3Id
        );
        // console.log(result);
        if (result.code == 200) {
          this.attrList = result.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    //添加属性值的回调
    addAttrValue() {
      // 向属性值的数组中添加元素
      // attrId:是相应的属性的id，对于添加操作是没有相应的id（该id应该由服务器生成），然而对于修改是在原有基础上修改，此时服务器早已经生成了属性id
      // valueName:相应的属性值的名称
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id, //对于修改某一个属性的时候，可以在已有的属性值基础之上新增新的属性值（新增属性值的时候，需要把已有的属性的id带上）
        // 个人注释：在添加操作的时候是没有id这个属性的，所以此时为this.attrInfo.id为undefined
        valueName: "",
        flag: true, //flag给每一个属性添加一个标记flag，用户切换查看模式与编辑模式，每一个属性值可以自己控制模式
        // 当前flag是响应式的数据（数据变化视图跟着变化）
      });
      this.$nextTick(() => {
        // 获取相应的元素实现聚焦
        this.$refs[this.attrInfo.attrValueList.length - 1].focus();
      });
    },
    // 添加属性按钮回调
    addAttr() {
      this.isShowTable = false;
      // 清除数据
      // 收集三级分类的id
      this.attrInfo = {
        attrName: "", //属性名
        attrValueList: [
          //属性值，因为属性值可以是多个，因此需要的是数组，每个属性值都是对象（包含attrId与valueName）
        ],
        categoryId: this.category3Id, //三级分类的id
        categoryLevel: 3, //因为服务器也需要区分是几级id
      };
    },
    // 修改某一个属性
    updateAttr(row) {
      //isShowTable变为false
      this.isShowTable = false;
      // 将选中的属性赋值给attrInfo
      // 由于数据结构中存在对象里面数组，数组里面又是对象，因此需要使用深拷贝来解决引用关系的问题
      // 深拷贝，浅拷贝在面试的时候出现频率很高，切记要达到手写深拷贝与浅拷贝
      this.attrInfo = cloneDeep(row);
      // 在修改某一个属性的时候，将相应的属性值元素添加上flag这个标记
      this.attrInfo.attrValueList.forEach((item) => {
        // 这样书写也可以给属性值添加flag，但是会发现试图不会跟着变化（因为flag不是响应式数据）
        // item.flag=false;
        this.$set(item, "flag", false);
      });
    },
    // 失去焦点的事件 ---切换为查看模式，展示span
    toLook(row) {
      // 如果属性值为空不能作为新的属性值，需要给用户提示，让他输入一个其他的属性值
      if (row.valueName.trim() == "") {
        this.$message("请输入正常的属性值！");
        return;
      }
      // 新增的属性值不能与已有的属性值相同
      let isRepeat = this.attrInfo.attrValueList.some((value) => {
        // 需要将row从数组里面判断的时候去除
        // row最新新增的属性值【数组的最后一项元素】
        // 判断的时候需要把已有的数组当中新增的这个属性值去除
        if (row !== value) {
          return row.valueName == value.valueName;
        }
      });
      if (isRepeat) {
        return;
      }
      // row:形参是当前用户添加的最新的属性值
      // 当前编辑模式变为查看模式【让input小时，显示span】
      row.flag = false;
    },
    // 点击span自动变成为编辑模式
    toEdit(row, index) {
      row.flag = true;
      // 获取input节点，实现自动聚焦
      // 需要注意：点击span的时候，切换为input变为编辑模式（使用v-if的形式显示与隐藏），但是对于浏览器而言，页面重回与重拍耗时间的
      // 重新渲染是需要耗费时间的，所以我们不可能一点击就能够拿到input
      // 这里就算使用v-show显示与隐藏也需要使用到$nextTick，因为vue中nextTick也讲到display：none之后的元素调用focus()无效
      this.$nextTick(() => {
        // 获取相应的元素实现聚焦
        this.$refs[index].focus();
      });
    },
    // 气泡确认框的回调
    deleteAttrValue(index) {
      this.attrInfo.attrValueList.splice(index, 1);
    },
    // 保存按钮：进行添加属性或修改属性的操作
    async addOrUpdateAttr() {
      /*  整理参数：
        1.如果用户添加了很多属性值，且属性值是空则不能提交给服务器
        2. 提交给服务器数据当中不应该出现flag字段 
        
      */
      /* 
        个人注释：这里试了一下空字符串携带给后端，结果后端可以存取，说明后端校验不严格，
        从这也看出来在工作中表单验证一定要校验好发请请求 
      */
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(
        (value) => {
          // 过滤掉属性值不是空的
          if (value.valueName.trim() !== "") {
            // 删除掉flag属性
            delete value.flag;
            return true;
          }
        }
      );
      // 发请求
      let result;
      try {
        result = await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo);
        if (result.code == 200) {
          this.$message({ type: "success", message: "保存成功" });
        }
        this.isShowTable = true;
        // 保存成功再次发请求展示数据
        this.getAttrList();
      } catch (error) {
        this.$message("保存失败");
        console.log("error :>> ", error);
      }
    },
  },
  mounted() {
    /* 思考？为啥这里插槽中的使用ref获取不到，必须使用dom才能获取到 */
    // this.$nextTick(() => {
    //   setTimeout(() => {
    //     console.log(this.$refs);
    //   }, 2000);
    // });
  },
};
</script>

<style scoped>
</style>

