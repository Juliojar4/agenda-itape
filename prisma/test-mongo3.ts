import { MongoClient } from "mongodb"
import tls from "tls"

// Try direct connection without SRV
const url = "mongodb://juliojaraitape01_db_user:cLNMZ3Wc6OEvEyBr@ac-mb5ftal-shard-00-00.tjai8o2.mongodb.net:27017,ac-mb5ftal-shard-00-01.tjai8o2.mongodb.net:27017,ac-mb5ftal-shard-00-02.tjai8o2.mongodb.net:27017/agenda_facil?authSource=admin&replicaSet=atlas-5rwkkb-shard-0&tls=true"

const client = new MongoClient(url, {
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
})

async function main() {
  await client.connect()
  const db = client.db("agenda_facil")
  const ping = await db.command({ ping: 1 })
  console.log("Ping result:", ping)
  await client.close()
}

main().catch(e => { console.error("Error:", e.message?.substring(0, 300)) })
