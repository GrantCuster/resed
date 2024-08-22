export function processLayer(
  sourceCanvas: HTMLCanvasElement,
  destinationCanvas: HTMLCanvasElement,
  cellSize: number,
) {
  const stx = sourceCanvas.getContext("2d")!;
  const dtx = destinationCanvas.getContext("2d")!;
  const imageWidth = sourceCanvas.width;
  const imageHeight = sourceCanvas.height;
  destinationCanvas.width = imageWidth;
  destinationCanvas.height = imageHeight;
  let rows = Math.ceil(sourceCanvas.height / cellSize);
  let cols = Math.ceil(sourceCanvas.width / cellSize);

  console.log("rows", rows);
  console.log("cols", cols);

  const imageDataContainer = stx.getImageData(0, 0, imageWidth, imageHeight);

  const divider = 8;
  const bufferCanvas = document.createElement("canvas");
  bufferCanvas.width = imageWidth / divider;
  bufferCanvas.height = imageHeight / divider;
  const btx = bufferCanvas.getContext("2d")!;
  btx.drawImage(
    sourceCanvas,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    0,
    imageWidth / divider,
    imageHeight / divider,
  );

  const xOffset = 0;
  const yOffset = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let count = 0;
      for (let r = 0; r < cellSize; r++) {
        const actualY = row * cellSize + r - yOffset;
        const rowCheck = actualY >= 0 && actualY < imageHeight;
        for (let c = 0; c < cellSize; c++) {
          const actualX = col * cellSize + c - xOffset;
          const colCheck = actualX >= 0 && actualX < imageWidth;
          if (rowCheck && colCheck) {
            const idx = (actualY * imageWidth + actualX) * 4;
            totalR += imageDataContainer.data[idx];
            totalG += imageDataContainer.data[idx + 1];
            totalB += imageDataContainer.data[idx + 2];
            count++;
          }
        }
      }
      const avgR = totalR / count;
      const avgG = totalG / count;
      const avgB = totalB / count;
      let drawIt = false;
      {
        let lossR = 0;
        let lossG = 0;
        let lossB = 0;
        let count = 0;
        for (let r = 0; r < cellSize; r++) {
          const actualY = row * cellSize + r - yOffset;
          const rowCheck = actualY >= 0 && actualY < imageHeight;
          for (let c = 0; c < cellSize; c++) {
            const actualX = col * cellSize + c - xOffset;
            const colCheck = actualX >= 0 && actualX < imageWidth;
            if (rowCheck && colCheck) {
              const idx = (actualY * imageWidth + actualX) * 4;
              lossR += Math.abs(imageDataContainer.data[idx] - avgR);
              lossG += Math.abs(imageDataContainer.data[idx + 1] - avgG);
              lossB += Math.abs(imageDataContainer.data[idx + 2] - avgB);
              count++;
            }
          }
        }
        const avgLossR = lossR / count;
        const avgLossG = lossG / count;
        const avgLossB = lossB / count;
        if ((avgLossR + avgLossG + avgLossB) / 3 > 12) {
          drawIt = true;
        }
      }
      if (drawIt) {
        dtx.imageSmoothingEnabled = false;
        dtx.drawImage(
          sourceCanvas,
          col * cellSize - xOffset,
          row * cellSize - yOffset,
          cellSize,
          cellSize,
          col * cellSize,
          row * cellSize,
          cellSize,
          cellSize,
        );
      } else {
        dtx.fillStyle = `rgb(${avgR}, ${avgG}, ${avgB})`;
        dtx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }

    }
  }
}
