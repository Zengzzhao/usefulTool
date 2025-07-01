// 扩展UniApp的RequsetTask接口
declare namespace UniApp{
    interface RequestTask{
        onChunkReceived(callback:(res:any)=>void):void;
        offChunkReceived(callback:(res:any)=>void):void;
    }
}