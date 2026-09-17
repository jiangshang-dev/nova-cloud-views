import CryptoJS from 'crypto-js';
import { initUpload, uploadChunk, mergeUpload, type FileInfo, type UploadInitResult } from '/@/api/nova/file';

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

export interface ChunkUploadOptions {
  file: File;
  chunkSize?: number;
  bizType?: string;
  bizId?: string;
  /** 并发分片数 */
  concurrency?: number;
  onProgress?: (percent: number, uploaded: number, total: number) => void;
  onStatus?: (text: string) => void;
}

function arrayBufferToWordArray(buffer: ArrayBuffer) {
  const u8 = new Uint8Array(buffer);
  const words: number[] = [];
  for (let i = 0; i < u8.length; i += 4) {
    words.push(
      (u8[i] << 24) |
        ((u8[i + 1] || 0) << 16) |
        ((u8[i + 2] || 0) << 8) |
        (u8[i + 3] || 0)
    );
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
}

/** 分片计算整文件 MD5（用于秒传 / 断点） */
export async function calcFileMd5(file: File, chunkSize = DEFAULT_CHUNK_SIZE): Promise<string> {
  const algo = CryptoJS.algo.MD5.create();
  let offset = 0;
  while (offset < file.size) {
    const blob = file.slice(offset, Math.min(offset + chunkSize, file.size));
    const buf = await blob.arrayBuffer();
    algo.update(arrayBufferToWordArray(buf));
    offset += chunkSize;
  }
  return algo.finalize().toString();
}

async function calcBlobMd5(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  return CryptoJS.MD5(arrayBufferToWordArray(buf)).toString();
}

/**
 * 前端分块 → 后端上传/合并；支持秒传与断点续传。
 */
export async function chunkUpload(options: ChunkUploadOptions): Promise<FileInfo> {
  const {
    file,
    chunkSize = DEFAULT_CHUNK_SIZE,
    bizType,
    bizId,
    concurrency = 1,
    onProgress,
    onStatus,
  } = options;

  onStatus?.('计算文件指纹…');
  const fileMd5 = await calcFileMd5(file, chunkSize);

  // 历史失败会话可能残留 size=0 的分片，续传会跳过真实上传；换文件或清掉上传中记录更稳
  onStatus?.('初始化上传…');
  const init: UploadInitResult = await initUpload({
    fileName: file.name,
    fileMd5,
    fileSize: file.size,
    chunkSize,
    contentType: file.type || 'application/octet-stream',
    bizType,
    bizId,
  });

  if (!init.skipUpload && !init.uploadId) {
    throw new Error('初始化上传失败：未返回 uploadId');
  }

  if (init.skipUpload) {
    onProgress?.(100, 1, 1);
    onStatus?.('秒传成功');
    return {
      id: init.fileId!,
      fileName: file.name,
      fileSize: file.size,
      accessUrl: init.accessUrl,
      objectKey: init.objectKey,
      uploadStatus: 1,
    };
  }

  const uploaded = new Set(init.uploadedChunks || []);
  const total = Number(init.chunkTotal);
  const size = Number(init.chunkSize || chunkSize);
  if (!total || !size) {
    throw new Error('初始化上传失败：分片参数无效');
  }
  let done = uploaded.size;
  onProgress?.(Math.floor((done / total) * 100), done, total);
  onStatus?.(`上传分片 ${done}/${total}`);

  const pending: number[] = [];
  for (let i = 0; i < total; i++) {
    if (!uploaded.has(i)) pending.push(i);
  }

  let cursor = 0;
  async function worker() {
    while (cursor < pending.length) {
      const index = pending[cursor++];
      const start = index * size;
      const end = Math.min(start + size, file.size);
      const blob = file.slice(start, end);
      const chunkMd5 = await calcBlobMd5(blob);
      const form = new FormData();
      form.append('uploadId', init.uploadId!);
      form.append('chunkIndex', String(index));
      form.append('chunkMd5', chunkMd5);
      form.append('file', blob, `${file.name}.part${index}`);
      await uploadChunk(form);
      done += 1;
      onProgress?.(Math.floor((done / total) * 100), done, total);
      onStatus?.(`上传分片 ${done}/${total}`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(pending.length, 1)) }, () => worker()));

  onStatus?.('合并分片…');
  const info = await mergeUpload(init.uploadId!);
  onProgress?.(100, total, total);
  onStatus?.('上传完成');
  return info;
}
