import { useAtom } from "jotai";
import {
  CanvasBumpAtom,
  LayerIdsAtom,
  LayerMapAtom,
  LayerType,
  RenderBumpAtom,
  SourceCanvasAtom,
} from "./atoms";
import { useEffect, useRef } from "react";
import { processLayer } from "./Processing";
import { v4 as uuid } from "uuid";

export function Layers() {
  const [layerIds] = useAtom(LayerIdsAtom);

  return (
    <div className="border-l border-white overflow-auto h-full">
      {layerIds.map((id) => (
        <Layer key={id} id={id} />
      ))}
      <AddLayer />
    </div>
  );
}

export function AddLayer() {
  const [, setLayerIds] = useAtom(LayerIdsAtom);
  const [, setLayerMap] = useAtom(LayerMapAtom);

  function addLayer() {
    const id = uuid();
    setLayerIds((prev) => [...prev, id]);
    setLayerMap((prev) => ({
      ...prev,
      [id]: {
        id,
        cellSize: 64,
        canvas: document.createElement("canvas"),
        offsetX: null,
        offsetY: null,
        rgbLessThan: 255,
        rgbMoreThan: 0,
      },
    }));
  }

  return <button onClick={addLayer}>Add Layer</button>;
}

export function Layer({ id }: { id: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [layerMap, setLayerMap] = useAtom(LayerMapAtom);
  const [sourceCanvas] = useAtom(SourceCanvasAtom);
  const [canvasBump] = useAtom(CanvasBumpAtom);
  const [, setRenderBump] = useAtom(RenderBumpAtom);

  const layer = layerMap[id];

  function updateLayer(updates: Partial<LayerType>) {
    setLayerMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates,
      },
    }));
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (canvas) {
      processLayer(
        sourceCanvas,
        layer.canvas,
        layer.cellSize,
        layer.offsetX,
        layer.offsetY,
        layer.rgbLessThan,
        layer.rgbMoreThan,
      );

      const ctx = canvas.getContext("2d")!;
      canvas.width = sourceCanvas.width;
      canvas.height = sourceCanvas.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(layer.canvas, 0, 0);
    }
    setTimeout(() => {
      setRenderBump((prev) => prev + 1);
    }, 200);
  }, [layer, sourceCanvas, canvasBump]);

  const activeOffsetX = layer.offsetX !== null;
  const activeOffsetY = layer.offsetY !== null;

  const rows =
    Math.round(Math.ceil(sourceCanvas.height / layer.cellSize) / 2) * 2;
  const cols =
    Math.round(Math.ceil(sourceCanvas.width / layer.cellSize) / 2) * 2;
  const autoOffsetX = Math.floor(
    (cols * layer.cellSize - sourceCanvas.width) / 2,
  );
  const autoOffsetY = Math.floor(
    (rows * layer.cellSize - sourceCanvas.height) / 2,
  );

  return layer ? (
    <div className="border-b border-white">
      <canvas className="max-w-full" ref={canvasRef} />
      <div className="flex items-center gap-1">
        <div>Size</div>
        <input
          type="range"
          min="0"
          step="2"
          max={canvasRef.current?.width}
          value={layer.cellSize}
          onChange={(e) => updateLayer({ cellSize: parseInt(e.target.value) })}
        />
        <div>{layer.cellSize}</div>
      </div>
      <div>Columns {cols}</div>
      <div>Rows {rows}</div>
      <div className="flex items-center gap-1">
        <div>Offset x</div>
        <input
          type="checkbox"
          checked={activeOffsetX}
          onChange={(e) =>
            updateLayer({ offsetX: e.target.checked ? autoOffsetX : null })
          }
        />
        {activeOffsetX ? (
          <div className="flex gap-1">
            <input
              type="range"
              min="0"
              max={layer.cellSize}
              value={layer.offsetX as number}
              onChange={(e) =>
                updateLayer({ offsetX: parseInt(e.target.value) })
              }
            />
            <div>{layer.offsetX}</div>
          </div>
        ) : (
          <div>auto {autoOffsetX}</div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <div>Offset y</div>
        <input
          type="checkbox"
          checked={activeOffsetY}
          onChange={(e) =>
            updateLayer({ offsetY: e.target.checked ? autoOffsetY : null })
          }
        />
        {activeOffsetY ? (
          <div className="flex gap-1">
            <input
              type="range"
              min="0"
              max={layer.cellSize}
              value={layer.offsetY as number}
              onChange={(e) =>
                updateLayer({ offsetY: parseInt(e.target.value) })
              }
            />
            <div>{layer.offsetY}</div>
          </div>
        ) : (
          <div>auto {autoOffsetY}</div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <div>Less</div>
        <div className="flex gap-1">
          <input
            type="range"
            min="0"
            max="255"
            value={layer.rgbLessThan as number}
            onChange={(e) =>
              updateLayer({ rgbLessThan: parseInt(e.target.value) })
            }
          />
          <div>{layer.rgbLessThan}</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div>More</div>
        <div className="flex gap-1">
          <input
            type="range"
            min="0"
            max="255"
            value={layer.rgbMoreThan as number}
            onChange={(e) =>
              updateLayer({ rgbMoreThan: parseInt(e.target.value) })
            }
          />
          <div>{layer.rgbMoreThan}</div>
        </div>
      </div>
    </div>
  ) : null;
}
