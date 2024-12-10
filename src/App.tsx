import { useCallback, useEffect, useState } from 'react'
import style from './App.module.sass'
import classNames from 'classnames'
import { Canvas } from './Canvas'
import { Path } from './Path'

const letters: readonly string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?:;<>\\-_,.+=()/'*".split("")

function toCpp(paths: Readonly<Record<string, Path>>): string {
  let cpp = "std::unordered_map<char, std::vector<Vec2>> glyphs{\n"
  for (const [letter, path] of Object.entries(paths)) {
    cpp += `\t{ '\\x${letter.charCodeAt(0).toString(16)}', {`
    for (const point of path) {
      cpp += `{ ${point.x}, ${point.y} }, `
    }
    cpp += `}},\n`
  }
  cpp += "};"
  return cpp
}

function App() {
  const [activeLetter, setActiveLetter] = useState<string>(letters[0])
  const [paths, setPaths] = useState<Readonly<Record<string, Path>>>(Object.fromEntries(letters.map(letter => [letter, []])))

  const setActivePath = useCallback((setter: (path: Path) => Path) => {
    return setPaths(oldPaths => ({ ...oldPaths, [activeLetter]: setter(oldPaths[activeLetter]) }))
  }, [activeLetter])

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "v") {
        navigator.clipboard.readText().then(JSON.parse).then(paths => setPaths(oldPaths => ({ ...oldPaths, ...paths })))
      }
      else if (e.key === "c") {
        const json = JSON.stringify(paths)
        console.log(json)
        navigator.clipboard.writeText(json)
      }
      else if (e.key === "x") {
        setActivePath(() => [])
      }
      else if (e.key === "z") {
        setActivePath(oldPath => oldPath.slice(0, -1))
      }
      else if (e.key === "e") {
        navigator.clipboard.writeText(toCpp(paths))
      }
    }
    addEventListener("keyup", listener)
    return () => removeEventListener("keyup", listener)
  }, [setActivePath, paths])

  return <div className={style.root}>
    <div className={style.selector}>
      {letters.map(letter =>
        <div
          key={letter}
          onClick={() => setActiveLetter(letter)}
          className={classNames(style.letter, activeLetter === letter && style.active)}
        >
          <div className={style.text}>
            {letter}
          </div>
          <div className={style.length}>
            {paths[letter].length}
          </div>
          <div className={style.canvas}>
            <Canvas path={paths[letter]} size={30} />
          </div>
        </div>
      )}
    </div>
    <div className={style.editor}>
      <Canvas
        path={paths[activeLetter]}
        interactive
        size={400}
        gridSize={5}
        onClick={point => {
          setActivePath(oldPath => [...oldPath, point])
        }}
      />
    </div>
  </div>
}

export default App
