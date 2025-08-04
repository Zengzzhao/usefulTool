import { defineStore } from "pinia";
import { lessonApi } from "./api";
import type { mcourseWatchRecord } from "types/lesson";

export default defineStore('lesson', {
    state: () => {
        return {
            lessonInfo:{},
            mcourseWatchRecord:{} as mcourseWatchRecord 
        }
    },
    actions: {
        // 获取课程详情
        getLessonDetail(data: any) {
            return new Promise((resolve, reject) => {
                lessonApi.getLessonDetail(data).then(res => {
                    resolve(res)
                }).catch(err => {
                    reject(err)
                })
            })
        }
    }
})