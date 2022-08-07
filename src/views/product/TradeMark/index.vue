<template>
  <div>
    <el-button
      type="primary"
      icon="el-icon-plus"
      style="margin: 10px 0"
      @click="showDialog"
      >添加</el-button
    >
    <!-- 表格组件 
      data:表格组件将来需要展示的数据   数组类型
      border:给表格添加边框
      column属性
          label：显示标题
          width：对应列的宽度
          align：标题的对齐方式
          prop:对应列内容的字段名
      注意：elementUi当中的table组件展示的数据是以一列一列的展示的   

    -->
    <el-table :data="list" style="width: 100%" border>
      <el-table-column type="index" label="序号" width="80px" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <!-- row是每个数据，$index是每个数据的索引值 -->
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="picture" style="width: 80px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="updateTradeMark(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTradeMark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 
        当前第几页，数据总条数，每一页展示条数，连续页码数
          
      current-page:代表的是当前第几页
      total：代表分页器一共需要展示数据条数
      page-size：代表的是每一页需要展示多少条数据
      page-sizes：代表可以设置每一页展示多少条数据  
      个人注释： page-size要和page-sizes当中的数据对得上才可以,也就是说page-size如果数字没有与page-sizes这个数组里面的数组对应上,
          那么就会取page-sizes当中的第一个值来计算页码 详细见：https://blog.csdn.net/u014582342/article/details/124510645
      layout：可以实现分页器布局
      page-count：页码按钮数量  如果是9，连续页码数就是7

    -->
    <!-- 发现这里style中的text-align可以textAlign，但是格式化后会变成小写，处理方法之一：可以使用v-bind绑定style样式 -->
    <el-pagination
      style="matgin-top: 20px; text-align: center"
      :current-page="page"
      :page-sizes="[5, 7, 9]"
      :page-size="limit"
      :page-count="7"
      layout=" prev, pager, next, jumper,->,sizes,total"
      :total="total"
      @current-change="getPageList"
      @size-change="handleSizeChange"
    >
    </el-pagination>
    <!-- 
      对话框：
        :visible.sync ：控制对话框显示与隐藏用

     -->

    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <!-- form表单   对于elementUi收集表单数据需要绑定一个model   
          :model属性：这个属性的作用是把表单的数据收集到那个对象的身上，将来表单验证，也需要这个属性

          个人理解：看了form组件的封装发现model传过去了，主要用来进行表单验证，而对于table的data则是传递过去进行展示
       -->
      <!-- Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 
            属性设置为需校验的字段名即可。校验规则参见 async-validator 
      -->

      <el-form style="width: 80%" :model="tmForm" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" :label-width="'100px'" prop="tmName">
          <el-input autocomplete="off" v-model="tmForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="'100px'" prop="logoUrl">
          <!-- 教学中说：el-upload这里收集数据不能使用v-model，因为不是表单元素    
              action：设置图片上传的地址
              :on-success ：可以检测到图片上传成功，当图片上传成功，会执行一次
              :before-upload ：在上传图片之前，会执行一次   
           -->
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "TradeMark",
  data() {
    // 自定义校验规则
    let validateTmName = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error("品牌名称为2-10位")); //个人注释：callback回调中传入的值必须看文档中，我看Github说的这里面是通过判断promise来决定状态
      } else {
        callback();
      }
    };
    return {
      // 代表的分页器第几页
      page: 1,
      // 当前页数展示数据条数
      limit: 5,
      // 总共数据条数
      total: 0,
      // 列表展示数据
      list: [],
      // 对话框显示与隐藏
      dialogFormVisible: false,
      // 上传图片使用的属性
      // imgUrl: "",   //这个不使用了应该换位服务器的图片地址，详细见视频
      // 收集品牌信息，对象身上属性不能乱写，需要看文档
      tmForm: {
        tmName: "",
        logoUrl: "",
      },
      // rules：表单验证规则
      rules: {
        // require:必须校验字段（与星号有关）  message：提示信息   trigger：用户行为设置（事件的设置：blur，change）
        // min与max：品牌名称长度最小值与最大值
        // 品牌名称验证规则
        /* 未使用自定义校验规则 */
        /*  tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "长度在 2 到 10 个字符",
            trigger: "change",
          },
        ],
        logoUrl: [{ required: true, message: "请选择品牌的图片" }],
        */
        /* 下面种使用了一个自定义规则 */
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          // 自定义校验规则
          {
            //个人注释：这里校验就是这种分开写效果好，发现合拢写存在提示的小问题，存在的其它问题有待探究
            validator: validateTmName,
            trigger: "change",
          },
        ],
        // 品牌logo验证规则
        logoUrl: [{ required: true, message: "请选择品牌的图片" }],
      },
    };
  },
  mounted() {
    this.getPageList();
  },
  methods: {
    // 这里是进行了代码优化，给handleCurrentChange函数合并在getPageList中了
    async getPageList(pager = 1) {
      this.page = pager;
      // 获取品牌列表接口
      let { page, limit } = this;
      let result;
      // 向服务器发请求需要带两个参数
      try {
        result = await this.$API.trademark.reqTradeMarkList(page, limit);
        // console.log(result);
        if (result.code === 200) {
          // 分别是展示数据总条数与列表展示的数据
          this.total = result.data.total;
          this.list = result.data.records;
        }
      } catch (e) {
        console.warn("e :>> ", e);
      }
    },
    // 当分页器某一页需要展示数据条数发生变化的时候调用
    handleSizeChange(limit) {
      // 整理参数再次发送请求
      this.limit = limit;
      this.getPageList();
    },
    //点击添加品牌展示对话框
    showDialog() {
      // 显示对话框
      this.dialogFormVisible = true;
      // 清除数据
      this.tmForm = { tmName: "", logoUrl: "" };
    },
    // 修改品牌的回调
    updateTradeMark(row) {
      this.dialogFormVisible = true;
      // 将已有信息赋值给tmForm进行展示     个人注释：row是服务器获取回来的数据通过插槽回传过来的数据，如果这里直接赋值就会出现对象引用，然而tmForm使用了v-model
      // tmForm一旦修改了就会导致row被修改  所以应该浅拷贝（使用扩展运算符或Object.assign）
      this.tmForm = { ...row };
    },
    // 上传图片相关的回调
    // 图片上传成功
    handleAvatarSuccess(res, file) {
      // res：上传成功之后返回给前端的数据
      // file：上传成功之后服务器返回前端数据
      this.tmForm.logoUrl = res.data;
      // this.imgUrl = URL.createObjectURL(file.raw);   //用上面代码替换了，详细看视频
      // console.log('图片上传成功了，图片访问地址为'+res.data);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    // 添加按钮，添加或修改品牌
    addOrUpdateTradeMark() {
      // 当全部验证字段通过，再去书写业务逻辑
      this.$refs.ruleForm.validate(async (success) => {
        //这里这个形参success代表最终表单验证成功或失败的状态
        // 如果全部字段符合条件
        if (success) {
          this.dialogFormVisible = false;
          // 发请求
          let result;
          try {
            result = await this.$API.trademark.reqAddOrUpdateTradeMark(
              this.tmForm
            );
            if (result.code === 200) {
              // 弹出信息：添加品牌成功，修改品牌成功
              // this.$message(this.tmForm.id?'修改品牌成功':'添加品牌成功');  使用下面的代替，下面这种可以设置成功或失败的提示样式
              this.$message({
                type: "success",
                message: this.tmForm.id ? "修改品牌成功" : "添加品牌成功",
              });
              // 添加或者修改品牌成功之后，需要再次获取数据进行展示
              this.getPageList(this.tmForm.id ? this.page : 1);
            }
          } catch (error) {
            console.log("error :>> ", error);
          }
        } else {
          console.log("error submit");
          return false;
        }
      });
    },
    deleteTradeMark(row) {
      // 弹窗
      this.$confirm(`你确定删除${row.tmName}`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          // 当用户点击确定按钮的时候会触发
          let result;
          try {
            result = await this.$API.trademark.reqdeleteTradeMark(row.id);
            if (result.code == 200) {
              this.$message({
                type: "success",
                message: "删除成功!",
              });
              // 再次获取品牌列表数据
              this.getPageList(
                this.list.length > 1 ? this.page : this.page - 1
              );
            }
          } catch (e) {
            console.log("e :>> ", e);
          }
        })
        .catch(() => {
          // 当用户点击取消按钮的时候触发
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};

/* 
  个人注释：这个组件封装得一点都不专业，还需要自己携带样式，好的组件应该是自己可以修改样式，默认样式是写在组件内部的
  这里出现了结构在组件内部，但是样式需要在父组件中使用，这就导致了父组件不能设置scoped这样就可能会出现样式混乱
  ，如果说样式是随着结构通过插槽带过去还能理解，但是这里并没有通过插槽带过去，就为了少写几行代码造成这种问题真垃圾
  浏览器上看结构就能够看出这个组件封装的这一缺点               
      个人更正：
          其实也不能说不专业，对于常规的结构是可以通过插槽的时候带过去，但是这里是组件，scoped的样式值影响组件最外层结构
          所以这里出现设置scoped之后样式不生效主要是因为这里是组件而且结构复杂，通过看了后面视频之后发现
        如果写在scoped中则应该使用深度选择器(后面有讲)

      关于深度选择器：
      https://blog.csdn.net/YoungMan_09/article/details/124183560

      https://blog.csdn.net/qq_37600506/article/details/122703393

      项目做完复习css的时候记得学一下sass(scss)与 stylus 和样式穿透

*/
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>