<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spu">
      <!-- 写了label-width之后以后就el-form-item就可以不用写width="80"，会自动继承 -->
      <el-form-item label="Spu名称">
        <el-input placeholder="Spu名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="(tm, index) in tradeMarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Spu描述">
        <el-input
          type="textarea"
          v-model="spu.description"
          rows="4"
          placeholder="描述"
        ></el-input>
      </el-form-item>
      <el-form-item label="Spu图片">
        <!-- 上传图片：action图片上传的地址，list-type:文件列表的类型  
        on-preview：图片预览的时候会触发 
        on-remove：当删除图片的时候会触发 
        
        -->
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :file-list="spuImageList"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleAvatarSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          :placeholder="`${unSelectSaleAttr.length}`"
          v-model="attrIdAndAttrName"
        >
          <el-option
            :label="unselect.name"
            :value="`${unselect.id}:${unselect.name}`"
            v-for="(unselect, index) in unSelectSaleAttr"
            :key="unselect.id"
          >
          </el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrIdAndAttrName"
          @click="addSaleAttr"
          >添加销售属性</el-button
        >
        <!-- 显示的是当前spu属于自己的销售属性 -->
        <el-table border style="width: 100%" :data="spu.spuSaleAttrList">
          <el-table-column type="index" align="center" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{ row, $index }">
              <!-- el-tag:用户展示已有属性值列表的数据 -->
              <el-tag
                :key="tag.id"
                v-for="(tag, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="handleClose(row, index)"
              >
                {{ tag.saleAttrValueName }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                v-model="row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <!--  @click="showInput" -->
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="addSaleAttrValue(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteSaleAttrValue($index)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancelFun">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      /*  spu属性初始化的时候是一个空对象，在修改spu的时候，会向服务器发请求，返回spu信息（对象），
      在修改的时候可以利用服务器返回的这个对象收集最新的数据提交给服务器
      添加spu，如果是添加spu的时候并没有向服务器发请求，数据也收集到spu上，收集数据的字段看文档   
        个人注释：这里还有种做法就是另外在写一个对象来收集参数，也可以写两个对象分别存放给自的数据不动服务器返回的数据，
        但是共用一个对象存储数据效果是最优的
      */
      // spu: {}, //存储SPU信息属性
      spu: {
        // 三级分类的id
        category3Id: 0,
        // 描述
        description: "",
        // 收集spu图片
        // 平台的id
        tmId: "",
        spuImageList: [],
        // spu名称
        spuName: "",
        // 平台属性与属性值收集
        spuSaleAttrList: [],
      },
      tradeMarkList: [], //存储品牌信息
      spuImageList: [], //存储spu图片的数据
      saleAttrList: [], //销售属性的数据（项目全部的销售属性）
      attrIdAndAttrName: "", //收集未选择的销售属性的id
    };
  },
  methods: {
    // 当照片墙删除某一个图片的时候会触发
    handleRemove(file, fileList) {
      // file代表删除的那张图片
      // fileList删除之后剩余的图片
      // 收集照片墙图片的数据
      // 对于已有的图片【照片墙中显示的图片：有name，url字段的】，因为照片墙显示数据务必要有这两个属性
      // 对于服务器而言：不需要name，url字段，将来对于有的图片的数据在提交给服务器的时候，需要处理的
      this.spuImageList = fileList;
    },
    // 照片墙预览功能的回调
    handlePictureCardPreview(file) {
      // 将图片地址赋值给这个属性
      this.dialogImageUrl = file.url;
      // 对话框显示
      this.dialogVisible = true;
    },
    // 初始化SpuForm数据
    async initSpuData(spu) {
      let spuResult;
      let tradeMarkResult;
      let spuImageResult;
      let baseSaleAttrResult;
      // 获取spu信息     这部分主要是我比较喜欢看到try ...catch 不然我就直接写一个try...catc包含了
      try {
        spuResult = await this.$API.spu.reqSpu(spu.id);
        if (spuResult.code == 200) {
          this.spu = spuResult.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
      // 获取品牌信息
      try {
        tradeMarkResult = await this.$API.spu.reqTradeMarkList();
        if (tradeMarkResult.code == 200) {
          this.tradeMarkList = tradeMarkResult.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
      // 获取spu图片的数据
      try {
        spuImageResult = await this.$API.spu.reqSpuImageList(spu.id);
        if (spuImageResult.code == 200) {
          let listArr = spuImageResult.data;
          // 由于照片墙显示图片的数据需要数组，数组里面的元素需要有name与url字段
          // 需要把服务器返回的数据进行修改
          listArr.forEach((item) => {
            item.name = item.imgName;
            item.url = item.imgUrl;
          });
          this.spuImageList = listArr;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
      // 获取平台的全部销售属性
      try {
        baseSaleAttrResult = await this.$API.spu.reqBaseSaleAttrList();
        if (baseSaleAttrResult.code == 200) {
          this.saleAttrList = baseSaleAttrResult.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    // 照片墙图片上传成功的回调
    handleAvatarSuccess(response, file, fileList) {
      // 收集图片的信息
      this.spuImageList = fileList;
    },
    // 失去焦点的回调
    handleInputConfirm(row) {
      // 解构出销售属性当中书记数据
      const { inputValue, baseSaleAttrId } = row;
      // 新增的属性值的名称不能为空
      if (inputValue.trim() == "") {
        this.$message("属性值不能为空");
        return;
      }
      // 属性值不能重复，这里也可以使用some
      let result = row.spuSaleAttrValueList.every((value) => {
        return value.saleAttrValueName != inputValue;
      });
      if (!result) {
        this.$message("数据不能重复");
        return;
      }

      // 修改字段inputVisible为false
      row.inputVisible = false;

      // 新增的销售属性值
      let newSaleAttrValue = { baseSaleAttrId, saleAttrValueName: inputValue };
      // 新增
      row.spuSaleAttrValueList.push(newSaleAttrValue);
    },
    handleClose(row, index) {
      row.spuSaleAttrValueList.splice(index, 1);
    },
    deleteSaleAttrValue($index) {
      this.spu.spuSaleAttrList.splice($index, 1);
    },
    // 添加新的销售属性
    addSaleAttr() {
      // 已经收集需要添加的销售属性的信息
      // 把收集到的销售属性进行分割
      const [baseSaleAttrId, saleAttrName] = this.attrIdAndAttrName.split(":");
      // 向spu对象的spuSaleAttrList属性里面添加新的销售属性
      let newSaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };
      // 添加新的销售属性
      this.spu.spuSaleAttrList.push(newSaleAttr);
      // 清空数据
      this.attrIdAndAttrName = "";
    },
    // 添加按钮的回调
    addSaleAttrValue(row) {
      // 点击销售属性值当中添加按钮的时候，需要有button变为input，通过当前的销售属性的inputVisible控制
      // 挂在在销售属性身上的响应式数据inputVisible，控制button与input的切换
      this.$set(row, "inputVisible", true);
      // 通过响应式数据inputValue字段收集新增的销售属性值            //个人注释：对于收集表单数据可以收集到自身对象上，这样就可以不用在定义变量，当然也可以收集到新变量上，将来带给服务器即可
      this.$set(row, "inputValue", "");
    },
    // 保存按钮的回调
    async addOrUpdateSpu() {
      // 整理参数:需要整理照片墙的参数
      // 携带参数：对于图片，需要携带的imgUrl与imgName字段
      this.spu.spuImageList = this.spuImageList.map((item) => {
        return {
          /*     这里存在一个问题：
          这里教学视频中写错了，应该是imgUrl与imgName  但是后端还不够严谨就连这个属性没有都可以返回状态码200
           ？？？ 思考一下这里数据不正常请求回来之后是如何显示的，img标签是无法显示还是可以显示
           这里出现无法显示主要是路径不对（应该使用imgUrl和imgName来存储路径与名称，但是写错成imageUrl与imageName这个就会导致服务器端校验不严格出现数据丢失问题）
            服务器存储数据也应该是读取对象身上的关键字来存取，这里为imageName与imageUrl所以就导致了数据丢失    
           */
          // imageName: item.name,
          // imageUrl: (item.response && item.response.data) || item.url,
          imgName:item.name,
          imgUrl:(item.response&&item.response.data)||item.url    
        };
      });
      let result;
      try {
        result = await this.$API.spu.reqAddOrUpdate(this.spu);
        if (result.code == 200) {
          this.$message({ type: "success", message: "保存成功" });
          this.$emit("changeScene", {
            scene: 0,
            flag: this.spu.id ? "修改" : "添加",
          });
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
      /*      思考？？？？
        个人调试部分：这里只携带了id过去后端还不能校验出有问题，直接返回了200，后端接口不够严谨
     try {
          result = await this.$API.spu.reqAddOrUpdate({id:679,category3Id:5});
          if (result.code == 200) {
            this.$message({ type: "success", message: "保存成功" });
            // this.$emit('changeScene');
          }
      } catch (error) {
        console.log("error :>> ", error);
      } 
      
      */
      // Object.assign:es6中新增的方法可以合并对象
      // 组件实例this._data，可以操作data中的响应式数据
      // this.$options.data():可以获取配置对象，配置对象的data函数执行，返回的响应式数据为空
      Object.assign(this._data, this.$options.data());
    },
    // 点击添加SPU按钮的时候，发请求的函数
    async addSpuData(category3Id) {
      // 添加SPU的时候收集三级分类的id
      this.spu.category3Id = category3Id;
      let tradeMarkResult;
      let baseSaleAttrResult;
      // 获取品牌信息
      try {
        tradeMarkResult = await this.$API.spu.reqTradeMarkList();
        if (tradeMarkResult.code == 200) {
          this.tradeMarkList = tradeMarkResult.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
      // 获取平台的全部销售属性
      try {
        baseSaleAttrResult = await this.$API.spu.reqBaseSaleAttrList();
        if (baseSaleAttrResult.code == 200) {
          this.saleAttrList = baseSaleAttrResult.data;
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    },
    // 取消按钮的回调
    cancelFun() {
      // 取消按钮的回调，通知父亲切换场景为0
      this.$emit("changeScene", { scene: 0, flag: "" });
      // 清理数据
      // 这里数据太多了一个一个清楚太麻烦了，最好就是使用Object.assign
      // Object.assign:es6中新增的方法可以合并对象
      // 组件实例this._data，可以操作data中的响应式数据
      // this.$options.data():可以获取配置对象，配置对象的data函数执行，返回的响应式数据为空
      /*  个人注释：options是初始化时的配置对象，因为这里时函数调用的方式所以返回的值还是最开始初始化时的值，
        函数调用每次都是返回一个新的数据对象，并不是组件中之前做了数据劫持的那个对象了
        如果使用的是对象式的形式则$options.data()中的数据会随之改变因为做了数据劫持
        然而，对象式在组件中会出现报错所以不存在这种情况，但是在html页面中引入vue的形式
        使用$options.data()如果是对象式则数据会跟着变化
        
      */
      // console.log(this.$options.data());    
      //个人注释：在vue中讲解尽量不要直接操作_data，但是这里是最后置空这样操作比较快，而且没有造成响应式丢失
      Object.assign(this._data, this.$options.data());
    },
  },
  computed: {
    // 计算出还未选择的销售属性
    unSelectSaleAttr() {
      // 整个平台销售属性总共有三个 ----saleAttrList
      // 当前spu拥有的属于自己的销售属性spu.spuSaleAttrList
      return this.saleAttrList.filter((item) => {
        return this.spu.spuSaleAttrList.every((item1) => {
          item.name != item1.saleAttrName;
        });
      });
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>