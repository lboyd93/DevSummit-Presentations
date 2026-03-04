/**
 * Node.js server app used to demonstrate a server-based process for generating ArcGIS application tokens
 * and handing them out to client apps. See README for details how this app works.
 * Run this with `npm start`.
 */
const esriAppAuth = require("./auth")
const fs = require("fs")
const path = require("path")
const Express = require("express")
const ClientSession = require("express-session")
const FileStore = require("session-file-store")(ClientSession)
const CORS = require("cors")
const webServer = Express()
require("dotenv").config()
const configuration = require("./server-configuration.json")

const http = require("http")
const https = require("https")

const port = process.env.PORT || 3080
webServer.use(CORS())
webServer.use(Express.json())
webServer.use(Express.urlencoded({ extended: true }))

if (!process.env.SESSION_SECRET) {
  console.error(
    "Missing SESSION_SECRET. Set it in .env (and keep it secret)."
  )
  process.exit(1)
}

if (!process.env.ENCRYPTION_KEY) {
  console.error("Missing ENCRYPTION_KEY. Set it in .env.")
  process.exit(1)
}

/**
 * Add some logic to the app to make sure a client calling this endpoint is authorized to do so.
 * Typical methods are to verify CORS, origin of request, and including a session_id. For example,
 * use express-session https://www.npmjs.com/package/express-session to save a session id, and
 * then make sure the client requesting the token is the same one that was assigned the matching session id.
 * @returns {boolean} True when authorized to call this endpoint.
 */
function isClientAuthorized(request) {
  // verify the correct session id is in the request.
  const nonce = request.body.nonce
  return nonce == "1234"
}

/**
 * Create a session handler to make sure the requesting client
 * securely gets the session information.
 */
var clientSession = ClientSession({
  name: "arcgis-client-session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: configuration.tokenExpirationMinutes * 60000, // convert minutes to milliseconds
  },

  // store session data in a secure, encrypted file
  // sessions will be loaded from these files and decrypted
  // at the end of every request the state of `request.session`
  // will be saved back to disk.
  store: new FileStore({
    ttl: configuration.tokenExpirationMinutes * 60, // convert minutes to seconds
    retries: 1,
    secret: process.env.ENCRYPTION_KEY,
  }),
})
webServer.use(clientSession)

/**
 * Define the /auth route to get a token.
 */
webServer.post("/auth", function (request, response) {
  if (!isClientAuthorized(request)) {
    response.send(esriAppAuth.errorResponse(403, "Unauthorized."))
    return
  }

  const forceRefresh = (request.body.force || "0") == "1"
  esriAppAuth
    .getToken(forceRefresh)
    .then(function (token) {
      response.json(token)
      console.log("Giving a token to " + request.headers["referer"])
    })
    .catch(function (error) {
      response.json(error)
    })
})

function createServer() {
  const sslKeyPath = process.env.SSL_KEY_PATH
  const sslCertPath = process.env.SSL_CERT_PATH

  if (sslKeyPath && sslCertPath) {
    const resolvedKeyPath = path.resolve(sslKeyPath)
    const resolvedCertPath = path.resolve(sslCertPath)
    const privateKey = fs.readFileSync(resolvedKeyPath, "utf8")
    const certificate = fs.readFileSync(resolvedCertPath, "utf8")
    return {
      protocol: "https",
      server: https.createServer({ key: privateKey, cert: certificate }, webServer),
    }
  }

  return {
    protocol: "http",
    server: http.createServer(webServer),
  }
}

const { protocol, server } = createServer()
server.listen(port)
console.log(`Token service is listening on ${protocol}://localhost:${port}`)
