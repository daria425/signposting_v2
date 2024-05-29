require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

async function getLevel2Options() {
  try {
    await client.connect();
    const db = client.db("signposting_db");
    const collection = db.collection("tags");
    const allTags = await collection.distinct("Tag");

    return allTags;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

async function getNationalOptions(tag, page, pageSize = 5) {
  try {
    await client.connect();
    const db = client.db("signposting_db");
    const collection = db.collection("support_options");
    const projection = {
      "Name": 1,
      "Postcode": 1,
      "Local / National": 1,
      "Website": 1,
      "Email": 1,
      "Phone - call": 1,
      "Category tags": 1,
      "Logo-link": 1,
      "Short text description": 1,
      "longitude": 1,
      "latitude": 1,
    };
    const foundOptions = await collection.aggregate([
      {
        $facet: {
          meta: [
            {
              $match: {
                $and: [
                  { "Category tags": tag },
                  { "Local / National": "National" },
                ],
              },
            },
            { $count: "totalCount" },
          ],
          results: [
            {
              $match: {
                $and: [
                  { "Category tags": tag },
                  { "Local / National": "National" },
                ],
              },
            },
            { $skip: (parseInt(page) - 1) * pageSize },
            { $limit: pageSize },
            { $project: projection },
          ],
        },
      },
    ]);
    const taggedOptions = await foundOptions.toArray();
    taggedOptions[0].page = page;
    const totalCount = taggedOptions[0].meta[0].totalCount;
    taggedOptions[0].remaining = totalCount - pageSize * page;
    return taggedOptions;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

async function getLocalOptions(tag, page = 1, pageSize = 5) {
  try {
    await client.connect();
    const db = client.db("signposting_db");
    const collection = db.collection("support_options");
    const projection = {
      "Name": 1,
      "Postcode": 1,
      "Local / National": 1,
      "Website": 1,
      "Email": 1,
      "Phone - call": 1,
      "Category tags": 1,
      "Logo-link": 1,
      "Short text description": 1,
      "longitude": 1,
      "latitude": 1,
    };
    const foundOptions = await collection.aggregate([
      {
        $facet: {
          meta: [
            {
              $match: {
                $and: [
                  { "Category tags": tag },
                  { "Local / National": "Local" },
                ],
              },
            },
            { $count: "totalCount" },
          ],
          results: [
            {
              $match: {
                $and: [
                  { "Category tags": tag },
                  { "Local / National": "Local" },
                ],
              },
            },
            { $skip: (parseInt(page) - 1) * pageSize },
            { $limit: pageSize },
            { $project: projection },
          ],
        },
      },
    ]);
    const taggedOptions = await foundOptions.toArray();
    taggedOptions[0].page = page;
    const totalCount = taggedOptions[0].meta[0].totalCount;
    taggedOptions[0].remaining = totalCount - pageSize * page;
    return taggedOptions;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

async function getLocalAndNationalOptions(tag, page = 1, pageSize = 5) {
  try {
    await client.connect();
    const db = client.db("signposting_db");
    const collection = db.collection("support_options");
    const projection = {
      "Name": 1,
      "Postcode": 1,
      "Local / National": 1,
      "Website": 1,
      "Email": 1,
      "Phone - call": 1,
      "Category tags": 1,
      "Logo-link": 1,
      "Short text description": 1,
      "longitude": 1,
      "latitude": 1,
    };
    const foundOptions = await collection.aggregate([
      {
        $facet: {
          meta: [
            {
              $match: {
                $and: [
                  { "Category tags": tag },
                  { "Local / National": { $in: ["Local", "National"] } },
                ],
              },
            },
            { $count: "totalCount" },
          ],
          results: [
            {
              $match: {
                $and: [
                  { "Category tags": tag },
                  { "Local / National": { $in: ["Local", "National"] } },
                ],
              },
            },
            { $skip: (parseInt(page) - 1) * pageSize },
            { $limit: pageSize },
            { $project: projection },
          ],
        },
      },
    ]);
    const taggedOptions = await foundOptions.toArray();
    taggedOptions[0].page = page;
    const totalCount = taggedOptions[0].meta[0].totalCount;
    taggedOptions[0].remaining = totalCount - pageSize * page;
    return taggedOptions;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

async function findTags(Level1Option) {
  try {
    await client.connect();
    const db = client.db("signposting_db");
    const collection = db.collection("tags");
    const projection = {
      "_id": 0,
      "Tag": 1,
    };
    const cursor = await collection
      .find({ "Level 1": Level1Option })
      .project(projection);
    const nextOptions = await cursor.toArray();
    return nextOptions;
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}

async function selectOptions(tag, location, page, pageSize) {
  const locationFunctions = {
    "national only": getNationalOptions,
    "local only": getLocalOptions,
    "local and national": getLocalAndNationalOptions,
  };

  if (locationFunctions[location]) {
    const result = await locationFunctions[location](tag, page, pageSize);
    console.log(result);
    const remaining = result[0].remaining;
    return {
      result: result[0].results,
      remaining: remaining,
    };
  }
}
module.exports = {
  findTags,
  getLevel2Options,
  selectOptions,
};
