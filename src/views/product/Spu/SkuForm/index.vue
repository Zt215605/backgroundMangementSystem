<template>
  <div>
    <el-form ref="form" label-width="80px">
      <el-form-item label="SPU名称"> {{ spu.spuName }} </el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="sku名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input
          placeholder="价格(元)"
          type="number"
          v-model="skuInfo.price"
        ></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input placeholder="重量(千克)" v-model="skuInfo.weight"></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input type="textarea" rows="4" v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form :inline="true" ref="form" label-width="80px">
          <el-form-item
            :label="attr.attrName"
            v-for="(attr, index) in attrInfoList"
            :key="attr.id"
          >
            <el-select
              value="1"
              placeholder="请选择"
              v-model="attr.attrIdAndValueId"
            >
              <el-option
                :label="attrValue.valueName"
                :value="`${attr.id}:${attrValue.id}`"
                v-for="(attrValue, index) in attr.attrValueList"
                :key="attrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form :inline="true" ref="form1" label-width="80px">
          <el-form-item
            :label="saleAttr.saleAttrName"
            v-for="(saleAttr, index) in spuSaleAttrList"
            :key="saleAttr.id"
          >
            <el-select v-model="saleAttr.attrIdAndValueId" placeholder="请选择">
              <el-option
                :value="`${saleAttr.id}:${saleAttrValue.id}`"
                :label="saleAttrValue.saleAttrValueName"
                v-for="(saleAttrValue, index) in saleAttr.spuSaleAttrValueList"
                :key="saleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table border style="width: 100%">
          <el-table-column
            prop="prop"
            label="label"
            width="80"
            type="selection"
          >
          </el-table-column>
          <el-table-column prop="prop" label="图片" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="名称" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="label">
        <el-button type="primary">保存</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      // 存储图片的信息
      spuImageList: [],
      // 存储销售属性数据
      spuSaleAttrList: [],
      //存储平台属性的数据
      attrInfoList: [],
      // 收集sku数据的字段
      // 第一类收集的数据：父组件给的数据
      skuInfo: {
        category3Id: 0,
        spuId: 0,
        tmId: 0,
        // 第二类：通过数据双向绑定
        skuName: "",
        price: 0,
        weight: "",
        skuDesc: "",

        // 第三类:写代码去收集     //个人注释：这里收集完成了在发请求之前还要整理数据
        // 默认图片
        skuDefaultImg: "",
        // 收集图片的字段
        skuImageList: [
          // {
          //   id:0,
          //   imgName:'',
          //   imgUrl:'',
          //   isDefault:'',
          //   skuId:0,
          //   spuImgId:0,
          // },
        ],
        // 平台属性
        skuAttrValueList: [
          // {
          //   attrId:0,
          //   attrName:'',
          //   id:0,
          //   skuId:0,
          //   valueId:0,
          //   valueName:'',
          // },
        ],
        // 销售属性
        skuSaleAttrValueList: [
          // {
          //   id:0,
          //   saleAttrId:0,
          //   saleAttrName:'',
          //   saleAttrValueId:0,
          //   saleAttrValueName:'',
          //   skuId:0,
          //   spuId:0
          // },
        ],
      },
      spu: {},
    };
  },
  methods: {
    // 获取SkuForm数据
    async getData(category1Id, category2Id, spu) {
      // 收集父组件给予的数据
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.id;
      this.skuInfo.tmId = spu.tmId;
      this.spu = spu;
      let result1;
      let result2;
      let result3;
      try {
        // 获取图片的数据
        result1 = await this.$API.sku.reqSpuImageList(spu.id);
        if (result1.code == 200) {
          this.spuImageList = result1.data;
        }
        //获取销售属性的数据
        result2 = await this.$API.sku.reqSpuSaleAttrList(spu.id);
        if (result2.code == 200) {
          this.spuSaleAttrList = result2.data;
        }
        // 获取平台属性的数据
        result3 = await this.$API.sku.reqAttrInfoList(
          category1Id,
          category2Id,
          spu.category3Id
        );
        if (result3.code == 200) {
          this.attrInfoList = result3.data;
        }
      } catch (error) {
        console.warn("error :>> ", error);
      }
    },
  },
};
</script>

<style scoped>
</style>