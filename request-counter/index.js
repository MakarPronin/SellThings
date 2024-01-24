import express from "express";
import morgan from "morgan";
import winston from 'winston';
import fs from "fs/promises";
import cors from "cors";

//{"postsEverExisted": 0, "postsNow": 0, "removedPosts": 0, "getRequests": 0}

const COUNTERS_FILE = "counters.json";
const app = express();
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'request-counter.log' })
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

/*
    This function returns a Promise of the current counters in a file.

    args:
    return: Promise({"postsEverExisted": Integer,"postsNow": Integer,"removedPosts": Integer,"getRequests": Integer})
*/
async function readCounters() {
    try {
        const data = await fs.readFile(COUNTERS_FILE, { encoding: 'utf8' });
        const counters = JSON.parse(data);
        return counters;
    } 
    catch (err) {
        logger.error(err.message);
    }
}

/*
    This function returns nothing but takes an object with counter to replace the current list
    stored in the file.

    args: Object({"postsEverExisted": Integer,"postsNow": Integer,"removedPosts": Integer,"getRequests": Integer})
    return: undefined
*/
async function updateCounters(newCounters) {
    try {
        await fs.writeFile(COUNTERS_FILE, JSON.stringify(newCounters), { encoding: 'utf8' });
    } 
    catch (err) {
        logger.error(err.message);
    }
}

app.post('/events', async (req, res) => {
    const event = req.body;
  
    logger.info(`(${process.pid} request-counter received Event ${event.type}`);

    const counters = await readCounters()
    if ( event.type == "PostAdded" ) {
        counters.postsEverExisted += 1;
        counters.postsNow += 1;
        await updateCounters(counters);
    }
    else if ( event.type == "GetPosts" ) {
        counters.getRequests += 1;
        await updateCounters(counters);
    }
    else if ( event.type == "PostRemoved" ) {
        counters.postsNow -= 1;
        counters.removedPosts += 1;
        await updateCounters(counters);
    }
  
    res.send({ status: 'OK' });
});

const port = process.env.PORT || 4003;
app.listen(port, () => {
    logger.info(`(${process.pid}) request-counter service started on port ${port}`);
});