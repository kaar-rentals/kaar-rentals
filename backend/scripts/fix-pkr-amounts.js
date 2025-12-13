/**
 * Cursor-friendly Node script
 *
 * Purpose:
 * - Detect payments that look like they were stored in RUPEES instead of PAISE.
 * - Dry-run by default: prints suggested fixes.
 * - If run with --apply it will:
 *    1) back up affected docs to payments_backup_<timestamp>
 *    2) update requestedAmountInPaise = requestedAmountInPaise * 100
 *
 * Usage examples:
 *   node fix-pkr-amounts.js              # dry-run (safe)
 *   node fix-pkr-amounts.js --apply     # actually apply suggested fixes
 *   node fix-pkr-amounts.js --id 68ef3daa9faddf33d6addbc3  # only for one doc (dry-run)
 *   node fix-pkr-amounts.js --apply --id 68ef3daa9faddf33d6addbc3  # apply for that id
 *   node fix-pkr-amounts.js --apply --all  # check all statuses (be careful)
 *
 * Notes:
 * - Set MONGO_URI env var before running, otherwise falls back to mongodb://localhost:27017/kaar
 * - Edit COLLECTION_NAME if your payments are in a different collection.
 */

const { MongoClient, ObjectId } = require("mongodb");

(async function main() {
  const args = process.argv.slice(2);
  const APPLY = args.includes("--apply");
  const ALL_STATUSES = args.includes("--all");
  const idIndex = args.indexOf("--id");
  const SINGLE_ID = idIndex !== -1 ? args[idIndex + 1] : null;

  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kaar";
  const DB_NAME = process.env.DB_NAME || "kaar"; // change if your DB name differs
  const COLLECTION_NAME = process.env.COLLECTION_NAME || "payments"; // change if needed

  const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    console.log("Connecting to MongoDB:", MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION_NAME);

    // Build base filter
    let filter = { currency: "PKR" }; // target PKR payments
    if (!ALL_STATUSES) {
      filter.status = "PENDING"; // safer default
    }
    if (SINGLE_ID) {
      try {
        filter._id = new ObjectId(SINGLE_ID);
      } catch (e) {
        // allow string _id if not ObjectId
        filter._id = SINGLE_ID;
      }
    }

    // Only consider docs that have the field requestedAmountInPaise and it's a number
    filter.requestedAmountInPaise = { $exists: true, $type: "number" };

    console.log("Query filter:", JSON.stringify(filter, null, 2));
    const cursor = col.find(filter).limit(1000); // safety limit

    const toUpdate = [];
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      const { _id, requestedAmountInPaise } = doc;

      const asPaise = Number(requestedAmountInPaise);
      const treatedAsPaiseToPKR = (asPaise / 100);
      const treatedAsRupeesToPaise = asPaise * 100;

      const suspicious = asPaise > 0 && asPaise < 1000 && treatedAsRupeesToPaise >= 1000;

      console.log("------------------------------------------------------------");
      console.log("id:", _id.toString ? _id.toString() : _id);
      console.log("requestedAmountInPaise (raw):", asPaise);
      console.log("interpreted as paise -> PKR:", treatedAsPaiseToPKR.toFixed(2));
      console.log("interpreted as RUPEES -> paise:", treatedAsRupeesToPaise);
      console.log("suspicious (candidate for *100):", suspicious ? "YES" : "no");

      const extraSafety = (doc.webhookReceived === false || doc.webhookReceived === undefined) && doc.status === "PENDING";

      if (suspicious && extraSafety) {
        toUpdate.push({
          _id: doc._id,
          original: doc,
          newRequestedAmountInPaise: treatedAsRupeesToPaise,
        });
      } else if (suspicious && !extraSafety) {
        console.log("  → suspicious but failed extra-safety checks (webhookReceived/status). Skipping suggestion.");
      } else {
        console.log("  → looks fine or not suspicious.");
      }
    }

    console.log("\nSUMMARY:");
    console.log("Candidates for fix:", toUpdate.length);
    if (toUpdate.length === 0) {
      console.log("No suspicious PKR entries found with the current filter/heuristics.");
      console.log("If you expected a different result, try: --all or --id <PAYMENT_ID>");
      await client.close();
      return;
    }

    // Print details
    toUpdate.forEach((t, i) => {
      console.log(`\n[${i + 1}] _id=${t._id.toString ? t._id.toString() : t._id}`);
      console.log("  original requestedAmountInPaise:", t.original.requestedAmountInPaise);
      console.log("  suggested requestedAmountInPaise:", t.newRequestedAmountInPaise);
      console.log("  original interpreted (PKR):", (t.original.requestedAmountInPaise / 100).toFixed(2));
      console.log("  suggested interpreted (PKR):", (t.newRequestedAmountInPaise / 100).toFixed(2));
    });

    if (!APPLY) {
      console.log("\nDRY-RUN complete. No changes applied.");
      console.log("To apply these fixes run this script with the --apply flag.");
      await client.close();
      return;
    }

    // APPLY: create backup collection and update
    const backupName = `payments_backup_${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const backupCol = db.collection(backupName);
    console.log("\nAPPLYING fixes — creating backup collection:", backupName);

    // Insert originals into backup
    const originals = toUpdate.map(t => t.original);
    const insertRes = await backupCol.insertMany(originals);
    console.log(`Backed up ${insertRes.insertedCount} documents.`);

    // Perform updates
    for (const t of toUpdate) {
      const q = { _id: t._id };
      const u = {
        $set: {
          requestedAmountInPaise: t.newRequestedAmountInPaise,
          updatedAt: new Date(),
        },
        $push: {
          audit: {
            when: new Date(),
            by: "fix-pkr-amounts-script",
            note: "Converted stored rupees -> paise (multiplied by 100) based on heuristic.",
            previousRequestedAmountInPaise: t.original.requestedAmountInPaise,
          },
        },
      };
      const res = await col.updateOne(q, u);
      console.log(`Updated _id=${t._id.toString ? t._id.toString() : t._id} -> matched:${res.matchedCount} modified:${res.modifiedCount}`);
    }

    console.log("\nALL DONE. Exiting.");
    await client.close();
  } catch (err) {
    console.error("Fatal error:", err);
    try { await client.close(); } catch (e) {}
    process.exit(1);
  }
})();


