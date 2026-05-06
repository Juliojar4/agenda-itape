import { MongoClient } from "mongodb"

const url = process.env.MONGODB_URL!

const client = new MongoClient(url, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  ssl: true,
  checkServerIdentity: () => undefined,
  serverApi: undefined,
})

async function main() {
  await client.connect()
  const db = client.db("agenda_facil")
  const ping = await db.command({ ping: 1 })
  console.log("Ping result:", ping)
  await client.close()
}

main().catch(e => { console.error("Error:", e.code, e.message?.substring(0, 200)) })
