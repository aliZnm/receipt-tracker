// preprocessImage.js
export default function preprocessImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // upscale improves OCR
      canvas.width = img.width * 1.6;
      canvas.height = img.height * 1.6;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // grayscale conversion
      let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

        // enhance contrast
        avg = avg > 130 ? 255 : 0;

        data[i] = data[i + 1] = data[i + 2] = avg;
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => resolve(blob), "image/png");
    };
  });
}
