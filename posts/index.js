import express from "express";
import morgan from "morgan";
import winston from 'winston';
import cors from "cors";
import { randomBytes } from 'crypto';

const app = express();
const names = ["database", "event-bus"] //["localhost", "localhost"]
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'posts.log' })
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

app.post("/posts/add", async (req, res) => {

    const id = randomBytes(4).toString('hex');
    const views = 0;
    const { imgUrl, price, description } = req.body;

    try {
        await fetch(`http://${names[0]}:4002/database/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, views, imgUrl, price, description })
        });

        await fetch(`http://${names[1]}:4000/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'PostAdded' }),
        });

        res.json( { status: "success" } );
    } catch (err) {
        logger.error(`(${process.pid}) Posts Service: ${err}`);
        res.status(500).send({
            status: 'ERROR',
            message: err,
        });
    }
});

app.get("/posts/get", async (req, res) => {

    let posts = [];

    try {
        const response = await fetch(`http://${names[0]}:4002/database/get`, {
            method: 'GET'
        });

        posts = await response.json();

        await fetch(`http://${names[1]}:4000/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'GetPosts' }),
        });

        res.json(posts);

    } catch (err) {
        logger.error(`(${process.pid}) Posts Service: ${err}`);
        res.status(500).send({
            status: 'ERROR',
            message: err,
        });
    }
});

app.delete("/posts/remove", async (req, res) => {

    const { id } = req.body;

    try {
        await fetch(`http://${names[0]}:4002/database/remove`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        await fetch(`http://${names[1]}:4000/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'PostRemoved' }),
        });

        res.json( { status: "success" } );

    } catch (err) {
        logger.error(`(${process.pid}) Posts Service: ${err}`);
        res.status(500).send({
            status: 'ERROR',
            message: err,
        });
    }
});

app.post('/events', async (req, res) => {
    
    res.send({ status: 'OK' });
});

const port = process.env.PORT || 4001;

app.listen(port, () => {
    logger.info(`(${process.pid}) Posts service started on port ${port}`);
});