import express from "express";
import morgan from "morgan";
import winston from 'winston';
import cors from 'cors';

const app = express();
const servicePorts = [
    { name: 'posts', port: 4001 },
    { name: 'database', port: 4002 },
    { name: 'request-counter', port: 4003 },
];
/*
    { name: 'localhost', port: 4001 },
    { name: 'localhost', port: 4002 },
    { name: 'localhost', port: 4002 },
*/
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'event-bus.log' })
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

app.post('/events', async (req, res) => {
    const event = req.body;
  
    logger.info(`(${process.pid}) Event Bus (Received Event) ${event.type}`);
  
    for (const { name, port } of servicePorts) {
        try {
            logger.info(
                `(${process.pid}) Event Bus (Sending Event to ${port}) ${event.type}`
            );

            await fetch(`http://${name}:${port}/events`, {
                method: 'POST',
                body: JSON.stringify(event),
                headers: { 'Content-Type': 'application/json' },
            });
            
        } catch (err) {
            logger.error(err);
            res.send({ err: 'err' });
        }
    }

    res.send({ status: 'OK' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    logger.info(`(${process.pid}) Event-bus service started on port ${port}`);
});