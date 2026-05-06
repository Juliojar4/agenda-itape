import { MongoClient } from "mongodb"

const url = process.env.MONGODB_URL!

const client = new MongoClient(url, {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
})

async function main() {
  await client.connect()
  const db = client.db("agenda_facil")
  const ping = await db.command({ ping: 1 })
  console.log("Ping result:", ping)
  const collections = await db.listCollections().toArray()
  console.log("Collections:", collections.map((c: any) => c.name))
  await client.close()
}

main().catch(e => console.error("Error:", e.message))
