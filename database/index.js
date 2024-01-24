import express from "express";
import morgan from "morgan";
import winston from 'winston';
import 'dotenv/config';
import cors from "cors";
import { MongoClient, ServerApiVersion } from 'mongodb';

const dburl = process.env.DATABASE_URL;
const app = express();
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'database.log' })
    ]
});

app.use(
    morgan(
        "combined", 
        { 
            stream: { write: (message) => logger.info(message) }
        }
    )
);
app.use(express.json());
app.use(express.urlencoded( {extended: true} ));
app.use(cors());

const client = await MongoClient.connect(dburl, {
    serverApi: ServerApiVersion.v1,
});

const db = client.db( 'database' );
const postsColl = db.collection( 'posts' );

async function readPosts() {
    try {
        const postsArr = await postsColl.find().toArray();
        logger.info(postsArr)
        return postsArr;
    } 
    catch (err) {
        logger.error(err.message);
    }
}

async function updatePosts(newPostsArr) {
    try {
        await postsColl.deleteMany();
        await postsColl.insertMany(newPostsArr);
    } 
    catch (err) {
        logger.error(err.message);
    }
}

app.post("/database/add", async (req, res) => {

    const post = req.body;

    try {
        const postsArr = await readPosts();
        postsArr.push(post)
        await updatePosts(postsArr)

        res.json( { status: "success" } );

    } catch (err) {
        logger.error(`(${process.pid}) Database Service: ${err}`);
        res.status(500).send({
            status: 'ERROR',
            message: err,
        });
    }
});

app.get("/database/get", async (req, res) => {

    let postsArr = [];

    try {
        postsArr = await readPosts();
        postsArr.forEach(post => {
            post.views++
        });
        await updatePosts( postsArr );

        res.json( postsArr );

    } catch (err) {
        logger.error(`(${process.pid}) Database Service: ${err}`);
        res.status(500).send({
            status: 'ERROR',
            message: err,
        });
    }
});

app.delete("/database/remove", async (req, res) => {

    const { id } = req.body;

    try {
        const postsArr = await readPosts();
        const index = postsArr.findIndex((post) => post.id == id);
        postsArr.splice(index, 1);
        await updatePosts(postsArr);

        res.json( { status: "success" } );

    } catch (err) {
        logger.error(`(${process.pid}) Database Service: ${err}`);
        res.status(500).send({
            status: 'ERROR',
            message: err,
        });
    }
});

app.post('/events', async (req, res) => {
    
    res.send({ status: 'OK' });
});

const port = process.env.PORT || 4002;

app.listen(port, () => {
    logger.info(`(${process.pid}) Database service started on port ${port}`);
});