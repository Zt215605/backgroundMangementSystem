// 将四个模块请求的接口函数统一
import * as trademark from './product/tradeMark'
import * as attr from './product/attr'
import * as spu from './product/spu'
import * as sku from './product/sku'

export default{
    trademark,
    attr,
    spu,
    sku
}