// 自定义pinia
// 统一收集模块的store + 使用持久化插件
import { createPinia } from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import pageStore, { initializeStores } from "./core";

const pinia = createPinia()
// 使用持久化插件
pinia.use(piniaPluginPersistedstate)
// 初始化所有模块下的store，确保它们被注册
setTimeout(() => {
    initializeStores()
}, 0)

export { pinia, pageStore }
