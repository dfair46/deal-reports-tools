// 对 originalData 归组归类
// allLevel 需要归多少级   
// levelKey 每一级归类的key，按传入数组内的顺序进行多级归类
// params : { originalData: any[], levelKey: string[], allLevel:number ,currentLevel?: number}
export function getLevelExportData(params) {
  let currentLevel = params?.currentLevel || 0
  let newDataList:any[] = []
  const currentKey = params.levelKey[currentLevel]
  params.originalData.map(item => {
    // 默认所有级的默认等级是-1
    item.groupLevel = -1
    // 默认取key的值作为group级的标题
    item.exportTitle = item[currentKey] || ''
    let pushData = null
    // 如果没有添加过
    if(!newDataList.find(newDataItem => newDataItem[currentKey] === item[currentKey])){
      pushData = {...item, groupLevel: currentLevel, child: [item]}
      newDataList.push(pushData)
    } else if(newDataList.find(newDataItem => newDataItem[currentKey] === item[currentKey])){
      // 把所有1级的子项添加进去
      newDataList.find(newDataItem => newDataItem[currentKey] === item[currentKey]).child.push(item)
    }
  })
  // 如果需要归2级或更多
  if(params.allLevel - 1 !== currentLevel){
    newDataList = newDataList.map(item => {
      const loopParams = {originalData: item.child, levelKey: params.levelKey, allLevel:params.allLevel ,currentLevel: currentLevel+1}
      item.child = getLevelExportData(loopParams)
      return item
    })
  }
  return newDataList
}

// 根据归类展开，展开成一维数组
// allLevel 需要归多少级 
// levelKey 每一级归类的key
// params : { originalData: any[], levelKey: string[], allLevel:number ,currentLevel?: number}
export function getOnlyLevelExportData(params) {
  let currentLevel = params?.currentLevel || 0
  let newDataList:any[] = []
  const currentKey = params.levelKey[currentLevel]
  params.originalData.map(item => {
    if(currentLevel === item.groupLevel && !newDataList.find(newDataItem => newDataItem[currentKey] === item[currentKey]) && item.groupLevel !== -1){
      newDataList.push(item)
    }else if(item.groupLevel === -1){
      newDataList.push(item)
    }
    if(params.allLevel !== currentLevel){
      const loopParams = {originalData: item.child, levelKey: params.levelKey, allLevel:params.allLevel ,currentLevel: currentLevel+1}
      let concatList =  getOnlyLevelExportData(loopParams)
      newDataList = newDataList.concat(concatList)
    }
  })
  return newDataList
}

// 对归类后的数据originalData 在内部对每一项进行方法调用
//  titleKey 每一级的title  
//  emptyFn 对每一项做清空属性前置的函数
//  summaryCalcFn  对汇总后的group级进行处理的函数 
//  itemCalcFn  对每一项的处理
// params :  { originalData: any[], titleKey: string[], emptyFn: Function, summaryCalcFn: Function, itemCalcFn: Function }
export function getSummaryList(originalData: any[], titleKey: string[], emptyFn: Function, summaryCalcFn: Function, itemCalcFn: Function ){
  const titleKey = params.titleKey
  let summaryData:any = {}
  const newArr = params.originalData.map((item: any) => {
   if(item.groupLevel !== -1 && item.child){
     item.exportTitle = item[titleKey[item.groupLevel]]
     const loopParams = { originalData: item.child, titleKey, emptyFn: params.emptyFn, summaryCalcFn: params.summaryCalcFn, itemCalcFn: params.itemCalcFn }
     const childRes = getSummaryList(loopParams)
     item = params.emptyFn(item)
     item = params.itemCalcFn(item)
     item = {
       ...item,
       ...childRes.summaryData,
       child: childRes.list
     }
    }else{
     // 最后一级
     const titleKeyLength = titleKey.length
     item.exportTitle = item[titleKey[titleKeyLength - 1]]
     item = params.itemCalcFn(item)
   }
    summaryData = params.summaryCalcFn(item, summaryData)
    return item
  })
  return {list: newArr, summaryData}
}
