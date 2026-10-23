export const CV_BUCKET = "cvs";
export const CV_FILENAME = "cv.pdf";
export const CV_MAX_SIZE = 4 * 1024 * 1024;

export async function validateCv(file: File): Promise<string | null> {
  if (!file.size || file.size > CV_MAX_SIZE) return "Chọn tệp PDF có dung lượng tối đa 4 MB.";
  if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) {
    return "CV phải là tệp PDF.";
  }
  if (await file.slice(0, 5).text() !== "%PDF-") return "Nội dung tệp không phải PDF hợp lệ.";
  return null;
}
