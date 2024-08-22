import { useAtom } from "jotai";
import { useRef, useState, useEffect } from "react";
import { CanvasBumpAtom, SourceCanvasAtom } from "./atoms";
import { bytesToHumanReadable } from "./utils";
import { processLayer } from "./Processing";

export function SplitCanvas() {
  const [sourceCanvas] = useAtom(SourceCanvasAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [renderBump] = useAtom(CanvasBumpAtom);

  useEffect(() => {
    if (!sourceCanvas) return;
    const canvas = canvasRef.current!;
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const stx = sourceCanvas.getContext("2d")!;
    processLayer(sourceCanvas, canvas, 2);
    stx.drawImage(canvas, 0, 0);
    processLayer(sourceCanvas, canvas, 4);
    stx.drawImage(canvas, 0, 0);
    processLayer(sourceCanvas, canvas, 8);
    stx.drawImage(canvas, 0, 0);
    processLayer(sourceCanvas, canvas, 16);
    stx.drawImage(canvas, 0, 0);
    processLayer(sourceCanvas, canvas, 32);
    stx.drawImage(canvas, 0, 0);
    processLayer(sourceCanvas, canvas, 64);
    stx.drawImage(canvas, 0, 0);
  }, [renderBump, sourceCanvas]);

  return (
    <div className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 w-full h-full object-contain"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="hidden">
        <div>
          {width}x{height}, {bytesToHumanReadable(fileSize ?? 0)}
        </div>
      </div>
    </div>
  );
}
