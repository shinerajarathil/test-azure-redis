const express = require("express");
const redis = require("redis");
const util = require("util");

const app = express();
const port = process.env.PORT || 4000;


app.listen(4000, ()=>{
    console.log("listening to the port 4000");
});

let cacheClient = null;
(async () => {
    cacheClient = await redis.createClient({
        connect_timeout: 5000,
       // url: `redis://localhost:6379`,
          url: `redis://content-service-test-cache-x7jbwq.serverless.use1.cache.amazonaws.com:6379`,
    });

    cacheClient.on("connect", () => {
        console.info(
            `cacheConnection-> Connected to caching server`,
            `cacheClient: ${JSON.stringify({
                address: cacheClient.address,
                attempts: cacheClient.attempts,
                connected: cacheClient.connected,
                timesConnected: cacheClient.times_connected,
            })}`,
        );
    });

    cacheClient.on("error", (err) => {
        console.error(
            `cacheConnection-> Caching connection error:`, err,
            `cacheClient: ${JSON.stringify({
                address: cacheClient.address,
                attempts: cacheClient.attempts,
                connected: cacheClient.connected,
                timesConnected: cacheClient.times_connected,
            })}`,
        );
    });
})();

async function Get(key) {
    try {
        console.info(`get_function_called`, `Key: ${key}`,
            `cacheClient: ${JSON.stringify({
                address: cacheClient.address,
                attempts: cacheClient.attempts,
                connected: cacheClient.connected,
                timesConnected: cacheClient.times_connected,
            })}`,
        );

        const getAsync = util.promisify(cacheClient.get).bind(cacheClient);
        console.info(
            `util_promisify_to_get_caching_function`,
            `Key: ${key}, getAsync: ${getAsync}`,
            `cacheClient: ${JSON.stringify({
                address: cacheClient.address,
                attempts: cacheClient.attempts,
                connected: cacheClient.connected,
                timesConnected: cacheClient.times_connected,
            })}`,
        );

        // const cacheData = await getAsync(key);
        let cacheData = "";
        await getAsync(key)
            .then((result) => {
                cacheData = result;
                console.info(
                    `caching_data`, `Key: ${key}, cacheData: ${cacheData}`,
                    `cacheClient: ${JSON.stringify({
                        address: cacheClient.address,
                        attempts: cacheClient.attempts,
                        connected: cacheClient.connected,
                        timesConnected: cacheClient.times_connected,
                    })}`,
                );
            }).catch((err) => {
                console.error(`get_caching_data_error_inside_then_catch: ${err}, ${key},`,
                    `cacheClient: ${JSON.stringify({
                        address: cacheClient.address,
                        attempts: cacheClient.attempts,
                        connected: cacheClient.connected,
                        timesConnected: cacheClient.times_connected,
                    })}`,
                );
            });

        return cacheData;
    } catch (error) {
        console.error(`get_caching_data_error: ${error}, ${key},`,
            `cacheClient: ${JSON.stringify({
                address: cacheClient.address,
                attempts: cacheClient.attempts,
                connected: cacheClient.connected,
                timesConnected: cacheClient.times_connected,
            })}`,
        );
        return null;
    }
}

async function Set(key, storeData,) {
    try {
        console.info(`set_function_called`, `Key: ${key}`,
            `cacheClient: ${JSON.stringify({
                address: cacheClient.address,
                attempts: cacheClient.attempts,
                connected: cacheClient.connected,
                timesConnected: cacheClient.times_connected,
            })}`,
        );

        const setAsync = util.promisify(cacheClient.set).bind(cacheClient);
        console.info(`util_promisify_to_set_caching_function`,
            `Key: ${key}, getAsync: ${setAsync} storeData: ${storeData}`,
            `cacheClient: ${JSON.stringify({
                address: cacheClient.address,
                attempts: cacheClient.attempts,
                connected: cacheClient.connected,
                timesConnected: cacheClient.times_connected,
            })}`,
        );

        await setAsync(key, storeData, "EX", 180);

        return true;
    } catch (error) {
        console.error(`set_caching_data_error: ${error}, ${key}`);
    }
}

app.post("/setCachingData", async (req, res)=>{
    const demoData = "This data is for testing caching implementation";
    await Set("demoKey", demoData);
    res.send("caching data set successfully");
});

app.get("/getCachingData", async (req, res) => {
    const cachingData = await Get("demoKey");
    if(cachingData){
        res.send(cachingData);
    } else{
        res.send("no data found");
    }
})



