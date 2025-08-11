/**
 * 获取指定区间间的随机数
 * @param min 区间左端点
 * @param max 区间右端点
 * @returns 指定区间间的随机数
 */
const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min)) + min
}

/**
 * 判断对象是否为空对象
 * @param obj 对象
 * @returns 传入的对象是否为空对象
 */
const isEmptyObject = (obj: object): boolean => {
    return JSON.stringify(obj) === '{}'
}

/**
 * 防抖函数
 * @param func 需要防抖处理的函数
 * @param delay 延迟时间
 * @returns 经过防抖处理后的函数 
 * <T extends (...args: any[]) => any>泛型定义用于约束传递的函数参数：T是接收任意参数，返回任意类型的函数
 * Parameters<T>，提取函数类型的参数类型
 * (...args: Parameters<T>) => void表示该防抖函数的返回值
 * ThisParameterType<T>提取函数T的this上下文类型
 */
const debounc = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void => {
    let timer: number | null = null
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}
