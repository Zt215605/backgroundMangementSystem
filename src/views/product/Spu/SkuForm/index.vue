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
        <el-table
          border
          style="width: 100%"
          :data="spuImageList"
          @select-change="handleSelectionChange"
        >
          <el-table-column prop="prop" width="80" type="selection">
          </el-table-column>
          <el-table-column prop="prop" label="图片" width="width">
            <template slot-scope="{ row, $index }">
              <img :src="row.imgUrl" alt="" style="width: 200px" />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template v-slot="{ row, $index }">
              <el-button
                type="primary"
                v-if="row.isDefault == 0"
                @click="changeDefault(row)"
                >设置默认</el-button
              >
              <!-- 个人写法（传递索引来修改） -->
              <!-- <el-button type="primary" v-if="row.isDefault==0" @click="changeDefault($index)">设置默认</el-button> -->
              <el-button v-else>默认</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="label">
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
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
      // 收集图片的数据字段  需要注意的是：收集的数据目前缺少isDefault字段，将来提交给服务器数据的时候，需要整理参数
      imageList: [],
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
        result1 = await this.$API.spu.reqSpuImageList(spu.id);
        if (result1.code == 200) {
          // 服务器返回的数据没有isDefault字段，这个字段用来控制哪一个时默认设置，手动添加上
          let list = result1.data;
          list.forEach((item) => {
            item.isDefault = 0;
          });
          this.spuImageList = list;
        }
        //获取销售属性的数据
        result2 = await this.$API.spu.reqSpuSaleAttrList(spu.id);
        if (result2.code == 200) {
          this.spuSaleAttrList = result2.data;
        }
        // 获取平台属性的数据
        result3 = await this.$API.spu.reqAttrInfoList(
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
    // table表格复选框按钮的事件
    handleSelectionChange(params) {
      // 获取到用户选中图片的信息数据，当前手机的数据缺少isDefault字段
      this.imageList = params;
    },
    // 修改默认的回调
    changeDefault(row) {
      // 图片列表的数据isDefault字段变为0
      this.spuImageList.forEach((item) => {
        item.isDefault = 0;
      });
      // 点击的变为1
      row.isDefault = 1;
      // 收集默认图片地址
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    // 个人写法（通过传递索引来修改）：
    // changeDefault(index){
    //   // 图片列表的数据isDefault字段变为0
    //   this.spuImageList.forEach(item=>{
    //     item.isDefault=0;
    //   });
    //   // 点击的变为1
    //   this.spuImageList[index].isDefault=1;
    // 收集默认图片地址
    //    this.skuInfo.skuDefaultImg=this.spuImageList[index].imgUrl;
    // }
    // 取消按钮事件回调
    cancel() {
      // 让父组件切换场景
      this.$emit("changeScenes", 0);
      // 清除数据
      Object.assign(this._data, this.$options.data());
    },
    // 保存事件的回调
    async save() {
      // 整理参数
      // 整理平台属性
      const { attrInfoList, skuInfo, spuSaleAttrList, imageList } = this;
      /* 
        // 整理平台属性的数据方式一：
        let arr=[];
        // 把收集到的数据先整理一下
        attrInfoList.forEach(item=>{
          // 当前平台属性用户进行了选择
          if(item.attrIdAndValueId){
            const [attrId,valueId]=item.attrIdAndValueId.split(":");
            // 携带给服务器的参数应该是一个对象
            let obj={valueId,attrId};
            arr.push(obj);
          }
        });
        // 将整理好的参数赋值给skuInfo.skuAttrValueList
        skuInfo.skuAttrValueList=arr; 
      */
      //  方式二 这种用法要求对reduce熟练
      let result = attrInfoList.reduce((prev, item) => {
        if (item.attrIdAndValueId) {
          const [attrId, valueId] = item.attrIdAndValueId.split(":");
          prev.push({ attrId, valueId });
        }
        return prev;
      }, []);
      skuInfo.skuAttrValueList = result;
      // 整理销售属性
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, item) => {
        if (item.attrIdAndValueId) {
          const [saleAttrId, saleAttrValueId] =
            item.attrIdAndValueId.split(":");
          prev.push({ saleAttrId, saleAttrValueId });
        }
        return prev;
      }, []);
      // 整理图片数据
      skuInfo.skuImageList = imageList.map((item) => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          isDefault: item.isDefault,
          spuImgId: item.id,
        };
      });
      // 发请求
      try {
        let res = await this.$API.spu.reqAddSku(skuInfo);
        if (res.code == 200) {
          this.$message({ type: "success", message: "添加sku成功" });
          this.$emit("changeScenes", 0);
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
      /* 个人注释：这里出现了一个测试错误是因为后端校验导致，这里重量这个数据不添加默认值后端无法通过
      （此处前端没有做表单验证所以难以发现问题） */
      // 个人注释：这里老师没有清理数据自己做一下
    },
  },
};
</script>

<style scoped>
</style>