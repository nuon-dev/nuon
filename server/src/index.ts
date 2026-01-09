import fs from "fs"
import cors from "cors"
import https from "https"
import express from "express"
import apiRouter from "./routes"
import bodyParser from "body-parser"
import dataSource from "./model/dataSource"
import cookieParser from "cookie-parser"

const app = express()
let port = 8000

app.use(bodyParser.json())
app.use(cookieParser())
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "https://nuon.iubns.net",
      "https://nuon-dev.iubns.net",
    ],
    credentials: true,
  })
)
app.use("/", apiRouter)

const target = process.env.NEXT_PUBLIC_API_TARGET

var server

if (target === "local") {
  server = app
} else if (target === "dev") {
  port = 8001
  var privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/nuon-dev.iubns.net/privkey.pem"
  )
  var certificate = fs.readFileSync(
    "/etc/letsencrypt/live/nuon-dev.iubns.net/cert.pem"
  )
  var ca = fs.readFileSync("/etc/letsencrypt/live/nuon-dev.iubns.net/chain.pem")
  const credentials = { key: privateKey, cert: certificate, ca: ca }

  server = https.createServer(credentials, app)
} else if (target === "prod") {
  var privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/nuon.iubns.net/privkey.pem"
  )
  var certificate = fs.readFileSync(
    "/etc/letsencrypt/live/nuon.iubns.net/cert.pem"
  )
  var ca = fs.readFileSync("/etc/letsencrypt/live/nuon.iubns.net/chain.pem")
  const credentials = { key: privateKey, cert: certificate, ca: ca }

  server = https.createServer(credentials, app)
}

server.listen(port, async () => {
  await Promise.all([dataSource.initialize()])
  console.log("start server")
})

app.get("/", async (req, res) => {
  res.send("running server")
})
