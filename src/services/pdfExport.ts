import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { AnalysisResult } from '@/types';

export async function exportReportToPDF(
  element: HTMLElement,
  result: AnalysisResult
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: 800,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm', 'a4');
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= 297; // A4 height

  while (heightLeft > 0) {
    position = position - 297;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;
  }

  pdf.save(`BeautyMatch_妆造报告_${result.createdAt.slice(0, 10)}.pdf`);
}

/**
 * 生成分享用的长截图
 */
export async function captureShareImage(element: HTMLElement): Promise<string> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  return canvas.toDataURL('image/png');
}

/**
 * 将分析结果编码到 URL hash 中（用于分享）
 */
export function encodeResultToHash(result: AnalysisResult): string {
  // 只保留必要的、可序列化的数据
  const shareData = {
    fs: result.faceShape,
    es: result.eyeShape,
    ns: result.noseShape,
    ls: result.lipShape,
    st: result.skinTone,
    jl: result.jawline,
    cb: result.cheekbone,
    bd: result.browDistance,
    ph: result.philtrum,
    pr: result.proportions,
    mb: result.matchedBloggers.map((m) => ({
      id: m.blogger.id,
      s: m.similarity,
    })),
    cp: result.compliment,
    dt: result.createdAt,
  };
  return btoa(encodeURIComponent(JSON.stringify(shareData)));
}
