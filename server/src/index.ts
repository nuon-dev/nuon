import fs from "fs"
import cors from "cors"
import https from "https"
import express from "express"
import apiRouter from "./routes"
import bodyParser from "body-parser"
import dataSource from "./model/dataSource"
import cookieParser from "cookie-parser"

const app = express()
const port = 8000

app.use(bodyParser.json())
app.use(cookieParser())
app.use(
  cors({
    origin: ["http://localhost:8080", "https://nuon.iubns.net"],
    credentials: true,
  })
)
app.use("/", apiRouter)

const is_dev = process.env.NODE_ENV === "development"

var server

if (is_dev) {
  server = app
} else {
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
  //dataSource.dropDatabase()
  console.log("start server")
})

app.get("/", async (req, res) => {
  res.send("running server")
})
