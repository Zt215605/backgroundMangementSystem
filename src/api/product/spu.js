import request from '@/utils/request';

// 获取SPU列表数据的接口
//   /admin/product/{page}/{limit}     get    page  limit  category3Id

export const reqSpuList = (page, limit, category3Id) => request({ url: `/admin/product/${page}/${limit}`, method: 'get', params: { category3Id } });


//   获取spu信息
//   /admin/product/getSpuById/{spuId}  get
export const reqSpu = (spuId) => request({ url: `/admin/product/getSpuById/${spuId}`, method: 'get' });

// 获取品牌信息
//   /admin/product/baseTrademark/getTrademarkList  get
export const reqTradeMarkList = () => request({ url: `/admin/product/baseTrademark/getTrademarkList`, method: 'get' });

// 获取spu图片信息
//   /admin/product/spuImageList/{spuId}  get
export const reqSpuImageList = (spuId) => request({ url: `/admin/product/spuImageList/${spuId}`, method: 'get' });

// 获取平台全部销售属性   ---整个平台销售属性一共三个   无需携带参数
//    /admin/product/baseSaleAttrList   get 

export const reqBaseSaleAttrList = () => request({ url: `/admin/product/baseSaleAttrList`, method: 'get' });

// 修改spu|添加spu  对于修改或者是添加携带给服务器的数据大致一样，唯一区别就是携带的参数是否携带d

export const reqAddOrUpdate = (spuInfo) => {
    if (spuInfo.id) {
        // 携带的参数带有id
        return request({ url: '/admin/product/updateSpuInfo', method: 'post', data: spuInfo });
    } else {
        // 携带的参数没有id
        return request({ url: '/admin/product/updateSpuInfo', method: 'post', data: spuInfo });
    }
}


// 删除Spu
//   /admin/product/deleteSpu/{spuId}
export const reqDeleteSpu=(spuId)=>request({url:`/admin/product/deleteSpu/${spuId}`,mtehod:'delete'});

/*   
    上面写了这个接口
// 获取图片数据
//   /admin/product/spuImageList/{spuId}  get
export const reqSpuImageList = (spuId) => request({ url: `/admin/product/spuImageList/${spuId}`, method: 'get' });
 */
// 获取销售属性列表
//   /admin/product/spuSaleAttrList/{spuId}  get
export const reqSpuSaleAttrList = (spuId) => request({ url: `/admin/product/spuSaleAttrList/${spuId}`, method: 'get' });

// 获取平台属性的数据
//    /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}  get
export const reqAttrInfoList = (category1Id, category2Id, category3Id) => request({ url: `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`, method: 'get' });

// 添加sku
//   /admin/product/saveSkuInfo  post
export const reqAddSku=(skuInfo)=>request({url:`/admin/product/saveSkuInfo`,method:'post',data:skuInfo});



