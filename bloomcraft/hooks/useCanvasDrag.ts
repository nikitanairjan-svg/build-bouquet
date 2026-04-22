// useCanvasDrag — wraps framer-motion drag constraints for the bouquet canvas
// Returns drag handlers and canvas ref to attach to BouquetCanvas
// TODO: implement with useDragControls + boundary calculations
export function useCanvasDrag() {
  return {
    canvasRef: null,
    onDragEnd: () => {},
  };
}
