<template>
  <div>
    <el-form ref="form" label-width="80px">
      <!-- 写了label-width之后以后就el-form-item就可以不用写width="80"，会自动继承 -->
      <el-form-item label="Spu名称">
        <el-input placeholder="Spu名称"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" value="12">
          <el-option label="label" value="value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Spu描述">
        <el-input type="textarea" rows="4" placeholder="描述"></el-input>
      </el-form-item>
      <el-form-item label="Spu图片">
        <el-upload
          action="https://jsonplaceholder.typicode.com/posts/"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select placeholder="还有3未选择" value="11">
          <el-option value="1"> </el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>
        <el-table border style="width: 100%">
          <el-table-column type="index" align="center" label="序号" width="80">
          </el-table-column>
          <el-table-column prop="prop" label="属性名" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">保存</el-button>
        <el-button @click="$emit('changeScene', 0)">取消</el-button>
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
      spu: {}, //存储SPU信息属性
      tradeMarkList: [], //存储品牌信息
      spuImageList: [], //存储spu图片的数据
      saleAttrList: [],
    };
  },
  methods: {
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    // 初始化SpuForm数据
    async initSpuData(spu) {
      let spuResult;
      let tradeMarkResult;
      let spuImageResult;
      let baseSaleAttrResult;
      // 获取spu信息
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
      // 获取spu的数据
      try {
        spuImageResult = await this.$API.spu.reqSpuImageList(spu.id);
        if (spuImageResult.code == 200) {
          this.spuImageList = spuImageResult.data;
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
  },
};
</script>

<style scoped>
</style>