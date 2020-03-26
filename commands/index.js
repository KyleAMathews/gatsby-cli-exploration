import React, { useContext, useState, useEffect } from "react"
import { Box, Text, Color, StdinContext, StdoutContext } from "ink"
import { useMachine } from "@xstate/react"
import { Machine } from "xstate"
const open = require("open")

const toggleMachine = Machine({
  id: "cli",
  initial: "idle",
  on: {
    RETURN_TO_IDLE: `idle`,
  },
  states: {
    idle: {
      id: "idle",
      states: {},
      on: {
        KEYPRESS_o: `OpeningLink`,
        r: "#Restart",
      },
    },
    OpeningLink: {
      states: {},
      on: {
        KEYPRESS_s: {
          target: `idle`,
          actions: `openLink`,
        },
      },
    },
    Restart: {
      id: "Restart",
      states: {},
      on: { no: "#idle", yes: "#Restarting" },
    },
    Restarting: { id: "Restarting", states: {} },
  },
  actions: {
    openLink: (context, event) => {
      open(`http://localhost:8001`)
    },
  },
})

const useKeyHandler = keyHandler => {
  const { stdin, setRawMode } = useContext(StdinContext)

  useEffect(() => {
    setRawMode(true)
    stdin.on("data", keyHandler)
    return () => {
      stdin.off("data", keyHandler)
      setRawMode(false)
    }
  }, [stdin, setRawMode])
}

const useTerminalResize = () => {
  const { stdout } = useContext(StdoutContext)
  const [sizes, setSizes] = useState([stdout.columns, stdout.rows])
  useEffect(() => {
    stdout.on("resize", () => {
      setSizes([stdout.columns, stdout.rows])
    })
    return () => {
      stdout.off("resize")
    }
  }, [stdout])

  return sizes
}

// Ideas
// state machine — press command and ask for confirmation at bottom
// shortcuts — "o" then "s" to open site. "o" then "g" to open graphql, etc.
// could highlight links when click o for example

const Header = ({ children }) => (
  <Box>
    <Color bgBlue black>
      {children}
    </Color>
  </Box>
)

const Error = ({ children }) => (
  <Color bgRed black>
    {children}
  </Color>
)
const Warning = ({ children }) => (
  <Color bgYellow black>
    {children}
  </Color>
)

const CLI = props => {
  const [current, send, service] = useMachine(toggleMachine)
  // Run any actions
  current.actions.forEach(action => {
    if (action.type === `openLink`) {
      open(`http://localhost:8001`)
    }
    // service.actions[action.type](current.context, current.event)
  })

  const [lastKey, setKey] = useState(``)
  useKeyHandler(keypress => {
    // Work around xstate's lack of catch all
    if (current.value === `OpeningLink` && keypress !== `s`) {
      send(`RETURN_TO_IDLE`)
    } else {
      send(`KEYPRESS_${keypress}`)
    }

    setKey(keypress)
  })
  const [width, height] = useTerminalResize()

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box flexDirection="row" justifyContent="space-between">
        <Box flex={2} flexDirection="column">
          <Error>errors</Error>
          <Warning>warnings</Warning>
          <Box flex={1}>
            width: {width}, height: {height}
          </Box>
          <Box>Last key ({lastKey})</Box>
          <Box>Toggle: {JSON.stringify(current.value, null, 4)}</Box>
        </Box>
        <Box flex={1} flexDirection="column">
          <Header>Links</Header>
          <Box>https://localhost:8000</Box>
          <Box>https://localhost:8000/___graphql</Box>
          <Box>{` `}</Box>
          <Header>Commands</Header>
          <Box>[r] restart "gatsby develop" process</Box>
          <Box>[o] open links</Box>
          <Box>[s] shadow theme components</Box>
        </Box>
      </Box>
      <Box>{` `}</Box>
      <Box>{` `}</Box>
      <Box textWrap={`truncate`}>{"—".repeat(width)}</Box>
      <Box height={1} flexDirection="row">
        <Color bgGreen black>
          RESTART NEEDED [r]
        </Color>
        {` | `}
        <Error>1 error</Error>
        {` | `}
        <Warning>2 warnings</Warning>
        {` | `}
        <Color>117 pages</Color>
        <Box flexGrow={1} />
        <Color>Kyle's cool blog</Color>
      </Box>
    </Box>
  )
}

export default CLI
