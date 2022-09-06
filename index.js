import http from 'http'
import ModbusRTU from 'modbus-serial'
import { Gpio as gpio } from 'onoff'

let has_init = false
const init_waveshare_hat = () => {
  if (has_init) return
  new gpio(27, 'out').writeSync(1)
  new gpio(22, 'out').writeSync(1)
  has_init = true
}

const test = async params => {
  let close = () => {}
  try {
    init_waveshare_hat()
    const client = new ModbusRTU()
    close = () => {
      try {
        client.close()
      }
      catch (e) {
        console.error('error closing modbus client', e)
      }
    }
    client.setTimeout(500)
    await client.connectRTUBuffered(params.device, {
      baudRate: params.baudRate,
      parity: params.parity,
      dataBits: params.dataBits,
      stopBits: params.stopBits
    })
    await client.setID(128)

    const { buffer: data1 } = await client.readHoldingRegisters(2006, 8)
    data1.swap16()

    const { buffer: data2 } = await client.readHoldingRegisters(2609, 2)
    data2.swap16()

    const volume = data1.readFloatLE()
    const total = data2.readFloatLE()
    close()
    return {
      success: true,
      data: { volume, total }
    }
  }
  catch (error) {
    console.error(error)
    close()
    return {
      success: false,
      error
    }
  }
}

const test_standard = () => test({
  device: '/dev/ttySC0',
  baudRate: 19200,
  parity: 'even',
  dataBits: 8,
  stopBits: 1
})

const test_1200 = () => test({
  device: '/dev/ttySC0',
  baudRate: 1200,
  parity: 'even',
  dataBits: 8,
  stopBits: 1
})

const server = http.createServer(async (req, res) => {
  if (req.url == '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(`<html>
      <head>
        <meta charset="utf-8">
      </head>
      <style>
        body, html {
          font-family: sans-serif;
          margin: 0;
          padding: 0;
          background-color: black;
        }
        body {
          padding: 10px;
        }
        a {
          display: flex;
          justify-content: center;
          height: 50px;
          width: 270px;
          margin: 10px;
          align-items: center;
          text-align: center;
          text-transform: uppercase;
          text-decoration: none;
          font-family: sans-serif;
          font-weight: bold;
          background-color: white;
          color: #333;
        }
      </style>
      <body>
        <a id="test_standard" href="#">Promag 400 — Standard</a>
        <a id="test_1200" href="#">Promag 400 — 1200 baud</a>
      </body>
      <script>
        const body = document.querySelector('body')
        let handle = null
        const test = async url => {
          clearTimeout(handle)
          body.style.backgroundColor = 'orange'
          const res = await fetch(url)
          const content = await res.json()
          if (content.success) {
            body.style.backgroundColor = 'green'
            handle = setTimeout(() => {
              body.style.backgroundColor = 'black'
            }, 2000)
            alert(JSON.stringify(content.data))
          }
          else {
            body.style.backgroundColor = 'red'
            handle = setTimeout(() => {
              body.style.backgroundColor = 'black'
            }, 2000)
            setTimeout(() => {
              alert(JSON.stringify(content.error))
            }, 100)
          }
        }
        document.getElementById('test_standard').addEventListener('click', async e => {
          e.preventDefault()
          await test('/test_standard')
        })
        document.getElementById('test_1200').addEventListener('click', async e => {
          e.preventDefault()
          await test('/test_1200')
        })
      </script>
      </html>`)
    return res.end()
  }

  if (req.url == '/test_standard') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(await test_standard()))
  }

  if (req.url == '/test_1200') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify(await test_1200()))
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('404 Not Found')
})
server.listen(5678, '0.0.0.0')

console.log('Blue web server at port 5678 is running..')


