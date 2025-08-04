import { http } from "@/common/request";

export const lessonApi = {
    // 获取课程详情
    getLessonDetail: (data:any) => http.post('/app/course/mcourse/main/detail', data, { showLoading: true })
}