// 自动化统一收集模块下的store
interface storeModule {
    [key: string]: any;
}
type globalStoreModules = Record<string, { default: storeModule }>;
// 通过vite的Glob导入文件模块的内容
const storeModules: globalStoreModules = import.meta.glob('../pages/**/store.ts', {
    eager: true
})

// 将传入的字符串的首字母大写返回
function upper(str:string):string{
    const [first,...reset]=str
    return first.toUpperCase()+reset.join('')
}
// 记录仓库的usexxxStore名为usexxxStore钩子函数的映射
const modules:storeModule={}
for (const path in storeModules) {
    const storeFunction=storeModules[path].default    
    const storeName=`use${upper(storeFunction.$id)}Store`
    modules[storeName]=storeFunction
}
export default modules
// 将所有store在pinia中注册
export function initializeStores() {
    for(let key in modules){
        const storeFunction=modules[key]
        storeFunction()
    }
}