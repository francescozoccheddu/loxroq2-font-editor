import { Path, Point } from "./Path"
import style from "./Canvas.module.sass"
import classNames from "classnames"

export type CanvasProps = Readonly<{
  path: Path,
  size: number,
} & ({
  interactive?: false
} | {
  interactive: true,
  gridSize: number,
  onClick(point: Point): void
})>

const viewport = 100

function gen<T>(count: number, generate: (i: number) => T): readonly T[] {
  return Array(count).fill(null).map((_, i) => generate(i))
}

export function Canvas(props: CanvasProps) {

  function w2vb(point: Point): Point {
    return {
      x: point.x * viewport,
      y: (1 - point.y) * viewport,
    }
  }

  return <div
    className={classNames(style.root, props.interactive && style.interactive)}
    style={{
      width: `${props.size}px`,
      height: `${props.size}px`
    }}
    onClick={e => {
      if (props.interactive) {
        const rect = (e.target as HTMLDivElement).getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = 1 - (e.clientY - rect.top) / rect.height
        const quantize = (c: number) => {
          return Math.round(c * (props.gridSize - 1)) / (props.gridSize - 1)
        }
        const qPoint = { x: quantize(x), y: quantize(y) }
        props.onClick(qPoint)
      }
    }}
  >
    <svg viewBox={`0 0 ${viewport} ${viewport}`}>
      {props.interactive && <>
        {gen(props.gridSize, i => {
          const x = i / (props.gridSize - 1)
          const p1 = w2vb({ x, y: 0 }), p2 = w2vb({ x, y: 1 })
          return <line
            key={i}
            x1={p1.x}
            x2={p2.x}
            y1={p1.y}
            y2={p2.y}
            stroke="#eee"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        })}
        {gen(props.gridSize, i => {
          const y = i / (props.gridSize - 1)
          const p1 = w2vb({ x: 0, y }), p2 = w2vb({ x: 1, y })
          return <line
            key={i}
            x1={p1.x}
            x2={p2.x}
            y1={p1.y}
            y2={p2.y}
            stroke="#eee"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        })}
        {props.path.map((point, i) => {
          const p = w2vb(point)
          return <text
            key={i}
            x={p.x}
            y={p.y}
            vectorEffect="non-scaling-stroke"
          >
            {i}
          </text>
        })}
      </>}
      {gen(Math.floor(props.path.length / 2), i => {
        const p1 = w2vb(props.path[i * 2]), p2 = w2vb(props.path[i * 2 + 1])
        return <line
          key={i}
          x1={p1.x}
          x2={p2.x}
          y1={p1.y}
          y2={p2.y}
          stroke="#000"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      })}
    </svg>
  </div>
}